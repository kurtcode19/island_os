import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export async function updateUserNationality(uid: string, nationality: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), { nationality });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    throw error;
  }
}
