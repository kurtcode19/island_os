import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type { Incident } from '../types';

export async function reportIncident(
  touristUid: string,
  touristName: string,
  type: 'sos' | 'report',
  message: string
): Promise<string | null> {
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    });

    const docRef = await addDoc(collection(db, 'incidents'), {
      touristUid,
      touristName,
      type,
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      message,
      status: 'active',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error: any) {
    // If geolocation fails, save without coordinates
    if (error.code === 1 || error.code === 2 || error.code === 3) {
      try {
        const docRef = await addDoc(collection(db, 'incidents'), {
          touristUid,
          touristName,
          type,
          lat: 0,
          lng: 0,
          message,
          status: 'active',
          createdAt: serverTimestamp(),
        });
        return docRef.id;
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, 'incidents');
        return null;
      }
    }
    handleFirestoreError(error, OperationType.CREATE, 'incidents');
    return null;
  }
}

export function subscribeToIncidents(onIncidents: (incidents: Incident[]) => void) {
  const q = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Incident));
    onIncidents(data);
  }, (error) => {
    console.error('Incidents listener error:', error);
  });
}

export async function resolveIncident(incidentId: string) {
  try {
    await updateDoc(doc(db, 'incidents', incidentId), {
      status: 'resolved',
      resolvedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `incidents/${incidentId}`);
    return false;
  }
}
