import type { Business } from '../types';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const DININGGASAN_BUSINESS_ID = 'dininggasan-catarman';

export const dininggasanData: Omit<Business, 'id'> = {
  name: 'Dininggasan',
  ownerUid: 'dininggasan-owner',
  businessType: 'accommodation',
  category: 'resort',
  description: 'Your home away from home in Catarman, Camiguin. Cozy accommodation, function room for events, and pickleball court — all in one place.',
  address: 'Catarman, Camiguin',
  contact: '0917-000-0000',
  verified: true,
  images: [],
  createdAt: null,
  media: {
    featuredImage: '/images/dininggasan/hero.jpg',
    gallery: ['/images/dininggasan/hero.jpg', '/images/dininggasan/room.jpg', '/images/dininggasan/function-room.jpg', '/images/dininggasan/pickleball.jpg'],
  },
  roomTypes: [
    { id: 'room-main', name: 'Dininggasan Room', basePrice: 3800, capacity: 8, priceModifiers: [] },
  ],
  policies: {
    standardCheckInTime: '14:00',
    standardCheckOutTime: '12:00',
    cancellationHours: 48,
  },
  services: [
    { id: 'svc-pickleball', name: 'Pickleball Court (Non-Guest)', price: 150, description: 'Per hour, for non-guests only' },
  ],
  acceptsEvents: true,
  eventVenues: [],
  functionRoom: {
    name: 'Dininggasan Function Room',
    capacity: 80,
    description: 'A versatile function room perfect for meetings, celebrations, and gatherings. Available for morning or evening sessions.',
    images: ['/images/dininggasan/function-room.jpg'],
    amenities: ['Air Conditioning', 'Sound System Available', 'Tables & Chairs', 'LED TV', 'Catering Ready'],
    timeSlots: [
      { id: 'morning', label: 'Morning Session', baseHours: 3, basePrice: 2000, succeedingRate: 200 },
      { id: 'night', label: 'Night Session', baseHours: 3, basePrice: 3000, succeedingRate: 300 },
    ],
    addons: [
      { id: 'addon-sound', name: 'Sound System', price: 1800, priceType: 'flat', description: 'Complete sound system for the whole event duration' },
      { id: 'addon-pickleball', name: 'Pickleball Court Access', price: 150, priceType: 'per_hour', description: 'Access to pickleball court during your event' },
    ],
  },
  location: {
    lat: 9.1333,
    lng: 124.7167,
  },
};

export async function seedDininggasanBusiness(): Promise<string> {
  try {
    await setDoc(doc(db, 'businesses', DININGGASAN_BUSINESS_ID), {
      ...dininggasanData,
      id: DININGGASAN_BUSINESS_ID,
      createdAt: Timestamp.now(),
    });
    console.log('Dininggasan business created:', DININGGASAN_BUSINESS_ID);
    return DININGGASAN_BUSINESS_ID;
  } catch (error) {
    console.error('Failed to seed Dininggasan business:', error);
    throw error;
  }
}

export async function enableDininggasanMode(): Promise<void> {
  try {
    await setDoc(doc(db, 'system', 'pilot'), {
      enabled: true,
      businessId: DININGGASAN_BUSINESS_ID,
    });
    console.log('Dininggasan pilot mode enabled');
  } catch (error) {
    console.error('Failed to enable Dininggasan mode:', error);
    throw error;
  }
}
