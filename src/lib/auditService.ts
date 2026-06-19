import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';

export async function logEvent(
  action: string,
  resource: string,
  resourceId?: string,
  details?: string
) {
  try {
    const user = auth.currentUser;
    await addDoc(collection(db, 'audit_logs'), {
      actorUid: user?.uid || 'anonymous',
      actorName: user?.displayName || 'System',
      actorEmail: user?.email || '',
      action,
      resource,
      resourceId: resourceId || '',
      details: details || '',
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent?.substring(0, 200) || '',
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

export function getAuditAction(operation: string): string {
  const map: Record<string, string> = {
    CREATE: 'created',
    UPDATE: 'updated',
    DELETE: 'deleted',
    GET: 'viewed',
    LIST: 'listed',
  };
  return map[operation] || operation.toLowerCase();
}
