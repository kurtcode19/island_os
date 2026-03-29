import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);

async function run() {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, 'kurtmier123@gmail.com', 'password123');
    const user = userCredential.user;
    console.log('Logged in as:', user.uid);

    const bookingData = {
      touristUid: user.uid,
      touristName: 'Test User',
      serviceId: 'test-service-123',
      serviceName: 'Test Hotel',
      serviceType: 'stay',
      businessId: 'test-business-123',
      date: new Date().toISOString(),
      status: 'pending',
      amount: 1000,
      createdAt: serverTimestamp()
    };

    console.log('Attempting to create booking...');
    const docRef = await addDoc(collection(db, 'bookings'), bookingData);
    console.log('Booking created successfully with ID:', docRef.id);
  } catch (error: any) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

run();
