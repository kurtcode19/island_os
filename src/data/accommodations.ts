export interface PromoPackage {
  id: string;
  name: string;
  persons: number;
  days: number;
  nights: number;
  price: number;
  inclusions: string[];
  description: string;
}

export interface Accommodation {
  id: string;
  name: string;
  type: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
  tags: string[];
  businessId: string;
  maxAdults: number;
  childPrice?: number;
  tweenPrice?: number;
  promoPackages?: PromoPackage[];
}

export const accommodations: Accommodation[] = [
  {
    id: 'stay-2',
    name: 'Old Church Ruins Homestay',
    type: 'Homestay',
    rating: 4.7,
    reviews: 32,
    price: 1200,
    image: '/images/old-spanish-church-ruins-big-tree.jpg',
    tags: ['Historical', 'Budget', 'Local'],
    businessId: 'biz-homestay-catarman',
    maxAdults: 4,
    childPrice: 600,
    tweenPrice: 800,
    promoPackages: [
      { id: 'pkg-stay-2-1', name: 'Heritage Explorer', persons: 2, days: 3, nights: 2, price: 2000, inclusions: ['Breakfast', 'Tour of Church Ruins', 'Welcome Drinks'], description: 'Immerse in history with this curated heritage package for couples.' },
      { id: 'pkg-stay-2-2', name: 'Family Heritage', persons: 4, days: 4, nights: 3, price: 3800, inclusions: ['Breakfast for all', 'Guided Heritage Walk', 'Snorkeling Gear'], description: 'Perfect for families wanting to explore Catarman\'s rich history.' },
    ]
  },
  {
    id: 'stay-3',
    name: 'Olympia Suites and Travellers Inn',
    type: 'Inn',
    rating: 4.2,
    reviews: 28,
    price: 500,
    image: '/images/travellersinn.png',
    tags: ['Budget', 'Free Wi-Fi', 'Looc'],
    businessId: 'biz-olympia-1',
    maxAdults: 2,
    promoPackages: [
      { id: 'pkg-stay-3-1', name: 'Solo Traveler Deal', persons: 1, days: 3, nights: 2, price: 900, inclusions: ['Breakfast', 'Free Wi-Fi'], description: 'Budget-friendly solo stay with all essentials covered.' },
    ]
  },
  {
    id: 'stay-4',
    name: 'Camiguin Camp Asgard by Viajeros',
    type: 'Resort',
    rating: 4.6,
    reviews: 38,
    price: 995,
    image: '/images/campasgard.jpg',
    tags: ['Nature', 'Family', 'Poblacion'],
    businessId: 'biz-asgard-1',
    maxAdults: 6,
    childPrice: 500,
    tweenPrice: 700,
    promoPackages: [
      { id: 'pkg-stay-4-1', name: 'Nature Retreat', persons: 2, days: 3, nights: 2, price: 1800, inclusions: ['Breakfast', 'Nature Walk', 'Campfire Dinner'], description: 'Reconnect with nature in this immersive camp experience.' },
      { id: 'pkg-stay-4-2', name: 'Family Adventure', persons: 4, days: 4, nights: 3, price: 3500, inclusions: ['Breakfast for all', 'Guided Hike', 'Packed Lunch', 'Souvenir Photos'], description: 'Action-packed family adventure in the heart of Catarman.' },
    ]
  },
  {
    id: 'stay-5',
    name: 'Camiguin Atlantis Pension House by Viajeros',
    type: 'Pension House',
    rating: 4.1,
    reviews: 22,
    price: 2500,
    image: '/images/atlantispensionhouse.jpg',
    tags: ['Group Stay', 'Panghiawan', 'Budget'],
    businessId: 'biz-atlantis-1',
    maxAdults: 8,
    childPrice: 1250,
    tweenPrice: 1800,
    promoPackages: [
      { id: 'pkg-stay-5-1', name: 'Group Getaway', persons: 6, days: 3, nights: 2, price: 6500, inclusions: ['Breakfast for all', 'Group Dinner', 'Tour Coordination'], description: 'Designed for groups wanting to experience Catarman together.' },
    ]
  },
  {
    id: 'stay-6',
    name: 'Catarman Coral Dive Resort',
    type: 'Resort',
    rating: 4.5,
    reviews: 41,
    price: 2000,
    image: '/images/coraldiveresort.jpg',
    tags: ['Diving', 'Beachfront', 'Poblacion'],
    businessId: 'biz-coral-1',
    maxAdults: 4,
    childPrice: 1000,
    tweenPrice: 1400,
    promoPackages: [
      { id: 'pkg-stay-6-1', name: 'Dive Package', persons: 2, days: 4, nights: 3, price: 5500, inclusions: ['Breakfast', '2 Dives per Day', 'Dive Equipment', 'Lunch'], description: 'Ultimate diving experience at Catarman\'s coral-rich waters.' },
      { id: 'pkg-stay-6-2', name: 'Beachfront Romance', persons: 2, days: 3, nights: 2, price: 3500, inclusions: ['Breakfast', 'Sunset Dinner', 'Snorkeling', 'Welcome Cocktails'], description: 'Romantic beachfront escape for couples.' },
    ]
  },
  {
    id: 'stay-7',
    name: 'Seaside Traveler\'s Inn',
    type: 'Inn',
    rating: 3.9,
    reviews: 15,
    price: 1143,
    image: '/images/seasidetravellersinn.jpg',
    tags: ['Seaside', 'Private Room', 'Tangaro'],
    businessId: 'biz-seaside-inn-1',
    maxAdults: 3,
    promoPackages: [
      { id: 'pkg-stay-7-1', name: 'Seaside Escape', persons: 2, days: 3, nights: 2, price: 2000, inclusions: ['Breakfast', 'Sunset Viewing', 'Coffee & Snacks'], description: 'Relax by the sea with this intimate getaway package.' },
    ]
  },
  {
    id: 'stay-8',
    name: 'D & A Seaside Cottages',
    type: 'Homestay',
    rating: 4.3,
    reviews: 19,
    price: 1764,
    image: '/images/D&Asidecottages.jpg',
    tags: ['Cottage', 'Free Wi-Fi', 'Mahinog'],
    businessId: 'biz-da-cottages-1',
    maxAdults: 5,
    childPrice: 800,
    tweenPrice: 1200,
    promoPackages: [
      { id: 'pkg-stay-8-1', name: 'Cottage Living', persons: 4, days: 4, nights: 3, price: 4500, inclusions: ['Breakfast', 'Free Wi-Fi', 'BBQ Dinner', 'Beach Towels'], description: 'Experience cottage living with all the modern comforts.' },
    ]
  },
  {
    id: 'stay-9',
    name: 'Taylor\'s Plantacion Resort',
    type: 'Resort',
    rating: 4.4,
    reviews: 26,
    price: 2500,
    image: '/images/plantacion.jpg',
    tags: ['Garden', 'Quiet', 'Tangaro'],
    businessId: 'biz-taylor-1',
    maxAdults: 4,
    childPrice: 1200,
    tweenPrice: 1700,
    promoPackages: [
      { id: 'pkg-stay-9-1', name: 'Garden Retreat', persons: 2, days: 3, nights: 2, price: 4200, inclusions: ['Breakfast', 'Garden Tour', 'Afternoon Tea', 'Spa Access'], description: 'Peaceful garden retreat for those seeking tranquility.' },
    ]
  },
  {
    id: 'stay-dininggasan',
    name: 'Dininggasan Accommodation',
    type: 'Resort',
    rating: 4.5,
    reviews: 0,
    price: 3800,
    image: '/images/dininggasan/room.jpg',
    tags: ['Group Stay', 'Family', 'Catarman'],
    businessId: 'dininggasan-catarman',
    maxAdults: 8,
    promoPackages: [
      { id: 'pkg-dininggasan-1', name: 'Group Stay', persons: 8, days: 2, nights: 1, price: 3800, inclusions: ['Room for 8 pax', 'Basic Amenities'], description: 'Perfect for group stays and families.' },
    ]
  },
];
