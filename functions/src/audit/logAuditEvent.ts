import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, Timestamp } from '../config';

export const logAuditEvent = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'You must be logged in.');
  }

  const { action, resource, resourceId, details } = request.data as {
    action?: string;
    resource?: string;
    resourceId?: string;
    details?: string;
  };

  if (!action || !resource) {
    throw new HttpsError('invalid-argument', 'action and resource are required.');
  }

  const ip = request.rawRequest.ip || 'unknown';
  const userAgent = request.rawRequest.headers['user-agent'] || '';

  const userDoc = await db.collection('users').doc(uid).get();
  const userName = userDoc.data()?.name || 'Unknown';
  const userEmail = userDoc.data()?.email || '';

  await db.collection('audit_logs').add({
    actorUid: uid,
    actorName: userName,
    actorEmail: userEmail,
    action,
    resource,
    resourceId: resourceId || '',
    details: details || '',
    timestamp: Timestamp.now(),
    ip,
    userAgent: userAgent.substring(0, 200),
  });

  return { success: true };
});
