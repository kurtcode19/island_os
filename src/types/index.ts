export type UserRole = 'TOURIST' | 'BUSINESS' | 'LGU';

export type BusinessType = 'accommodation' | 'rental' | 'transport' | 'service' | 'shop';
export type BusinessCategory = 'resort' | 'inn' | 'homestay' | 'pension_house' | 'motorcycle' | 'bicycle' | 'car' | 'van' | 'ferry' | 'tour_operator' | 'dive_shop' | 'restaurant' | 'cafe' | 'store' | 'other';

export interface BusinessConfig {
  modules: ('analytics' | 'bookings' | 'inventory' | 'tours' | 'reviews' | 'checkin')[];
  features: string[];
  label: string;
  icon: string;
}

export const BUSINESS_TYPE_CONFIGS: Record<BusinessType, BusinessConfig> = {
  accommodation: {
    modules: ['analytics', 'bookings', 'inventory', 'reviews', 'checkin'],
    features: ['check_in_out', 'room_management', 'housekeeping'],
    label: 'Accommodation',
    icon: 'Hotel',
  },
  rental: {
    modules: ['analytics', 'bookings', 'inventory', 'reviews'],
    features: ['vehicle_tracking', 'maintenance', 'availability'],
    label: 'Rental',
    icon: 'Car',
  },
  transport: {
    modules: ['analytics', 'bookings', 'reviews'],
    features: ['schedule_management', 'route_planning', 'fleet_tracking'],
    label: 'Transport',
    icon: 'Ship',
  },
  service: {
    modules: ['analytics', 'bookings', 'reviews'],
    features: ['appointment_booking', 'service_catalog'],
    label: 'Service',
    icon: 'ConciergeBell',
  },
  shop: {
    modules: ['analytics', 'inventory', 'reviews'],
    features: ['product_catalog', 'pos_integration'],
    label: 'Shop',
    icon: 'ShoppingBag',
  },
};

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string;
}

export type ServiceType = 'stay' | 'transport' | 'spot' | 'tour' | 'dining' | 'shop' | 'rental';

export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'cancelled' | 'departed';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';

export interface Booking {
  id: string;
  touristUid: string;
  touristName: string;
  touristEmail: string;
  serviceId: string | number;
  serviceName: string;
  serviceType: ServiceType;
  businessId: string;
  date: string;
  checkInDate?: string;
  checkOutDate?: string;
  guests?: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  createdAt: any;
  checkedInAt?: any;
  departedAt?: any;
}

export type PassStatus = 'active' | 'expired' | 'revoked';

export interface TouristPass {
  id: string;
  uid: string;
  passId: string;
  displayName: string;
  email: string;
  issuedAt: any;
  expiresAt: any;
  status: PassStatus;
  scannedAt?: any[];
  lastScanned?: any;
}

export interface Review {
  id: string;
  bookingId: string;
  touristUid: string;
  touristName: string;
  businessId: string;
  serviceId: string | number;
  serviceName: string;
  rating: number;
  comment: string;
  createdAt: any;
  moderated: boolean;
  approved: boolean;
  reply?: string;
}

export interface Business {
  id: string;
  name: string;
  ownerUid: string;
  businessType: BusinessType;
  category: BusinessCategory;
  description: string;
  address: string;
  contact: string;
  verified: boolean;
  images: string[];
  createdAt: any;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  actorName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  timestamp: any;
}

export interface InventoryItem {
  id: string;
  businessId: string;
  name: string;
  stock: number;
  maxStock: number;
  unit: string;
  category: string;
}

export interface Incident {
  id: string;
  touristUid: string;
  touristName: string;
  type: 'sos' | 'report';
  lat: number;
  lng: number;
  message: string;
  status: 'active' | 'resolved';
  createdAt: any;
  resolvedAt?: any;
}
