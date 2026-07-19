import { getAuth } from 'firebase/auth';
import { auth } from '../firebase';

// ponytail: cloud function URLs. Configure via env vars or hardcode after deploy
const FUNCTIONS_BASE = import.meta.env.VITE_FUNCTIONS_BASE || 'http://127.0.0.1:5001/islandos/us-central1';
function getFunctionsUrl(name: string) {
  return `${FUNCTIONS_BASE}/${name}`;
}

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

async function callFunction(name: string, body: any) {
  const token = await getAuthToken();
  const res = await fetch(getFunctionsUrl(name), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function createStripeConnectAccountLink(businessId: string): Promise<{ url: string; accountId: string }> {
  return callFunction('createStripeConnectAccountLink', { businessId });
}

export async function createStripeLoginLink(businessId: string): Promise<{ url: string }> {
  return callFunction('createStripeLoginLink', { businessId });
}

export async function createSubscriptionCheckout(priceId: string, businessId: string): Promise<{ url: string; sessionId: string }> {
  return callFunction('createSubscriptionCheckout', { priceId, businessId });
}

export async function manualPayout(businessId?: string): Promise<any> {
  return callFunction('manualPayout', { businessId: businessId || null });
}

export async function resolveDispute(disputeId: string, resolution: string, refundTourist: boolean): Promise<any> {
  return callFunction('resolveDispute', { disputeId, resolution, refundTourist });
}


