import type { Business } from '../types';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const PILOT_BUSINESS_ID = 'pilot-catarman-coral-dive-resort';

export { PILOT_BUSINESS_ID };

export const pilotBusinessData: Omit<Business, 'id'> = {
  name: 'Catarman Coral Dive Resort',
  ownerUid: 'pilot-owner',
  businessType: 'accommodation',
  category: 'resort',
  description: 'Beachfront diving resort in Poblacion, Catarman. The pilot business for the Catarman eSuroy platform.',
  address: 'Poblacion, Catarman, Camiguin',
  contact: '0917-111-1115',
  verified: true,
  images: ['/images/coraldiveresort.jpg'],
  createdAt: null,
  media: {
    featuredImage: '/images/coraldiveresort.jpg',
    gallery: ['/images/coraldiveresort.jpg', '/images/hero-sunken.png'],
  },
  roomTypes: [
    { id: 'room-deluxe', name: 'Deluxe Ocean View', basePrice: 2500, capacity: 2 },
    { id: 'room-premium', name: 'Premium Suite', basePrice: 4000, capacity: 4 },
    { id: 'room-standard', name: 'Standard Room', basePrice: 1500, capacity: 2 },
  ],
  policies: {
    standardCheckInTime: '14:00',
    standardCheckOutTime: '12:00',
    cancellationHours: 48,
  },
  services: [
    { id: 'svc-breakfast', name: 'Breakfast Bundle', price: 350, description: 'Full breakfast per person' },
    { id: 'svc-diving', name: 'Diving Package', price: 1500, description: 'Guided dive with equipment' },
    { id: 'svc-snorkeling', name: 'Snorkeling Gear', price: 300, description: 'Mask, fins, and snorkel rental' },
    { id: 'svc-massage', name: 'Massage (60 min)', price: 800, description: 'Traditional Filipino massage' },
    { id: 'svc-airport', name: 'Airport Transfer', price: 2000, description: 'Round-trip airport transfer' },
    { id: 'svc-welcome', name: 'Welcome Drinks', price: 150, description: 'Welcome coconut or juice' },
  ],
  acceptsEvents: true,
  eventVenues: [
    { id: 'venue-garden', name: 'Garden Pavilion', capacitySeated: 120, halfDayPrice: 15000, fullDayPrice: 25000, overtimeRate: 3000 },
    { id: 'venue-beach', name: 'Beachfront Area', capacitySeated: 200, halfDayPrice: 20000, fullDayPrice: 35000, overtimeRate: 5000 },
    { id: 'venue-conference', name: 'Conference Hall', capacitySeated: 80, halfDayPrice: 10000, fullDayPrice: 18000, overtimeRate: 2000 },
  ],
  location: {
    lat: 9.2000,
    lng: 124.6700,
  },
};

export async function seedPilotBusiness(): Promise<string> {
  try {
    await setDoc(doc(db, 'businesses', PILOT_BUSINESS_ID), {
      ...pilotBusinessData,
      id: PILOT_BUSINESS_ID,
      createdAt: Timestamp.now(),
    });
    console.log('✅ Pilot business created:', PILOT_BUSINESS_ID);
    return PILOT_BUSINESS_ID;
  } catch (error) {
    console.error('❌ Failed to seed pilot business:', error);
    throw error;
  }
}

export async function enablePilotMode(): Promise<void> {
  try {
    await setDoc(doc(db, 'system', 'pilot'), {
      enabled: true,
      businessId: PILOT_BUSINESS_ID,
    });
    console.log('✅ Pilot mode enabled for:', PILOT_BUSINESS_ID);
  } catch (error) {
    console.error('❌ Failed to enable pilot mode:', error);
    throw error;
  }
}
