export interface Location {
  id: number;
  name: string;
  type: string;
  image: string;
  coords: string;
  lat: number;
  lng: number;
  visitors: number;
  openSchedule?: string;
  ticketPrice?: string;
  contact?: string;
}

export const locations: Location[] = [
  {
    id: 1,
    name: "Sunken Cemetery",
    type: "Historical",
    image: "/images/hero-sunken.png",
    coords: "9.2014° N, 124.6675° E",
    lat: 9.2014,
    lng: 124.6675,
    visitors: 42,
    openSchedule: "Open daily, 6:00 AM - 6:00 PM",
    ticketPrice: "Free (snorkeling gear rental available)"
  },
  {
    id: 2,
    name: "Old Spanish Church Ruins",
    type: "Historical",
    image: "/images/old-spanish-church-ruins-big-tree.jpg",
    coords: "9.2123° N, 124.6543° E",
    lat: 9.2123,
    lng: 124.6543,
    visitors: 28,
    openSchedule: "Open daily, 8:00 AM - 5:00 PM",
    ticketPrice: "Free"
  },
  {
    id: 7,
    name: "Tuasan Falls",
    type: "Nature",
    image: "/images/tuasan.jpg",
    coords: "9.1833° N, 124.6667° E",
    lat: 9.1833,
    lng: 124.6667,
    visitors: 65,
    openSchedule: "Open daily, 7:00 AM - 5:00 PM",
    ticketPrice: "₱50 entrance fee"
  },
  {
    id: 8,
    name: "Bura Soda Water Park",
    type: "Nature",
    image: "/images/borasoda.png",
    coords: "9.1800° N, 124.6700° E",
    lat: 9.1800,
    lng: 124.6700,
    visitors: 88,
    openSchedule: "Open daily, 8:00 AM - 7:00 PM",
    ticketPrice: "₱100 entrance fee"
  },
  {
    id: 9,
    name: "Sto. Niño Cold Spring",
    type: "Nature",
    image: "/images/sto.nino.jpg",
    coords: "9.1700° N, 124.6500° E",
    lat: 9.1700,
    lng: 124.6500,
    visitors: 110,
    openSchedule: "Open daily, 7:00 AM - 6:00 PM",
    ticketPrice: "₱50 entrance fee"
  }
];
