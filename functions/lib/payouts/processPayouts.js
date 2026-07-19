"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualPayout = exports.processPayouts = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const config_1 = require("../config");
const stripeSecret = (0, params_1.defineSecret)('STRIPE_SECRET_KEY');
exports.processPayouts = (0, scheduler_1.onSchedule)({ schedule: 'every monday 09:00', timeZone: 'Asia/Manila', secrets: [stripeSecret] }, async (event) => {
    const now = config_1.Timestamp.now();
    const weekAgo = new Date(now.toDate().getTime() - 7 * 24 * 60 * 60 * 1000);
    // Get confirmed bookings that have been settled but not yet paid out
    const snapshot = await config_1.db.collection('bookings')
        .where('status', '==', 'confirmed')
        .where('paymentStatus', '==', 'PAID')
        .where('settledAt', '>=', config_1.Timestamp.fromDate(weekAgo))
        .where('payoutStatus', '==', 'pending')
        .get();
    if (snapshot.empty) {
        console.log('No bookings to process for payout');
        return;
    }
    // Group by business
    const byBusiness = new Map();
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        const bid = data.businessId || 'unknown';
        if (!byBusiness.has(bid)) {
            byBusiness.set(bid, { bookings: [], total: 0 });
        }
        const entry = byBusiness.get(bid);
        entry.bookings.push(doc);
        entry.total += (data.totalPrice || data.amount || 0);
    });
    const batch = config_1.db.batch();
    for (const [businessId, data] of byBusiness) {
        const businessDoc = await config_1.db.collection('businesses').doc(businessId).get();
        if (!businessDoc.exists)
            continue;
        const business = businessDoc.data();
        const commissionRate = (business.commissionRate ?? config_1.DEFAULT_COMMISSION_RATE) / 100;
        const commission = Math.round(data.total * commissionRate);
        const netAmount = data.total - commission;
        // Create payout record
        const payoutRef = config_1.db.collection('payouts').doc();
        batch.set(payoutRef, {
            businessId,
            businessName: business.name || businessId,
            periodStart: config_1.Timestamp.fromDate(weekAgo),
            periodEnd: now,
            grossAmount: data.total,
            commission,
            commissionRate: business.commissionRate ?? config_1.DEFAULT_COMMISSION_RATE,
            netAmount,
            status: 'pending', // LGU reviews before processing
            bookingCount: data.bookings.length,
            bookingIds: data.bookings.map(d => d.id),
            createdAt: now,
            stripeAccountId: business.stripeAccountId || null,
        });
        // Mark bookings as paid out
        data.bookings.forEach(doc => {
            batch.update(doc.ref, { payoutStatus: 'processed', payoutId: payoutRef.id });
        });
        // Record platform revenue
        await config_1.db.collection('platform_revenue').add({
            bookingIds: data.bookings.map(d => d.id),
            businessId,
            commission,
            platformFee: data.bookings.reduce((sum, d) => {
                const b = d.data();
                return sum + (b.platformFee || 0);
            }, 0),
            total: commission + data.bookings.reduce((sum, d) => {
                const b = d.data();
                return sum + (b.platformFee || 0);
            }, 0),
            period: now.toDate().toISOString().slice(0, 7),
            createdAt: now,
        });
    }
    await batch.commit();
    console.log(`Processed payouts for ${byBusiness.size} businesses`);
});
// Also allow LGU to manually trigger payouts
exports.manualPayout = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const token = authHeader.split('Bearer ')[1];
        const admin = await Promise.resolve().then(() => __importStar(require('firebase-admin')));
        const decodedToken = await admin.auth().verifyIdToken(token);
        // Only LGU can manually trigger
        const userDoc = await config_1.db.collection('users').doc(decodedToken.uid).get();
        if (!userDoc.exists || userDoc.data()?.role !== 'LGU') {
            res.status(403).json({ error: 'Only LGU can trigger payouts' });
            return;
        }
        const { businessId } = req.body;
        const now = config_1.Timestamp.now();
        let query = config_1.db.collection('bookings')
            .where('status', '==', 'confirmed')
            .where('paymentStatus', '==', 'PAID')
            .where('payoutStatus', '==', 'pending');
        if (businessId) {
            query = query.where('businessId', '==', businessId);
        }
        const snapshot = await query.get();
        if (snapshot.empty) {
            res.json({ message: 'No pending payouts', count: 0 });
            return;
        }
        // Group by business
        const byBusiness = new Map();
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const bid = data.businessId || 'unknown';
            if (!byBusiness.has(bid)) {
                byBusiness.set(bid, { bookings: [], total: 0 });
            }
            const entry = byBusiness.get(bid);
            entry.bookings.push(doc);
            entry.total += (data.totalPrice || data.amount || 0);
        });
        const batch = config_1.db.batch();
        for (const [bid, data] of byBusiness) {
            const bizDoc = await config_1.db.collection('businesses').doc(bid).get();
            const biz = bizDoc.data();
            const commissionRate = (biz?.commissionRate ?? config_1.DEFAULT_COMMISSION_RATE) / 100;
            const commission = Math.round(data.total * commissionRate);
            const netAmount = data.total - commission;
            const payoutRef = config_1.db.collection('payouts').doc();
            batch.set(payoutRef, {
                businessId: bid,
                businessName: biz?.name || bid,
                periodStart: now,
                periodEnd: now,
                grossAmount: data.total,
                commission,
                commissionRate: biz?.commissionRate ?? config_1.DEFAULT_COMMISSION_RATE,
                netAmount,
                status: 'pending',
                bookingCount: data.bookings.length,
                bookingIds: data.bookings.map(d => d.id),
                createdAt: now,
                triggeredBy: decodedToken.uid,
            });
            data.bookings.forEach(doc => {
                batch.update(doc.ref, { payoutStatus: 'processed', payoutId: payoutRef.id });
            });
        }
        await batch.commit();
        res.json({ message: 'Payouts created', businessCount: byBusiness.size, bookingCount: snapshot.docs.length });
    }
    catch (error) {
        console.error('manualPayout error:', error);
        res.status(500).json({ error: error.message });
    }
});
//# sourceMappingURL=processPayouts.js.map