import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import { pilotBusinessData } from '../src/data/pilotBusinessData';
import firebaseConfig from '../firebase-applet-config.json';

async function seedPilot() {
  const app = initializeApp(firebaseConfig);
  const db = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

  const businessId = 'pilot-catarman-coral-dive-resort';

  console.log(`\n🚀 Seeding pilot business: ${businessId}\n`);

  try {
    await setDoc(doc(db, 'businesses', businessId), {
      ...pilotBusinessData,
      id: businessId,
      createdAt: Timestamp.now(),
    });
    console.log('✅ Business document created successfully!');
    console.log(`\n📋 Pilot Business ID: ${businessId}`);
    console.log(`\n⚙️ To enable pilot mode, create this document in Firestore:`);
    console.log(`   Collection: system`);
    console.log(`   Document:   pilot`);
    console.log(`   Data:       { enabled: true, businessId: "${businessId}" }`);
    console.log(`\n   Or run: await setDoc(doc(db, 'system', 'pilot'), { enabled: true, businessId: "${businessId}" });\n`);
  } catch (error) {
    console.error('❌ Failed to seed pilot business:', error);
    process.exit(1);
  }
}

seedPilot();
