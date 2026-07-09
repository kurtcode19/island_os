import * as admin from 'firebase-admin';

admin.initializeApp();

export const db = admin.firestore();
export const auth = admin.auth();
export const Timestamp = admin.firestore.Timestamp;
export const FieldValue = admin.firestore.FieldValue;

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
export const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY || '';
export const PAYMONGO_WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET || '';

export const PLATFORM_FEE = 150;
export const DEFAULT_COMMISSION_RATE = 10;
