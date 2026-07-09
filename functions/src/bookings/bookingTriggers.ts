import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db, Timestamp } from '../config';

export const onBookingCreated = onDocumentCreated('bookings/{bookingId}', async (event) => {
  const booking = event.data?.data();
  if (!booking) return;

  if (booking.paymentStatus === 'UNPAID' && booking.status === 'pending') {
    const createdAt = booking.createdAt?.toDate?.() || new Date();
    const cancelAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    await event.data?.ref.update({
      autoCancelAt: Timestamp.fromDate(cancelAt),
    });
  }

  await db.collection('audit_logs').add({
    actorUid: booking.touristUid || 'system',
    actorName: booking.touristName || 'System',
    action: 'booking.created',
    resource: 'bookings',
    resourceId: event.params.bookingId,
    details: `Booking created for ${booking.serviceName || 'Unknown'}`,
    timestamp: Timestamp.now(),
  });
});

export const processCancellationWindow = onSchedule('every 24 hours', async (event) => {
  const now = Timestamp.now();
  const twentyFourHoursAgo = new Date(now.toDate().getTime() - 24 * 60 * 60 * 1000);

  // Auto-cancel unpaid bookings older than 24h
  const unpaidSnapshot = await db.collection('bookings')
    .where('paymentStatus', '==', 'UNPAID')
    .where('status', '==', 'pending')
    .where('createdAt', '<', Timestamp.fromDate(twentyFourHoursAgo))
    .get();

  const batch = db.batch();
  unpaidSnapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      status: 'cancelled',
      cancelledAt: now,
      cancellationReason: 'Auto-cancelled: unpaid after 24 hours',
    });
  });

  if (unpaidSnapshot.docs.length > 0) {
    await batch.commit();
    console.log(`Auto-cancelled ${unpaidSnapshot.docs.length} unpaid bookings`);
  }

  // Auto-approve refunds where business hasn't responded in 48h
  const fortyEightHoursAgo = new Date(now.toDate().getTime() - 48 * 60 * 60 * 1000);
  const pendingRefundSnapshot = await db.collection('bookings')
    .where('refundStatus', '==', 'pending')
    .where('cancellationRequestedAt', '<', Timestamp.fromDate(fortyEightHoursAgo))
    .get();

  const refundBatch = db.batch();
  pendingRefundSnapshot.docs.forEach(doc => {
    refundBatch.update(doc.ref, {
      refundStatus: 'approved',
      paymentStatus: 'REFUNDED',
      refundedAt: now,
      autoApproved: true,
    });
  });

  if (pendingRefundSnapshot.docs.length > 0) {
    await refundBatch.commit();
    console.log(`Auto-approved ${pendingRefundSnapshot.docs.length} pending refunds`);
  }
});
