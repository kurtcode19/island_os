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
}, now?: Date): 'eligible' | 'pending' | 'ineligible' {
  const cancellationRequestedAt = booking.cancellationRequestedAt
    ? booking.cancellationRequestedAt.toMillis()
    : (now?.getTime() || Date.now());
  if (!booking.checkInTimestamp) return 'ineligible';

  const checkInAt = booking.checkInTimestamp.toMillis();
  const hoursBeforeCheckIn = (checkInAt - cancellationRequestedAt) / (1000 * 60 * 60);

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
