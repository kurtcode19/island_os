import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import config from './firebase-applet-config.json' with { type: "json" };

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);
const auth = getAuth(app);

async function test() {
  try {
    await signInWithEmailAndPassword(auth, 'kurtmier123@gmail.com', 'password123');
    console.log('Logged in');
    
    const docRef = await addDoc(collection(db, 'bookings'), {
        touristUid: auth.currentUser!.uid,
        touristName: 'Anonymous',
        serviceId: 'stay-1',
        serviceName: 'Blue Lagoon Resort & Spa',
        serviceType: 'stay',
        businessId: 'biz-resort-1',
        date: new Date().toISOString(),
        status: 'pending',
        paymentStatus: 'UNPAID',
        amount: 8500,
        createdAt: serverTimestamp()
    });
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
  process.exit(0);
}
test();
