/**
 * Firestore Cleanup Script
 *
 * Deletes all transactional documents from Firestore collections
 * for a clean slate demo. Keeps configuration/system docs intact.
 *
 * Usage:
 *   npx tsx scripts/firestore-cleanup.ts
 *
 * WARNING: This DELETES data. Use with caution.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, query, limit } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS_TO_CLEAR = [
  'bookings',
  'inventory_items',
  'manual_earnings',
  'reviews',
  'incidents',
  'audit_logs',
  'tourist_passes',
];

async function deleteAllDocs(collectionName: string): Promise<number> {
  let deleted = 0;
  const q = query(collection(db, collectionName), limit(100));

  while (true) {
    const snapshot = await getDocs(q);
    if (snapshot.empty) break;

    const batch = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(batch);
    deleted += snapshot.docs.length;
    console.log(`  Deleted ${deleted} docs from ${collectionName}...`);
  }
  return deleted;
}

async function cleanup() {
  console.log('\n🧹 Firestore Cleanup\n');
  console.log(`Project: ${firebaseConfig.projectId}\n`);

  for (const col of COLLECTIONS_TO_CLEAR) {
    try {
      console.log(`Clearing ${col}...`);
      const count = await deleteAllDocs(col);
      console.log(`  ✅ ${col}: ${count} documents deleted\n`);
    } catch (error: any) {
      if (error.code === 'permission-denied' || error.code === 7) {
        console.log(`  ⚠️  ${col}: Permission denied (security rules). Try with admin SDK.\n`);
      } else {
        console.log(`  ❌ ${col}: ${error.message || error}\n`);
      }
    }
  }

  console.log('Cleanup complete!\n');
  console.log('To also delete seed data (businesses, accommodations, etc.),');
  console.log('or if permission errors occur, use Firebase Console:');
  console.log(`  https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/data\n`);
}

cleanup();
