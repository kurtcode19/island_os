import { collection, getDocs, doc, getDoc, setDoc, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { accommodations as staticAccommodations } from '../data/accommodations';
import { transportOptions as staticTransport } from '../data/transport';
import { locations as staticLocations } from '../data/locations';

const COLLECTIONS = {
  accommodations: 'services_accommodations',
  transport: 'services_transport',
  shops: 'services_shops',
  locations: 'locations',
};

export async function seedDataToFirestore() {
  const results: string[] = [];

  // Seed accommodations
  for (const item of staticAccommodations) {
    try {
      await setDoc(doc(db, COLLECTIONS.accommodations, item.id), { ...item, syncedAt: new Date().toISOString() });
      results.push(`Accommodation: ${item.name}`);
    } catch (e) {
      results.push(`FAILED: ${item.name}`);
    }
  }

  // Seed transport
  for (const item of staticTransport) {
    try {
      await setDoc(doc(db, COLLECTIONS.transport, String(item.id)), { ...item, syncedAt: new Date().toISOString() });
      results.push(`Transport: ${item.title}`);
    } catch (e) {
      results.push(`FAILED: ${item.title}`);
    }
  }

  // Seed locations
  for (const item of staticLocations) {
    try {
      await setDoc(doc(db, COLLECTIONS.locations, String(item.id)), { ...item, syncedAt: new Date().toISOString() });
      results.push(`Location: ${item.name}`);
    } catch (e) {
      results.push(`FAILED: ${item.name}`);
    }
  }

  return results;
}

export async function getFirestoreData(collectionName: string): Promise<any[]> {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch {
    return [];
  }
}

export async function getServices(type: 'stay' | 'transport' | 'shop'): Promise<any[]> {
  const collectionMap: Record<string, string> = {
    stay: COLLECTIONS.accommodations,
    transport: COLLECTIONS.transport,
    shop: COLLECTIONS.shops,
  };

  const colName = collectionMap[type];
  if (!colName) return getStaticFallback(type);

  try {
    const data = await getFirestoreData(colName);
    if (data.length > 0) return data;
  } catch {}

  return getStaticFallback(type);
}

function getStaticFallback(type: string): any[] {
  switch (type) {
    case 'stay': return staticAccommodations;
    case 'transport': return staticTransport;
    default: return [];
  }
}
