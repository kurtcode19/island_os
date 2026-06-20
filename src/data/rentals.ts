import { Bike, Car, Truck } from 'lucide-react';

export interface RentalVehicle {
  id: string;
  name: string;
  type: string;
  transmission: string;
  capacity: number;
  rate: number;
  rateUnit: 'hour' | 'day' | 'week';
  image: string;
  available: number;
  features: string[];
  businessId: string;
  merchantId: string;
  icon: any;
  color: string;
}

export interface RentalMerchant {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  contact: string;
  image: string;
  icon: any;
}

export const rentalMerchants: RentalMerchant[] = [
  {
    id: 'local_bikes',
    name: 'Local Bike Rental',
    description: 'Affordable two-wheelers for island exploration',
    location: 'Poblacion, Catarman',
    rating: 4.7,
    contact: '0917-123-4567',
    image: '/images/explore-bg.jpg',
    icon: Bike,
  },
  {
    id: 'van_rentals_inc',
    name: 'Van Rentals Inc.',
    description: 'Group transport and family-sized vehicles',
    location: 'Looc, Catarman',
    rating: 4.5,
    contact: '0918-765-4321',
    image: '/images/explore-bg.jpg',
    icon: Truck,
  },
];

export function getMerchantByVehicle(vehicle: RentalVehicle): RentalMerchant | undefined {
  return rentalMerchants.find(m => m.id === vehicle.merchantId);
}

export function getVehiclesByMerchant(merchantId: string): RentalVehicle[] {
  return rentalVehicles.filter(v => v.merchantId === merchantId);
}

export const rentalVehicles: RentalVehicle[] = [
  {
    id: 'rent-1',
    name: 'Scooter',
    type: 'Motorcycle',
    transmission: 'Automatic',
    capacity: 2,
    rate: 500,
    rateUnit: 'day',
    image: '/images/camiguin-rent-a-scooters.jpg',
    available: 8,
    features: ['Helmet included', 'Parking brake', 'Storage box', 'Fuel efficient'],
    businessId: 'local_bikes',
    merchantId: 'local_bikes',
    icon: Bike,
    color: 'bg-sky-500',
  },
  {
    id: 'rent-2',
    name: 'Mountain Bike',
    type: 'Bicycle',
    transmission: '21-Speed',
    capacity: 1,
    rate: 250,
    rateUnit: 'day',
    image: '/images/mountainbike.jpg',
    available: 5,
    features: ['Helmet included', 'Lock included', 'Trail ready', 'Lightweight'],
    businessId: 'local_bikes',
    merchantId: 'local_bikes',
    icon: Bike,
    color: 'bg-emerald-500',
  },
  {
    id: 'rent-3',
    name: 'Tricycle',
    type: 'Local Transport',
    transmission: 'Manual',
    capacity: 4,
    rate: 300,
    rateUnit: 'hour',
    image: '/images/tricycle.jpg',
    available: 12,
    features: ['Local driver', 'Tour guide', 'Multi-stop', 'Weather roof'],
    businessId: 'van_rentals_inc',
    merchantId: 'van_rentals_inc',
    icon: Truck,
    color: 'bg-amber-500',
  },
  {
    id: 'rent-4',
    name: 'Multicab',
    type: 'Shared Van',
    transmission: 'Manual',
    capacity: 10,
    rate: 1500,
    rateUnit: 'day',
    image: '/images/multicab.jpeg',
    available: 3,
    features: ['Driver included', 'AC', 'Group tour', 'Cargo space'],
    businessId: 'van_rentals_inc',
    merchantId: 'van_rentals_inc',
    icon: Car,
    color: 'bg-violet-500',
  },
  {
    id: 'rent-5',
    name: 'SUV',
    type: 'Car',
    transmission: 'Automatic',
    capacity: 5,
    rate: 3000,
    rateUnit: 'day',
    image: '/images/suv.jpg',
    available: 2,
    features: ['Full insurance', 'AC', 'GPS navigation', 'Bluetooth'],
    businessId: 'van_rentals_inc',
    merchantId: 'van_rentals_inc',
    icon: Car,
    color: 'bg-indigo-500',
  },

];
