import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, Timestamp } from '../config';

export const approveBusiness = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'You must be logged in.');
  }

  const userDoc = await db.collection('users').doc(uid).get();
  const userRole = userDoc.data()?.role;

  if (userRole !== 'LGU') {
    throw new HttpsError('permission-denied', 'Only LGU officials can approve businesses.');
  }

  const { businessId } = request.data as { businessId?: string };
  if (!businessId) {
    throw new HttpsError('invalid-argument', 'businessId is required.');
  }

  const businessRef = db.collection('businesses').doc(businessId);
  const businessDoc = await businessRef.get();

  if (!businessDoc.exists) {
    throw new HttpsError('not-found', 'Business not found.');
  }

  await businessRef.update({
    verified: true,
    verifiedAt: Timestamp.now(),
    verifiedBy: uid,
  });

  console.log(`[approveBusiness] Business ${businessId} approved by LGU ${uid}`);

  return { success: true, businessId };
});
