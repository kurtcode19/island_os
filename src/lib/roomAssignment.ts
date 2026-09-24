import {
  collection, doc, onSnapshot, query, setDoc, where, deleteDoc, getDocs, updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { DININGGASAN_BUSINESS_ID, DININGGASAN_ROOM_COUNT } from '../data/dininggasanData';

export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function stayRange(b: any): { start: string; end: string } | null {
  if (b?.checkInTimestamp?.toDate && b?.checkOutTimestamp?.toDate) {
    return { start: dayKey(b.checkInTimestamp.toDate()), end: dayKey(b.checkOutTimestamp.toDate()) };
  }
  const r = b?.date?.split(' - ');
  if (!r || r.length !== 2) return null;
  const ci = new Date(r[0]);
  const co = new Date(r[1]);
  if (isNaN(ci.getTime()) || isNaN(co.getTime())) return null;
  return { start: dayKey(ci), end: dayKey(co) };
}

export function overlaps(start: string, end: string, oStart: string, oEnd: string) {
  return start < oEnd && end > oStart;
}

export function pickFreeRoomNumber(
  occupancy: { roomNumber?: string; start?: string; end?: string; status?: string }[],
  start: string,
  end: string,
  roomCount = DININGGASAN_ROOM_COUNT,
): string | null {
  const taken = new Set(
    occupancy
      .filter(o => o.status !== 'cancelled' && o.roomNumber && o.start && o.end && overlaps(start, end, o.start, o.end))
      .map(o => o.roomNumber!),
  );
  for (let i = 1; i <= roomCount; i++) {
    const num = String(i).padStart(2, '0');
    if (!taken.has(num)) return num;
  }
  return null;
}

export function subscribeOccupancy(cb: (rows: any[]) => void, onError?: () => void) {
  const q = query(collection(db, 'room_occupancy'), where('businessId', '==', DININGGASAN_BUSINESS_ID));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as any))), onError || (() => {}));
}

export async function writeOccupancy(bookingId: string, data: {
  businessId: string;
  roomNumber: string;
  start: string;
  end: string;
  status: string;
  touristUid: string;
}) {
  await setDoc(doc(db, 'room_occupancy', bookingId), data, { merge: true });
}

export async function setOccupancyStatus(bookingId: string, status: string) {
  await setDoc(doc(db, 'room_occupancy', bookingId), { status }, { merge: true });
}

export async function removeOccupancy(bookingId: string) {
  try { await deleteDoc(doc(db, 'room_occupancy', bookingId)); } catch { /* already gone */ }
}

export async function loadOccupancy(): Promise<any[]> {
  const q = query(collection(db, 'room_occupancy'), where('businessId', '==', DININGGASAN_BUSINESS_ID));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
}

/** Assign roomNumber + occupancy to dininggasan stay bookings that are missing them. */
export async function backfillRoomAssignments(bookings: any[]): Promise<number> {
  const occupancy = await loadOccupancy();
  let fixed = 0;
  for (const b of bookings) {
    if (b.businessId !== DININGGASAN_BUSINESS_ID) continue;
    if (b.serviceType !== 'stay' || b.bookingCategory === 'event') continue;
    if (b.status === 'cancelled') continue;
    const range = stayRange(b);
    if (!range) continue;
    const hasOcc = occupancy.some(o => o.id === b.id);
    if (b.roomNumber && hasOcc) continue;
    const roomNumber = b.roomNumber || pickFreeRoomNumber(occupancy, range.start, range.end);
    if (!roomNumber) continue;
    await writeOccupancy(b.id, {
      businessId: b.businessId,
      roomNumber,
      start: range.start,
      end: range.end,
      status: b.status || 'pending',
      touristUid: b.touristUid || '',
    });
    occupancy.push({ id: b.id, roomNumber, start: range.start, end: range.end, status: b.status });
    if (!b.roomNumber) {
      await updateDoc(doc(db, 'bookings', b.id), { roomNumber });
      fixed++;
    }
  }
  return fixed;
}
