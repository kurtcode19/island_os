import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { db, Timestamp } from '../config';

export const onDisputeCreated = onDocumentCreated('disputes/{disputeId}', async (event) => {
  const dispute = event.data?.data();
  if (!dispute) return;

  // Notify LGU of new dispute
  await db.collection('audit_logs').add({
    actorUid: dispute.touristUid || 'system',
    actorName: 'System',
    action: 'dispute.created',
    resource: 'disputes',
    resourceId: event.params.disputeId,
    details: `Dispute created for booking ${dispute.bookingId}`,
    timestamp: Timestamp.now(),
  });
});

export const resolveDispute = onRequest(
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

    const token = authHeader.split('Bearer ')[1];
    try {
      const admin = await import('firebase-admin');
      const decodedToken = await admin.auth().verifyIdToken(token);

      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      if (!userDoc.exists || userDoc.data()?.role !== 'LGU') {
        res.status(403).json({ error: 'Only LGU can resolve disputes' });
        return;
      }

      const { disputeId, resolution, refundTourist } = req.body;
      if (!disputeId || !resolution) {
        res.status(400).json({ error: 'disputeId and resolution required' });
        return;
      }

      const disputeRef = db.collection('disputes').doc(disputeId);
      const disputeSnap = await disputeRef.get();
      if (!disputeSnap.exists) {
        res.status(404).json({ error: 'Dispute not found' });
        return;
      }

      const dispute = disputeSnap.data()!;
      const batch = db.batch();

      batch.update(disputeRef, {
        status: 'resolved',
        resolution,
        resolvedBy: decodedToken.uid,
        resolvedAt: Timestamp.now(),
      });

      if (refundTourist && dispute.bookingId) {
        batch.update(db.collection('bookings').doc(dispute.bookingId), {
          refundStatus: 'approved',
          paymentStatus: 'REFUNDED',
          refundedAt: Timestamp.now(),
          disputeResolution: resolution,
        });
      }

      await db.collection('audit_logs').add({
        actorUid: decodedToken.uid,
        actorName: userDoc.data()?.name || 'LGU',
        action: 'dispute.resolved',
        resource: 'disputes',
        resourceId: disputeId,
        details: `Dispute resolved: ${resolution}. Refund: ${refundTourist ? 'Yes' : 'No'}`,
        timestamp: Timestamp.now(),
      });

      await batch.commit();
      res.json({ success: true, disputeId, resolution });
    } catch (error: any) {
      console.error('resolveDispute error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);
