/**
 * Island OS - Demo Data Seeder
 * 
 * Seeds Firestore with demo data using Firebase Auth + REST API.
 * 
 * Usage:
 *   npx tsx scripts/seed-demo.ts
 *   npx tsx scripts/seed-demo.ts --update-rules
 * 
 * --update-rules: Also deploys the local firestore.rules to Firebase.
 *   This requires an interactive OAuth2 device flow (opens a URL to authorize).
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ════════════════════════════════════════════════════════════════════
// Config
// ════════════════════════════════════════════════════════════════════

interface FirebaseConfig {
  apiKey: string;
  projectId: string;
}

function loadConfig(): FirebaseConfig {
  let apiKey: string | undefined;
  let projectId: string | undefined;

  const envPath = resolve(__dirname, '..', '.env');
  if (existsSync(envPath)) {
    const env = readFileSync(envPath, 'utf-8');
    const get = (key: string) => {
      const m = env.split('\n').find(l => l.startsWith(`${key}=`));
      return m ? m.split('=').slice(1).join('=').trim() : undefined;
    };
    apiKey = get('VITE_FIREBASE_API_KEY');
    projectId = get('VITE_FIREBASE_PROJECT_ID');
  }

  if (!apiKey || !projectId) {
    const cfgPath = resolve(__dirname, '..', 'firebase-applet-config.json');
    if (existsSync(cfgPath)) {
      const cfg = JSON.parse(readFileSync(cfgPath, 'utf-8'));
      apiKey = apiKey || cfg.apiKey;
      projectId = projectId || cfg.projectId;
    }
  }

  if (!apiKey || !projectId) {
    throw new Error('Missing Firebase config. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in .env');
  }

  return { apiKey, projectId };
}

// ════════════════════════════════════════════════════════════════════
// Firebase Anonymous Auth
// ════════════════════════════════════════════════════════════════════

async function anonymousSignIn(apiKey: string): Promise<string> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true }),
    }
  );
  if (!res.ok) {
    throw new Error(`Auth failed: ${res.status} ${(await res.text()).substring(0, 200)}`);
  }
  return (await res.json()).idToken;
}

// ════════════════════════════════════════════════════════════════════
// Firestore REST API
// ════════════════════════════════════════════════════════════════════

function fsUrl(projectId: string, collection: string, docId: string) {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?documentId=${docId}`;
}

function toFS(v: any): any {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFS) } };
  if (typeof v === 'object') return { mapValue: { fields: mapFields(v) } };
  return { stringValue: String(v) };
}

function mapFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (key === 'id') continue;
    fields[key] = toFS(val);
  }
  return fields;
}

async function fsWrite(token: string, projectId: string, collection: string, docId: string, data: Record<string, any>) {
  const res = await fetch(fsUrl(projectId, collection, docId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ fields: mapFields(data) }),
  });
  if (res.ok) return true;
  const body = await res.text();
  if (body.includes('PERMISSION_DENIED')) return false;
  throw new Error(`Write ${collection}/${docId}: ${res.status} ${body.substring(0, 150)}`);
}

async function fsTestWrite(token: string, projectId: string, collection: string): Promise<boolean> {
  try {
    const ok = await fsWrite(token, projectId, collection, '_seed-test-please-ignore', { _test: 1 });
    if (ok) {
      // Clean up
      const url = fsUrl(projectId, collection, '_seed-test-please-ignore').replace('?documentId=', '/');
      fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }).catch(() => {});
    }
    return ok;
  } catch {
    return false;
  }
}

// ════════════════════════════════════════════════════════════════════
// Firestore Rules Deployment (OAuth2 device flow)
// ════════════════════════════════════════════════════════════════════

const GOOGLE_CLIENT_ID = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';

async function deviceFlowGetToken(): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  const codeRes = await fetch('https://oauth2.googleapis.com/device/code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/datastore',
    }),
  });
  if (!codeRes.ok) throw new Error(`Device code request failed: ${await codeRes.text()}`);
  const { device_code, user_code, verification_url, interval } = await codeRes.json();

  console.log(`\n🔐 === Google OAuth2 Authorization Required ===`);
  console.log(`   1. Open this URL in any browser:`);
  console.log(`      ${verification_url}`);
  console.log(`\n   2. Enter code: ${user_code}`);
  console.log(`   3. Authorize the "Firebase CLI" app`);
  console.log(`   4. Return here and press Enter\n`);

  await new Promise<void>(resolve => rl.question('   Press Enter after authorizing... ', () => resolve()));

  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, (interval || 5) * 1000));
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });
    const data = await res.json();
    if (data.access_token) { rl.close(); return data.access_token; }
    if (data.error === 'authorization_pending') continue;
    if (data.error === 'slow_down') { await new Promise(r => setTimeout(r, 5000)); continue; }
    rl.close();
    throw new Error(`OAuth2 error: ${data.error} - ${data.error_description}`);
  }
  rl.close();
  throw new Error('Timed out waiting for OAuth2 authorization');
}

async function deployRules(token: string, projectId: string): Promise<void> {
  const rulesText = readFileSync(resolve(__dirname, '..', 'firestore.rules'), 'utf-8');
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/firestoreSecurityRules`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: `projects/${projectId}/databases/(default)/firestoreSecurityRules`,
      securityRules: { source: rulesText },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    // If 409 (conflict, rules already match), that's OK
    if (res.status === 409) { console.log('   ℹ️  Rules already up to date'); return; }
    throw new Error(`Deploy rules failed: ${res.status} ${err.substring(0, 300)}`);
  }
  console.log('   ✅ Rules deployed');
}

// ════════════════════════════════════════════════════════════════════
// Demo Data
// ════════════════════════════════════════════════════════════════════

const COLLECTIONS: { name: string; docs: Record<string, any>[] }[] = [
  {
    name: 'users',
    docs: [
      {
        id: 'demo-tourist-001', name: 'Marco Salvatierra', email: 'marco@example.com',
        role: 'TOURIST', photoURL: '', createdAt: new Date('2026-01-15'),
      },
      {
        id: 'demo-business-001', name: 'Juan Dela Cruz', email: 'juan@example.com',
        role: 'BUSINESS', businessId: 'biz-homestay-catarman', photoURL: '',
        createdAt: new Date('2026-01-10'),
      },
    ],
  },
  {
    name: 'bookings',
    docs: [
      {
        id: 'booking-001', touristUid: 'demo-tourist-001',
        touristName: 'Marco Salvatierra', touristEmail: 'marco@example.com',
        serviceId: 1, serviceName: 'Coastal Point', serviceType: 'spot',
        businessId: 'catarman_lgu',
        date: '2026-07-15', checkInDate: '2026-07-15', checkOutDate: '2026-07-17',
        guests: 2, status: 'confirmed', paymentStatus: 'PAID', amount: 450,
        ticketCode: 'CTRM-TKT-A7K2', createdAt: new Date('2026-06-20'),
      },
      {
        id: 'booking-002', touristUid: 'demo-tourist-001',
        touristName: 'Marco Salvatierra', touristEmail: 'marco@example.com',
        serviceId: 'stay-2', serviceName: 'Old Church Ruins Homestay', serviceType: 'stay',
        businessId: 'biz-homestay-catarman',
        date: '2026-07-20', checkInDate: '2026-07-20', checkOutDate: '2026-07-23',
        guests: 1, status: 'pending', paymentStatus: 'UNPAID', amount: 3600,
        createdAt: new Date('2026-07-01'),
      },
      {
        id: 'booking-003', touristUid: 'demo-tourist-001',
        touristName: 'Marco Salvatierra', touristEmail: 'marco@example.com',
        serviceId: 'rental-001', serviceName: 'Honda Beat', serviceType: 'rental',
        businessId: 'biz-rental-1',
        date: '2026-07-16', guests: 1, status: 'checked_in', paymentStatus: 'PAID',
        amount: 500, checkedInAt: new Date('2026-07-16'), createdAt: new Date('2026-06-25'),
      },
    ],
  },
  {
    name: 'reviews',
    docs: [
      {
        id: 'review-001', bookingId: 'booking-001',
        touristUid: 'demo-tourist-001', touristName: 'Marco Salvatierra',
        businessId: 'catarman_lgu', serviceId: 1, serviceName: 'Coastal Point',
        rating: 5, approved: true, moderated: true,
        comment: 'Absolutely stunning views! The guide was very knowledgeable.',
        reply: 'Thank you Marco! Come visit again soon.',
        createdAt: new Date('2026-06-22'),
      },
      {
        id: 'review-002', bookingId: 'booking-003',
        touristUid: 'demo-tourist-001', touristName: 'Marco Salvatierra',
        businessId: 'biz-rental-1', serviceId: 'rental-001', serviceName: 'Honda Beat',
        rating: 4, approved: true, moderated: true,
        comment: 'Great scooter, ran smoothly throughout the trip.',
        createdAt: new Date('2026-06-28'),
      },
    ],
  },
  {
    name: 'incidents',
    docs: [
      {
        id: 'incident-001', touristUid: 'demo-tourist-001',
        touristName: 'Marco Salvatierra',
        type: 'report', lat: 9.1283, lng: 124.6767,
        message: 'Road construction near the church ruins.',
        status: 'resolved',
        createdAt: new Date('2026-06-15'), resolvedAt: new Date('2026-06-16'),
      },
    ],
  },
  {
    name: 'inventory_items',
    docs: [
      { id: 'inv-001', businessId: 'biz-homestay-catarman', name: 'Bottled Water', stock: 48, maxStock: 100, unit: 'pcs', category: 'Beverages' },
      { id: 'inv-002', businessId: 'biz-homestay-catarman', name: 'Fresh Towels', stock: 30, maxStock: 50, unit: 'pcs', category: 'Linens' },
      { id: 'inv-003', businessId: 'biz-homestay-catarman', name: 'Breakfast Meals', stock: 12, maxStock: 20, unit: 'meals', category: 'Food' },
    ],
  },
  {
    name: 'manual_earnings',
    docs: [
      { id: 'earn-001', businessId: 'biz-homestay-catarman', product: 'Souvenir T-shirts', amount: 1500, recordedAt: new Date('2026-06-28') },
      { id: 'earn-002', businessId: 'biz-homestay-catarman', product: 'Fresh Coconut Juice', amount: 600, recordedAt: new Date('2026-06-29') },
    ],
  },
  {
    name: 'audit_logs',
    docs: [
      {
        id: 'audit-001', actorUid: 'demo-tourist-001', actorName: 'Marco Salvatierra',
        actorEmail: 'marco@example.com', action: 'created', resource: 'bookings',
        resourceId: 'booking-001', details: 'Booked Coastal Point visit',
        timestamp: new Date('2026-06-20'),
      },
      {
        id: 'audit-002', actorUid: 'demo-business-001', actorName: 'Juan Dela Cruz',
        actorEmail: 'juan@example.com', action: 'updated', resource: 'bookings',
        resourceId: 'booking-003', details: 'Confirmed check-in for rental',
        timestamp: new Date('2026-07-16'),
      },
    ],
  },
  {
    name: 'businesses',
    docs: [
      {
        id: 'biz-homestay-catarman', name: 'Old Church Ruins Homestay',
        owner: 'Juan Dela Cruz', category: 'stay', verified: true,
        description: 'Cozy homestay near the historic Old Church Ruins.',
        createdAt: new Date('2026-01-10'),
      },
      {
        id: 'biz-rental-1', name: 'Camiguin Scooter Rentals',
        owner: 'Juan Dela Cruz', category: 'rental', verified: true,
        description: 'Affordable scooter and motorcycle rentals.',
        createdAt: new Date('2026-01-15'),
      },
    ],
  },
];

// ════════════════════════════════════════════════════════════════════
// Main
// ════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const updateRules = args.includes('--update-rules');

  console.log('🌱 Island OS - Demo Data Seeder\n');

  const { apiKey, projectId } = loadConfig();
  console.log(`📋 Project: ${projectId}\n`);

  // Authenticate
  console.log('🔑 Authenticating...');
  let token = await anonymousSignIn(apiKey);

  // Test write access
  const testCollection = 'bookings'; // Known to work
  const canWrite = await fsTestWrite(token, projectId, testCollection);

  if (!canWrite && !updateRules) {
    console.log('⚠️  Firestore security rules block writes.\n');
    console.log('   Run with --update-rules to deploy rules and seed all data:');
    console.log('   npx tsx scripts/seed-demo.ts --update-rules\n');
    process.exit(1);
  }

  // Deploy rules if requested
  if (updateRules) {
    console.log('🔐 Deploying Firestore security rules...\n');
    const accessToken = await deviceFlowGetToken();
    await deployRules(accessToken, projectId);
    // Re-auth after potential rule change
    token = await anonymousSignIn(apiKey);
    console.log('');
  }

  // Seed
  console.log('📦 Seeding data...\n');
  let ok = 0;
  let fail = 0;

  for (const { name, docs } of COLLECTIONS) {
    process.stdout.write(`   ${name}... `);
    let colOk = 0;
    for (const doc of docs) {
      try {
        const result = await fsWrite(token, projectId, name, doc.id, doc);
        if (result) { colOk++; ok++; } else { fail++; }
      } catch (e: any) {
        process.stdout.write(`\n      ❌ ${doc.id}: ${e.message.split('\n')[0]}`);
        fail++;
      }
    }
    console.log(`${colOk}/${docs.length} created`);
  }

  console.log(`\n📊 Results: ${ok} created, ${fail} failed\n`);

  if (fail === 0) {
    console.log('🎉 Demo data seeded successfully!\n');
    console.log('   Demo accounts (sign in with Google):');
    console.log('     Tourist:  marco@example.com');
    console.log('     Business: juan@example.com\n');
    console.log('   Links:');
    console.log('     http://localhost:3000/mobile     → Mobile app');
    console.log('     http://localhost:3000/business   → Business dashboard');
    console.log('     http://localhost:3000/government → LGU dashboard');
  }
}

main().catch(e => { console.error(`\n❌ ${e.message}`); process.exit(1); });
