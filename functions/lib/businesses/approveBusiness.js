"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveBusiness = void 0;
const https_1 = require("firebase-functions/v2/https");
const config_1 = require("../config");
exports.approveBusiness = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
        throw new https_1.HttpsError('unauthenticated', 'You must be logged in.');
    }
    const userDoc = await config_1.db.collection('users').doc(uid).get();
    const userRole = userDoc.data()?.role;
    if (userRole !== 'LGU') {
        throw new https_1.HttpsError('permission-denied', 'Only LGU officials can approve businesses.');
    }
    const { businessId } = request.data;
    if (!businessId) {
        throw new https_1.HttpsError('invalid-argument', 'businessId is required.');
    }
    const businessRef = config_1.db.collection('businesses').doc(businessId);
    const businessDoc = await businessRef.get();
    if (!businessDoc.exists) {
        throw new https_1.HttpsError('not-found', 'Business not found.');
    }
    await businessRef.update({
        verified: true,
        verifiedAt: config_1.Timestamp.now(),
        verifiedBy: uid,
    });
    console.log(`[approveBusiness] Business ${businessId} approved by LGU ${uid}`);
    return { success: true, businessId };
});
//# sourceMappingURL=approveBusiness.js.map