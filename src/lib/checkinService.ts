import { doc, getDoc, collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type { TouristPass, Booking } from '../types';
import { logEvent } from './auditService';

export async function verifyPass(passId: string): Promise<{ pass: TouristPass | null; error?: string }> {
  try {
    const passesRef = collection(db, 'passes');
    const q = query(passesRef, where('passId', '==', passId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { pass: null, error: 'Pass not found' };
    }

    const docSnap = snapshot.docs[0];
    const passData = { id: docSnap.id, ...docSnap.data() } as TouristPass;

    if (passData.status !== 'active') {
      return { pass: null, error: `Pass is ${passData.status}` };
    }

    return { pass: passData };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'passes');
    return { pass: null, error: 'Failed to verify pass' };
  }
}

export async function getActiveBookingsForTourist(uid: string): Promise<Booking[]> {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('touristUid', '==', uid),
      where('status', 'in', ['pending', 'confirmed'])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'bookings');
    return [];
  }
}

export async function checkIn(bookingId: string, businessId: string): Promise<boolean> {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: 'checked_in',
      checkedInAt: serverTimestamp(),
    });
    logEvent('checked_in', 'bookings', bookingId, `Tourist checked in at ${businessId}`);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
    return false;
  }
}

export async function departTourist(uid: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('touristUid', '==', uid),
      where('status', 'in', ['checked_in', 'confirmed'])
    );
    const snapshot = await getDocs(q);

    const updates = snapshot.docs.map(doc =>
      updateDoc(doc.ref, {
        status: 'departed',
        departedAt: serverTimestamp(),
      })
    );
    await Promise.all(updates);
    logEvent('departed', 'bookings', uid, `Tourist departed from island`);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'bookings');
    return false;
  }
}
