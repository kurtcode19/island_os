export type UserRole = 'TOURIST' | 'BUSINESS' | 'LGU';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string;
}

export type ServiceType = 'stay' | 'transport' | 'spot' | 'tour' | 'dining' | 'shop';

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
  description: string;
  address: string;
  contact: string;
  category: string;
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
