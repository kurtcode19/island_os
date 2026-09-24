import type { Business } from '../types';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const DININGGASAN_BUSINESS_ID = 'dininggasan-catarman';

export const DININGGASAN_IMAGES = {
  roomInterior: '/images/dininggasan/736019840_879569734737182_4910857333828317433_n.jpg',
  aerialTower: '/images/dininggasan/736931370_2792978721062810_1238064698030272327_n.jpg',
  buildingExterior: '/images/dininggasan/737383602_26625630437112405_7161482258112319983_n.jpg',
  complexAerial: '/images/dininggasan/737827220_1339672174254548_923328153894047872_n.jpg',
};

export const DININGGASAN_ROOM_COUNT = 12;

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
    featuredImage: DININGGASAN_IMAGES.buildingExterior,
    gallery: [
      DININGGASAN_IMAGES.roomInterior,
      DININGGASAN_IMAGES.buildingExterior,
      DININGGASAN_IMAGES.aerialTower,
      DININGGASAN_IMAGES.complexAerial,
    ],
  },
  roomTypes: [
    { id: 'room-main', name: 'Dininggasan Room', basePrice: 3800, capacity: 8, priceModifiers: [], unitCount: DININGGASAN_ROOM_COUNT, image: DININGGASAN_IMAGES.roomInterior },
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
    description: 'A versatile function room perfect for meetings, celebrations, and gatherings. Morning session until 5:00 PM; night session until 12:00 AM. Rental fee includes tables & chairs.',
    images: [DININGGASAN_IMAGES.buildingExterior],
    amenities: ['Air Conditioning', 'Sound System Available', 'Tables & Chairs (included)', 'LED TV', 'Catering Ready'],
    timeSlots: [
      { id: 'morning', label: 'Morning Session', baseHours: 3, basePrice: 2000, succeedingRate: 200, endTime: '17:00', endTimeLabel: '5:00 PM' },
      { id: 'night', label: 'Night Session', baseHours: 3, basePrice: 3000, succeedingRate: 300, endTime: '00:00', endTimeLabel: '12:00 AM' },
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
