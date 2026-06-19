import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type { TouristPass } from '../types';

function generatePassId(): string {
  const prefix = 'CTRM';
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const seq = Date.now().toString(36).substring(-4).toUpperCase();
  return `${prefix}-P-${year}-${rand}${seq}`;
}

function computeExpiry(): any {
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  return expiresAt;
}

export async function createPass(uid: string, displayName: string, email: string): Promise<TouristPass> {
  const passId = generatePassId();
  const passRef = doc(db, 'passes', uid);

  const passData: TouristPass = {
    id: uid,
    uid,
    passId,
    displayName,
    email,
    issuedAt: serverTimestamp(),
    expiresAt: computeExpiry(),
    status: 'active',
  };

  try {
    await setDoc(passRef, passData);
    return { ...passData, id: uid } as TouristPass;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `passes/${uid}`);
    throw error;
  }
}

export async function getPass(uid: string): Promise<TouristPass | null> {
  const passRef = doc(db, 'passes', uid);
  try {
    const snap = await getDoc(passRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as TouristPass;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `passes/${uid}`);
    return null;
  }
}

export function subscribeToPass(uid: string, onPass: (pass: TouristPass | null) => void) {
  const passRef = doc(db, 'passes', uid);
  return onSnapshot(passRef, (snap) => {
    if (snap.exists()) {
      onPass({ id: snap.id, ...snap.data() } as TouristPass);
    } else {
      onPass(null);
    }
  }, (error) => {
    console.error('Pass listener error:', error);
  });
}
