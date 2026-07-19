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
exports.resolveDispute = exports.onDisputeCreated = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const config_1 = require("../config");
exports.onDisputeCreated = (0, firestore_1.onDocumentCreated)('disputes/{disputeId}', async (event) => {
    const dispute = event.data?.data();
    if (!dispute)
        return;
    // Notify LGU of new dispute
    await config_1.db.collection('audit_logs').add({
        actorUid: dispute.touristUid || 'system',
        actorName: 'System',
        action: 'dispute.created',
        resource: 'disputes',
        resourceId: event.params.disputeId,
        details: `Dispute created for booking ${dispute.bookingId}`,
        timestamp: config_1.Timestamp.now(),
    });
});
exports.resolveDispute = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const token = authHeader.split('Bearer ')[1];
    try {
        const admin = await Promise.resolve().then(() => __importStar(require('firebase-admin')));
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userDoc = await config_1.db.collection('users').doc(decodedToken.uid).get();
        if (!userDoc.exists || userDoc.data()?.role !== 'LGU') {
            res.status(403).json({ error: 'Only LGU can resolve disputes' });
            return;
        }
        const { disputeId, resolution, refundTourist } = req.body;
        if (!disputeId || !resolution) {
            res.status(400).json({ error: 'disputeId and resolution required' });
            return;
        }
        const disputeRef = config_1.db.collection('disputes').doc(disputeId);
        const disputeSnap = await disputeRef.get();
        if (!disputeSnap.exists) {
            res.status(404).json({ error: 'Dispute not found' });
            return;
        }
        const dispute = disputeSnap.data();
        const batch = config_1.db.batch();
        batch.update(disputeRef, {
            status: 'resolved',
            resolution,
            resolvedBy: decodedToken.uid,
            resolvedAt: config_1.Timestamp.now(),
        });
        if (refundTourist && dispute.bookingId) {
            batch.update(config_1.db.collection('bookings').doc(dispute.bookingId), {
                refundStatus: 'approved',
                paymentStatus: 'REFUNDED',
                refundedAt: config_1.Timestamp.now(),
                disputeResolution: resolution,
            });
        }
        await config_1.db.collection('audit_logs').add({
            actorUid: decodedToken.uid,
            actorName: userDoc.data()?.name || 'LGU',
            action: 'dispute.resolved',
            resource: 'disputes',
            resourceId: disputeId,
            details: `Dispute resolved: ${resolution}. Refund: ${refundTourist ? 'Yes' : 'No'}`,
            timestamp: config_1.Timestamp.now(),
        });
        await batch.commit();
        res.json({ success: true, disputeId, resolution });
    }
    catch (error) {
        console.error('resolveDispute error:', error);
        res.status(500).json({ error: error.message });
    }
});
//# sourceMappingURL=disputeHandler.js.map