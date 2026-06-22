/**
 * Firestore Seed Script
 * 
 * Run: npx tsx scripts/seed-firestore.ts
 * 
 * Uploads static data (accommodations, transport, locations) to Firestore
 * so the app can read from a dynamic database instead of static files.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { accommodations } from '../src/data/accommodations';
import { transportOptions } from '../src/data/transport';
import { locations } from '../src/data/locations';
import { businesses } from '../src/data/businesses';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log('🌱 Starting Firestore seed...\n');

  // Seed accommodations
  console.log('--- Accommodations ---');
  for (const item of accommodations) {
    await setDoc(doc(db, 'services_accommodations', item.id), item);
    console.log(`  ✅ ${item.name} (${item.id})`);
  }

  // Seed transport
  console.log('\n--- Transport ---');
  for (const item of transportOptions) {
    await setDoc(doc(db, 'services_transport', String(item.id)), item);
    console.log(`  ✅ ${item.title} (${item.id})`);
  }

  // Seed locations
  console.log('\n--- Locations ---');
  for (const item of locations) {
    await setDoc(doc(db, 'locations', String(item.id)), item);
    console.log(`  ✅ ${item.name} (${item.id})`);
  }

  // Seed businesses
  console.log('\n--- Businesses ---');
  for (const item of businesses) {
    await setDoc(doc(db, 'businesses', item.id), {
      ...item,
      ownerUid: '',
      verified: false,
      createdAt: new Date().toISOString(),
    });
    console.log(`  ✅ ${item.name} (${item.id})`);
  }

  console.log('\n🎉 Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
