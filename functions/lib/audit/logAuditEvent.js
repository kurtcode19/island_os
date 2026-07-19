"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditEvent = void 0;
const https_1 = require("firebase-functions/v2/https");
const config_1 = require("../config");
exports.logAuditEvent = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
        throw new https_1.HttpsError('unauthenticated', 'You must be logged in.');
    }
    const { action, resource, resourceId, details } = request.data;
    if (!action || !resource) {
        throw new https_1.HttpsError('invalid-argument', 'action and resource are required.');
    }
    const ip = request.rawRequest.ip || 'unknown';
    const userAgent = request.rawRequest.headers['user-agent'] || '';
    const userDoc = await config_1.db.collection('users').doc(uid).get();
    const userName = userDoc.data()?.name || 'Unknown';
    const userEmail = userDoc.data()?.email || '';
    await config_1.db.collection('audit_logs').add({
        actorUid: uid,
        actorName: userName,
        actorEmail: userEmail,
        action,
        resource,
        resourceId: resourceId || '',
        details: details || '',
        timestamp: config_1.Timestamp.now(),
        ip,
        userAgent: userAgent.substring(0, 200),
    });
    return { success: true };
});
//# sourceMappingURL=logAuditEvent.js.map