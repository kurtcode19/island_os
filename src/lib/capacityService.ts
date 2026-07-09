import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, Timestamp } from '../firebase';
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

export async function checkRoomAvailability(
  roomId: string | undefined | null,
  checkIn: Date,
  checkOut: Date
): Promise<{ available: boolean; message: string }> {
  if (!roomId) return { available: true, message: '' };
  try {
    const checkInMillis = checkIn.getTime();
    const checkOutMillis = checkOut.getTime();

    const q = query(
      collection(db, 'bookings'),
      where('roomId', '==', roomId),
      where('status', 'in', ['pending', 'confirmed', 'checked_in'])
    );
    const snapshot = await getDocs(q);

    const conflict = snapshot.docs.find((doc) => {
      const data = doc.data();
      const existingCheckIn = data.checkInTimestamp?.toMillis?.();
      const existingCheckOut = data.checkOutTimestamp?.toMillis?.();
      if (!existingCheckIn || !existingCheckOut) return false;
      return checkInMillis < existingCheckOut && checkOutMillis > existingCheckIn;
    });

    if (conflict) {
      const data = conflict.data();
      return {
        available: false,
        message: `"${data.roomName || 'This room'}" is already booked ${data.checkInDate ? `from ${new Date(data.checkInDate).toLocaleDateString()} to ${new Date(data.checkOutDate).toLocaleDateString()}` : 'for your selected dates'}. Please choose different dates or another room.`,
      };
    }

    return { available: true, message: '' };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'bookings');
    return { available: true, message: '' };
  }
}

export async function checkEventVenueAvailability(
  eventVenueId: string,
  startTimestamp: Timestamp,
  endTimestamp: Timestamp
): Promise<{ available: boolean; conflictingBookings: number }> {
  try {
    const startMillis = startTimestamp.toMillis();
    const endMillis = endTimestamp.toMillis();

    const q = query(
      collection(db, 'bookings'),
      where('eventVenueId', '==', eventVenueId),
      where('status', 'in', ['pending', 'confirmed'])
    );
    const snapshot = await getDocs(q);

    const conflicting = snapshot.docs.filter((doc) => {
      const data = doc.data();
      if (!data.eventStartTimestamp || !data.eventEndTimestamp) return false;
      const existingStart = data.eventStartTimestamp.toMillis();
      const existingEnd = data.eventEndTimestamp.toMillis();
      return startMillis < existingEnd && endMillis > existingStart;
    });

    return {
      available: conflicting.length === 0,
      conflictingBookings: conflicting.length,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'bookings');
    return { available: true, conflictingBookings: 0 };
  }
}
