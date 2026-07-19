"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBusiness = exports.onUserCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const https_1 = require("firebase-functions/v2/https");
const config_1 = require("../config");
exports.onUserCreated = (0, firestore_1.onDocumentCreated)('users/{userId}', async (event) => {
    const userId = event.params.userId;
    const userData = event.data?.data();
    if (!userData)
        return;
    const role = userData.role || 'TOURIST';
    try {
        await config_1.auth.setCustomUserClaims(userId, { role });
        console.log(`[claims] Set custom claims for user ${userId}: role=${role}`);
    }
    catch (error) {
        console.error(`[claims] Failed to set custom claims for user ${userId}:`, error);
    }
});
exports.createBusiness = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
        throw new https_1.HttpsError('unauthenticated', 'You must be logged in to register a business.');
    }
    const { businessId, businessName } = request.data;
    if (!businessId || !businessName) {
        throw new https_1.HttpsError('invalid-argument', 'businessId and businessName are required.');
    }
    try {
        const businessRef = config_1.db.collection('businesses').doc(businessId);
        const businessDoc = await businessRef.get();
        if (!businessDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Business not found. Please scan a valid QR code.');
        }
        const ownerUid = businessDoc.data()?.ownerUid;
        if (ownerUid && ownerUid !== uid) {
            throw new https_1.HttpsError('permission-denied', 'This business is already claimed by another user.');
        }
        await config_1.auth.setCustomUserClaims(uid, { role: 'BUSINESS', businessId });
        await businessRef.set({ ownerUid: uid }, { merge: true });
        await config_1.db.collection('users').doc(uid).update({
            role: 'BUSINESS',
            businessId,
        });
        console.log(`[claims] User ${uid} promoted to BUSINESS (${businessId})`);
        return { success: true, role: 'BUSINESS', businessId };
    }
    catch (error) {
        if (error instanceof https_1.HttpsError)
            throw error;
        console.error(`[claims] Failed to create business for user ${uid}:`, error);
        throw new https_1.HttpsError('internal', 'Failed to register business.');
    }
});
//# sourceMappingURL=setupClaims.js.map