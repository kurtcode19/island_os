import { BusinessType, BusinessCategory } from '../types';

export interface BusinessEntry {
  id: string;
  name: string;
  businessType: BusinessType;
  category: BusinessCategory;
  description: string;
  location: string;
  contact: string;
  tags: string[];
  image: string;
}

export const businesses: BusinessEntry[] = [
  {
    id: 'biz-homestay-catarman',
    name: 'Old Church Ruins Homestay',
    businessType: 'accommodation',
    category: 'homestay',
    description: 'A cozy homestay near the historic Old Spanish Church Ruins.',
    location: 'Catarman',
    contact: '0917-111-1111',
    tags: ['Historical', 'Budget', 'Local'],
    image: '/images/old-spanish-church-ruins-big-tree.jpg',
  },
  {
    id: 'biz-olympia-1',
    name: 'Olympia Suites and Travellers Inn',
    businessType: 'accommodation',
    category: 'inn',
    description: 'Budget-friendly inn with free Wi-Fi in Looc.',
    location: 'Looc, Catarman',
    contact: '0917-111-1112',
    tags: ['Budget', 'Free Wi-Fi', 'Looc'],
    image: '/images/travellersinn.png',
  },
  {
    id: 'biz-asgard-1',
    name: 'Camiguin Camp Asgard by Viajeros',
    businessType: 'accommodation',
    category: 'resort',
    description: 'Nature resort perfect for families in Poblacion.',
    location: 'Poblacion, Catarman',
    contact: '0917-111-1113',
    tags: ['Nature', 'Family', 'Poblacion'],
    image: '/images/campasgard.jpg',
  },
  {
    id: 'biz-atlantis-1',
    name: 'Camiguin Atlantis Pension House by Viajeros',
    businessType: 'accommodation',
    category: 'pension_house',
    description: 'Group stay pension house in Panghiawan.',
    location: 'Panghiawan, Catarman',
    contact: '0917-111-1114',
    tags: ['Group Stay', 'Panghiawan', 'Budget'],
    image: '/images/atlantispensionhouse.jpg',
  },
  {
    id: 'biz-coral-1',
    name: 'Catarman Coral Dive Resort',
    businessType: 'accommodation',
    category: 'resort',
    description: 'Beachfront diving resort in Poblacion.',
    location: 'Poblacion, Catarman',
    contact: '0917-111-1115',
    tags: ['Diving', 'Beachfront', 'Poblacion'],
    image: '/images/coraldiveresort.jpg',
  },
  {
    id: 'biz-seaside-inn-1',
    name: 'Seaside Traveler\'s Inn',
    businessType: 'accommodation',
    category: 'inn',
    description: 'Seaside inn with private rooms in Tangaro.',
    location: 'Tangaro, Catarman',
    contact: '0917-111-1116',
    tags: ['Seaside', 'Private Room', 'Tangaro'],
    image: '/images/seasidetravellersinn.jpg',
  },
  {
    id: 'biz-da-cottages-1',
    name: 'D & A Seaside Cottages',
    businessType: 'accommodation',
    category: 'homestay',
    description: 'Cozy seaside cottages with free Wi-Fi in Mahinog.',
    location: 'Mahinog, Catarman',
    contact: '0917-111-1117',
    tags: ['Cottage', 'Free Wi-Fi', 'Mahinog'],
    image: '/images/D&Asidecottages.jpg',
  },
  {
    id: 'biz-taylor-1',
    name: 'Taylor\'s Plantacion Resort',
    businessType: 'accommodation',
    category: 'resort',
    description: 'Quiet garden resort in Tangaro.',
    location: 'Tangaro, Catarman',
    contact: '0917-111-1118',
    tags: ['Garden', 'Quiet', 'Tangaro'],
    image: '/images/plantacion.jpg',
  },
  {
    id: 'local_bikes',
    name: 'Local Bike Rental',
    businessType: 'rental',
    category: 'motorcycle',
    description: 'Affordable two-wheelers for island exploration.',
    location: 'Poblacion, Catarman',
    contact: '0917-123-4567',
    tags: ['Motorcycle', 'Bicycle', 'Scooter'],
    image: '/images/camiguin-rent-a-scooters.jpg',
  },
  {
    id: 'van_rentals_inc',
    name: 'Van Rentals Inc.',
    businessType: 'rental',
    category: 'van',
    description: 'Group transport and family-sized vehicles for island tours.',
    location: 'Looc, Catarman',
    contact: '0918-765-4321',
    tags: ['Van', 'SUV', 'Group Tour'],
    image: '/images/multicab.jpeg',
  },
  {
    id: 'ferry_co',
    name: 'SuperCat / OceanJet Ferry',
    businessType: 'transport',
    category: 'ferry',
    description: 'Fast craft ferry service between Balingoan and Benoni.',
    location: 'Benoni Port, Catarman',
    contact: '0919-555-0101',
    tags: ['Ferry', 'Sea Transport', 'Balingoan'],
    image: '/images/explore-bg.jpg',
  },
];

export function getBusinessByMerchant(merchantId: string): BusinessEntry | undefined {
  return businesses.find(b => b.id === merchantId);
}

export function getBusinessesByType(type: BusinessType): BusinessEntry[] {
  return businesses.filter(b => b.businessType === type);
}
