import { Ship, Car, Bike } from 'lucide-react';

export const transportOptions = [
  {
    id: 'trans_1',
    title: 'Fast Craft Ferry',
    provider: 'SuperCat / OceanJet',
    route: 'Balingoan ↔ Benoni',
    duration: '45 mins',
    price: 450,
    businessId: 'ferry_co',
    icon: Ship,
    color: 'bg-island-ocean',
  },
  {
    id: 'trans_2',
    title: 'Private Van Rental',
    provider: 'Camiguin Tours',
    route: 'Island-wide / Airport Transfer',
    duration: 'Full Day',
    price: 2500,
    businessId: 'van_rentals_inc',
    icon: Car,
    color: 'bg-island-emerald',
  },
  {
    id: 'trans_3',
    title: 'Scooter Rental',
    provider: 'Local Rentals',
    route: 'Self-drive',
    duration: '24 Hours',
    price: 500,
    businessId: 'local_bikes',
    icon: Bike,
    color: 'bg-island-coral',
  },
];

export const schedules = [
  { time: '06:00 AM', from: 'Balingoan', to: 'Benoni', status: 'On Time' },
  { time: '08:30 AM', from: 'Balingoan', to: 'Benoni', status: 'On Time' },
  { time: '10:45 AM', from: 'Balingoan', to: 'Benoni', status: 'Delayed (15m)', type: 'warning' },
  { time: '01:30 PM', from: 'Balingoan', to: 'Benoni', status: 'On Time' },
  { time: '04:00 PM', from: 'Balingoan', to: 'Benoni', status: 'On Time' },
];
