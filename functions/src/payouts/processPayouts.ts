import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { db, Timestamp, FieldValue, DEFAULT_COMMISSION_RATE } from '../config';

const stripeSecret = defineSecret('STRIPE_SECRET_KEY');

export const processPayouts = onSchedule(
  { schedule: 'every monday 09:00', timeZone: 'Asia/Manila', secrets: [stripeSecret] },
  async (event) => {
    const now = Timestamp.now();
    const weekAgo = new Date(now.toDate().getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get confirmed bookings that have been settled but not yet paid out
    const snapshot = await db.collection('bookings')
      .where('status', '==', 'confirmed')
      .where('paymentStatus', '==', 'PAID')
      .where('settledAt', '>=', Timestamp.fromDate(weekAgo))
      .where('payoutStatus', '==', 'pending')
      .get();

    if (snapshot.empty) {
      console.log('No bookings to process for payout');
      return;
    }

    // Group by business
    const byBusiness = new Map<string, { bookings: typeof snapshot.docs; total: number }>();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const bid = data.businessId || 'unknown';
      if (!byBusiness.has(bid)) {
        byBusiness.set(bid, { bookings: [], total: 0 });
      }
      const entry = byBusiness.get(bid)!;
      entry.bookings.push(doc);
      entry.total += (data.totalPrice || data.amount || 0);
    });

    const batch = db.batch();

    for (const [businessId, data] of byBusiness) {
      const businessDoc = await db.collection('businesses').doc(businessId).get();
      if (!businessDoc.exists) continue;

      const business = businessDoc.data()!;
      const commissionRate = (business.commissionRate ?? DEFAULT_COMMISSION_RATE) / 100;
      const commission = Math.round(data.total * commissionRate);
      const netAmount = data.total - commission;

      // Create payout record
      const payoutRef = db.collection('payouts').doc();
      batch.set(payoutRef, {
        businessId,
        businessName: business.name || businessId,
        periodStart: Timestamp.fromDate(weekAgo),
        periodEnd: now,
        grossAmount: data.total,
        commission,
        commissionRate: business.commissionRate ?? DEFAULT_COMMISSION_RATE,
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
      await db.collection('platform_revenue').add({
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
  }
);

// Also allow LGU to manually trigger payouts
export const manualPayout = onRequest(
  { cors: true },
  async (req, res) => {
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
      const admin = await import('firebase-admin');
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Only LGU can manually trigger
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      if (!userDoc.exists || userDoc.data()?.role !== 'LGU') {
        res.status(403).json({ error: 'Only LGU can trigger payouts' });
        return;
      }

      const { businessId } = req.body;
      const now = Timestamp.now();

      let query = db.collection('bookings')
        .where('status', '==', 'confirmed')
        .where('paymentStatus', '==', 'PAID')
        .where('payoutStatus', '==', 'pending');

      if (businessId) {
        query = query.where('businessId', '==', businessId) as any;
      }

      const snapshot = await query.get();
      if (snapshot.empty) {
        res.json({ message: 'No pending payouts', count: 0 });
        return;
      }

      // Group by business
      const byBusiness = new Map<string, { bookings: typeof snapshot.docs; total: number }>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const bid = data.businessId || 'unknown';
        if (!byBusiness.has(bid)) {
          byBusiness.set(bid, { bookings: [], total: 0 });
        }
        const entry = byBusiness.get(bid)!;
        entry.bookings.push(doc);
        entry.total += (data.totalPrice || data.amount || 0);
      });

      const batch = db.batch();
      for (const [bid, data] of byBusiness) {
        const bizDoc = await db.collection('businesses').doc(bid).get();
        const biz = bizDoc.data();
        const commissionRate = (biz?.commissionRate ?? DEFAULT_COMMISSION_RATE) / 100;
        const commission = Math.round(data.total * commissionRate);
        const netAmount = data.total - commission;

        const payoutRef = db.collection('payouts').doc();
        batch.set(payoutRef, {
          businessId: bid,
          businessName: biz?.name || bid,
          periodStart: now,
          periodEnd: now,
          grossAmount: data.total,
          commission,
          commissionRate: biz?.commissionRate ?? DEFAULT_COMMISSION_RATE,
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
    } catch (error: any) {
      console.error('manualPayout error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);
