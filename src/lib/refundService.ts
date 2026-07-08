import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export async function requestCancellation(bookingId: string, reason: string): Promise<void> {
  try {
    const now = Timestamp.now();
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'cancelled',
      refundStatus: 'pending',
      cancellationRequestedAt: now,
      cancellationReason: reason,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
    throw error;
  }
}

export function processRefundEligibility(booking: {
  cancellationRequestedAt?: Timestamp;
  checkInTimestamp?: Timestamp;
  refundStatus?: string;
}): 'eligible' | 'pending' | 'ineligible' {
  if (!booking.cancellationRequestedAt || !booking.checkInTimestamp) return 'ineligible';

  const requestedAt = booking.cancellationRequestedAt.toMillis();
  const checkInAt = booking.checkInTimestamp.toMillis();
  const hoursBeforeCheckIn = (checkInAt - requestedAt) / (1000 * 60 * 60);

  if (hoursBeforeCheckIn > 48) {
    return 'eligible';
  }
  return 'pending';
}

export async function approveRefund(bookingId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      refundStatus: 'approved',
      paymentStatus: 'REFUNDED',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
    throw error;
  }
}

export async function rejectRefund(bookingId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      refundStatus: 'rejected',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
    throw error;
  }
}
