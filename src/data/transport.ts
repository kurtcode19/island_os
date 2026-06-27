import { UilShip, UilCar } from '@/icons';

export interface TransportOption {
  id: string;
  title: string;
  provider: string;
  route: string;
  duration: string;
  price: number;
  businessId: string;
  icon: any;
  color: string;
  tab: 'to' | 'from' | 'within';
  hasRoundtrip?: boolean;
  maxPassengers?: number;
}

export const transportOptions: TransportOption[] = [
  {
    id: 'trans_1',
    title: 'Fast Craft Ferry',
    provider: 'SuperCat / OceanJet',
    route: 'Balingoan ↔ Benoni',
    duration: '45 mins',
    price: 450,
    businessId: 'ferry_co',
    icon: UilShip,
    color: 'bg-island-ocean',
    tab: 'to',
    hasRoundtrip: true,
    maxPassengers: 200,
  },
  {
    id: 'trans_6',
    title: 'RORO Ferry',
    provider: '2GO / Cokaliong',
    route: 'Balingoan ↔ Benoni',
    duration: '1.5 hours',
    price: 300,
    businessId: 'ferry_co',
    icon: UilShip,
    color: 'bg-blue-500',
    tab: 'to',
    hasRoundtrip: true,
    maxPassengers: 500,
  },
  {
    id: 'trans_4',
    title: 'Fast Craft Ferry',
    provider: 'SuperCat / OceanJet',
    route: 'Benoni → Balingoan',
    duration: '45 mins',
    price: 450,
    businessId: 'ferry_co',
    icon: UilShip,
    color: 'bg-island-ocean',
    tab: 'from',
    hasRoundtrip: true,
    maxPassengers: 200,
  },
  {
    id: 'trans_7',
    title: 'RORO Ferry',
    provider: '2GO / Cokaliong',
    route: 'Benoni → Balingoan',
    duration: '1.5 hours',
    price: 300,
    businessId: 'ferry_co',
    icon: UilShip,
    color: 'bg-blue-500',
    tab: 'from',
    hasRoundtrip: true,
    maxPassengers: 500,
  },
  {
    id: 'trans_2',
    title: 'Private Van Rental',
    provider: 'Camiguin Tours',
    route: 'Island-wide / Airport Transfer',
    duration: 'Full Day',
    price: 2500,
    businessId: 'van_rentals_inc',
    icon: UilCar,
    color: 'bg-island-emerald',
    tab: 'within',
    maxPassengers: 10,
  },
  {
    id: 'trans_3',
    title: 'Scooter Rental',
    provider: 'Local Rentals',
    route: 'Self-drive',
    duration: '24 Hours',
    price: 500,
    businessId: 'local_bikes',
    icon: UilCar,
    color: 'bg-island-coral',
    tab: 'within',
    maxPassengers: 2,
  },
  {
    id: 'trans_5',
    title: 'Tricycle Hire',
    provider: 'Catarman Tricycle Assoc.',
    route: 'Within Catarman',
    duration: 'Per Trip',
    price: 150,
    businessId: 'local_trike',
    icon: UilCar,
    color: 'bg-island-sunset',
    tab: 'within',
    maxPassengers: 3,
  },
];

export const schedules = [
  { time: '06:00 AM', from: 'Balingoan', to: 'Benoni', status: 'On Time' },
  { time: '08:30 AM', from: 'Balingoan', to: 'Benoni', status: 'On Time' },
  { time: '10:45 AM', from: 'Balingoan', to: 'Benoni', status: 'Delayed (15m)', type: 'warning' },
  { time: '01:30 PM', from: 'Balingoan', to: 'Benoni', status: 'On Time' },
  { time: '04:00 PM', from: 'Balingoan', to: 'Benoni', status: 'On Time' },
];
