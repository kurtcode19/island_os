import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type { Booking } from '../types';

const DEFAULT_MAX_GUESTS: Record<string, number> = {
  'stay': 20,
  'transport': 50,
  'spot': 30,
  'tour': 15,
  'dining': 40,
  'shop': 10,
};

export function getMaxGuests(serviceType: string): number {
  return DEFAULT_MAX_GUESTS[serviceType] || 20;
}

export async function checkAvailability(
  serviceId: string | number,
  date: string,
  guests: number = 1
): Promise<{ available: boolean; remaining: number; error?: string }> {
  try {
    const maxGuests = DEFAULT_MAX_GUESTS['stay'];
    const q = query(
      collection(db, 'bookings'),
      where('serviceId', '==', serviceId),
      where('date', '==', date),
      where('status', 'in', ['confirmed', 'checked_in', 'pending'])
    );
    const snapshot = await getDocs(q);
    const bookedCount = snapshot.docs.reduce((sum, doc) => {
      const data = doc.data() as Booking;
      return sum + (data.guests || 1);
    }, 0);
    const remaining = maxGuests - bookedCount;
    return {
      available: remaining >= guests,
      remaining: Math.max(0, remaining),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'bookings');
    return { available: true, remaining: 999, error: 'Could not check availability' };
  }
}
