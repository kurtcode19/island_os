export type UserRole = 'TOURIST' | 'BUSINESS' | 'LGU';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string;
}
