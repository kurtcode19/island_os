import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { auth, db } from '../config';

export const onUserCreated = onDocumentCreated('users/{userId}', async (event) => {
  const userId = event.params.userId;
  const userData = event.data?.data();
  if (!userData) return;

  const role = userData.role || 'TOURIST';

  try {
    await auth.setCustomUserClaims(userId, { role });
    console.log(`[claims] Set custom claims for user ${userId}: role=${role}`);
  } catch (error) {
    console.error(`[claims] Failed to set custom claims for user ${userId}:`, error);
  }
});

export const createBusiness = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'You must be logged in to register a business.');
  }

  const { businessId, businessName } = request.data as { businessId?: string; businessName?: string };
  if (!businessId || !businessName) {
    throw new HttpsError('invalid-argument', 'businessId and businessName are required.');
  }

  try {
    const businessRef = db.collection('businesses').doc(businessId);
    const businessDoc = await businessRef.get();

    if (!businessDoc.exists) {
      throw new HttpsError('not-found', 'Business not found. Please scan a valid QR code.');
    }

    const ownerUid = businessDoc.data()?.ownerUid;
    if (ownerUid && ownerUid !== uid) {
      throw new HttpsError('permission-denied', 'This business is already claimed by another user.');
    }

    await auth.setCustomUserClaims(uid, { role: 'BUSINESS', businessId });

    await businessRef.set({ ownerUid: uid }, { merge: true });

    await db.collection('users').doc(uid).update({
      role: 'BUSINESS',
      businessId,
    });

    console.log(`[claims] User ${uid} promoted to BUSINESS (${businessId})`);

    return { success: true, role: 'BUSINESS', businessId };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error(`[claims] Failed to create business for user ${uid}:`, error);
    throw new HttpsError('internal', 'Failed to register business.');
  }
});
