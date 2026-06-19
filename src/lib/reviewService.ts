import { collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type { Review } from '../types';
import { logEvent } from './auditService';

export async function submitReview(
  bookingId: string,
  touristUid: string,
  touristName: string,
  businessId: string,
  serviceId: string | number,
  serviceName: string,
  rating: number,
  comment: string
): Promise<boolean> {
  try {
    await addDoc(collection(db, 'reviews'), {
      bookingId,
      touristUid,
      touristName,
      businessId,
      serviceId,
      serviceName,
      rating,
      comment,
      createdAt: serverTimestamp(),
      moderated: false,
      approved: false,
    });
    logEvent('created', 'reviews', undefined, `Review for ${serviceName}: ${rating} stars`);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'reviews');
    return false;
  }
}

export function subscribeToBusinessReviews(
  businessId: string,
  onReviews: (reviews: Review[]) => void
) {
  const q = query(
    collection(db, 'reviews'),
    where('businessId', '==', businessId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    onReviews(data);
  }, (error) => {
    console.error('Reviews listener error:', error);
  });
}

export function subscribeToAllReviews(onReviews: (reviews: Review[]) => void) {
  const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    onReviews(data);
  }, (error) => {
    console.error('Reviews listener error:', error);
  });
}

export async function moderateReview(reviewId: string, approved: boolean) {
  try {
    await updateDoc(doc(db, 'reviews', reviewId), {
      approved,
      moderated: true,
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reviews/${reviewId}`);
    return false;
  }
}

export async function replyToReview(reviewId: string, reply: string) {
  try {
    await updateDoc(doc(db, 'reviews', reviewId), { reply });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reviews/${reviewId}`);
    return false;
  }
}
