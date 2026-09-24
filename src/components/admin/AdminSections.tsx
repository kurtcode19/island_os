import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { toast } from 'sonner';
import { DININGGASAN_BUSINESS_ID, DININGGASAN_ROOM_COUNT, DININGGASAN_IMAGES } from '../../data/dininggasanData';
import { dayKey, backfillRoomAssignments } from '../../lib/roomAssignment';
import {
  UilTrashAlt, UilPlus, UilDollarSign, UilBedDouble, UilChartPie, UilSave, UilBell, UilUsersAlt, UilShield
} from '@/icons';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts';

export function DashboardSection({ bookings }: { bookings: any[] }) {
  const paid = bookings.filter(b => b.paymentStatus === 'PAID' || b.paymentStatus === 'VERIFIED');
  const totalRevenue = paid.reduce((s, b) => s + (b.amount || 0), 0);
  const confirmed = bookings.filter(b => b.status === 'confirmed' || b.status === 'checked_in').length;
  const pending = bookings.filter(b => b.status === 'pending').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;

  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleString('default', { month: 'short' });
    const revenue = paid.filter(b => {
      const t = b.createdAt?.toDate?.() || new Date(b.date || 0);
      return t.toISOString().slice(0, 7) === key;
    }).reduce((s, b) => s + (b.amount || 0), 0);
    const count = bookings.filter(b => {
      const t = b.createdAt?.toDate?.() || new Date(b.date || 0);
      return t.toISOString().slice(0, 7) === key;
    }).length;
    return { label, revenue, count };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Overview of Dininggasan operations</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: bookings.length, color: 'text-gray-900' },
          { label: 'Confirmed', value: confirmed, color: 'text-green-600' },
          { label: 'Pending', value: pending, color: 'text-yellow-600' },
          { label: 'Revenue (Paid)', value: `₱${totalRevenue.toLocaleString()}`, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-semibold mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Last 6 Months</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" fontSize={12} stroke="#94a3b8" />
            <YAxis fontSize={12} stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="revenue" fill="#0f172a" radius={[6, 6, 0, 0]} name="Revenue (₱)" />
            <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} name="Bookings" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Cancelled bookings: <span className="font-bold text-red-600">{cancelled}</span></p>
      </div>
    </div>
  );
}

export function RoomsSection({ bookings, getRoomStatus, selectedDate, setSelectedDate }: {
  bookings: any[];
  getRoomStatus: (roomId: number, checkDate?: string) => { status: string; color: string };
  selectedDate: string;
  setSelectedDate: (d: string) => void;
}) {
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [price, setPrice] = useState('');
  const [backfilling, setBackfilling] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'businesses', DININGGASAN_BUSINESS_ID)).then(snap => {
      if (snap.exists()) setRoomTypes(snap.data().roomTypes || []);
    });
  }, []);

  const savePrice = async (idx: number) => {
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) { toast.error('Enter a valid price'); return; }
    const next = roomTypes.map((rt, i) => i === idx ? { ...rt, basePrice: p } : rt);
    try {
      await updateDoc(doc(db, 'businesses', DININGGASAN_BUSINESS_ID), { roomTypes: next });
      setRoomTypes(next);
      setEditIdx(null);
      toast.success('Room rate updated');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'businesses');
    }
  };

  const roomCount = roomTypes.find(rt => rt.unitCount)?.unitCount
    || roomTypes[0]?.unitCount
    || DININGGASAN_ROOM_COUNT;
  const rooms = Array.from({ length: roomCount }, (_, i) => ({ id: i + 1, number: String(i + 1).padStart(2, '0') }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
        <p className="text-gray-600">Room status and rate management</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Status — {selectedDate}</h3>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                setBackfilling(true);
                try {
                  const n = await backfillRoomAssignments(bookings);
                  toast.success(n ? `Assigned rooms to ${n} booking(s)` : 'All stays already have rooms');
                } catch { toast.error('Backfill failed'); }
                finally { setBackfilling(false); }
              }}
              disabled={backfilling}
              className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50">
              {backfilling ? 'Assigning...' : 'Assign missing rooms'}
            </button>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm" />
            <button onClick={() => setSelectedDate(dayKey(new Date()))}
              className="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg">Today</button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {rooms.map(room => {
            const s = getRoomStatus(room.id, selectedDate);
            return (
              <div key={room.id} className={`p-4 rounded-lg text-white text-center ${s.color}`}
                title={`Room ${room.number} — ${s.status}`}>
                <div className="font-bold">{room.number}</div>
                <div className="text-[10px] font-semibold capitalize">{s.status}</div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-300 inline-block" /> Available</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Booked</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500 inline-block" /> Pending</span>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Types</h3>
        <div className="space-y-3">
          {roomTypes.map((rt, idx) => (
            <div key={rt.id || idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <img src={rt.image || DININGGASAN_IMAGES.roomInterior} alt={rt.name}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{rt.name}</p>
                  <p className="text-xs text-gray-500">Capacity: {rt.capacity} pax · {rt.unitCount || DININGGASAN_ROOM_COUNT} units</p>
                </div>
              </div>
              {editIdx === idx ? (
                <div className="flex items-center gap-2">
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                    className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="₱ base" />
                  <button onClick={() => savePrice(idx)} className="px-3 py-2 bg-slate-700 text-white rounded-lg text-xs font-bold">Save</button>
                  <button onClick={() => setEditIdx(null)} className="px-3 py-2 bg-gray-200 rounded-lg text-xs font-bold">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">₱{(rt.basePrice || 0).toLocaleString()}</span>
                  <button onClick={() => { setEditIdx(idx); setPrice(String(rt.basePrice || '')); }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700">Edit Rate</button>
                </div>
              )}
            </div>
          ))}
          {roomTypes.length === 0 && <p className="text-sm text-gray-500">No room types found. Seed the business doc first.</p>}
        </div>
      </div>
    </div>
  );
}

export function ExpensesSection() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'expenses'), where('businessId', '==', DININGGASAN_BUSINESS_ID));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as object) } as any));
      data.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setExpenses(data);
    }, err => console.error('expenses load error:', err));
    return () => unsub();
  }, []);

  const addExpense = async () => {
    const a = parseFloat(amount);
    if (!label.trim() || isNaN(a) || a <= 0) { toast.error('Enter label and a valid amount'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, 'expenses'), {
        businessId: DININGGASAN_BUSINESS_ID,
        label: label.trim(),
        amount: a,
        createdAt: serverTimestamp(),
      });
      setLabel(''); setAmount('');
      toast.success('Expense added');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'expenses');
    } finally { setSaving(false); }
  };

  const removeExpense = async (id: string) => {
    if (!window.confirm('Delete this expense?')) return;
    try { await deleteDoc(doc(db, 'expenses', id)); toast.success('Expense deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
        <p className="text-gray-600">Track operational costs</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex gap-3 mb-6">
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Utilities, Supplies"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" min="0" placeholder="Amount (₱)"
            className="w-40 px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
          <button onClick={addExpense} disabled={saving}
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50">
            <UilPlus size="16" /> Add
          </button>
        </div>
        <div className="flex justify-between p-4 bg-gray-50 rounded-lg mb-4">
          <span className="text-sm font-semibold text-gray-600">Total expenses</span>
          <span className="font-bold text-gray-900">₱{total.toLocaleString()}</span>
        </div>
        {expenses.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No expenses recorded yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {expenses.map(e => (
              <div key={e.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{e.label}</p>
                  <p className="text-xs text-gray-400">{e.createdAt?.toDate?.().toLocaleDateString() || ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">₱{(e.amount || 0).toLocaleString()}</span>
                  <button onClick={() => removeExpense(e.id)} className="text-red-400 hover:text-red-600">
                    <UilTrashAlt size="16" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function RatesSection() {
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'businesses', DININGGASAN_BUSINESS_ID)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setRoomTypes(d.roomTypes || []);
        setTimeSlots(d.functionRoom?.timeSlots || []);
        setServices(d.services || []);
      }
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const bizSnap = await getDoc(doc(db, 'businesses', DININGGASAN_BUSINESS_ID));
      const prev = bizSnap.exists() ? bizSnap.data() : {};
      await updateDoc(doc(db, 'businesses', DININGGASAN_BUSINESS_ID), {
        roomTypes,
        functionRoom: { ...(prev.functionRoom || {}), timeSlots },
        services,
        updatedAt: serverTimestamp(),
      });
      toast.success('Rates saved');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'businesses');
    } finally { setSaving(false); }
  };

  const updateField = (arr: any[], setArr: (v: any[]) => void, idx: number, field: string, value: number) => {
    setArr(arr.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading rates...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rate Calculator</h2>
          <p className="text-gray-600">Edit room, function room, and service rates</p>
        </div>
        <button onClick={save} disabled={saving}
          className="px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50">
          <UilSave size="16" /> {saving ? 'Saving...' : 'Save Rates'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><UilBedDouble size="18" /> Rooms</h3>
        <div className="space-y-3">
          {roomTypes.map((rt, i) => (
            <div key={rt.id || i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <span className="flex-1 font-medium text-gray-900">{rt.name}</span>
              <label className="text-xs text-gray-500">Base ₱</label>
              <input type="number" value={rt.basePrice || 0} onChange={e => updateField(roomTypes, setRoomTypes, i, 'basePrice', Number(e.target.value))}
                className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><UilDollarSign size="18" /> Function Room Slots</h3>
        <div className="space-y-3">
          {timeSlots.map((ts, i) => (
            <div key={ts.id || i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <span className="flex-1 font-medium text-gray-900">{ts.label}</span>
              <label className="text-xs text-gray-500">Base ₱</label>
              <input type="number" value={ts.basePrice || 0} onChange={e => updateField(timeSlots, setTimeSlots, i, 'basePrice', Number(e.target.value))}
                className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <label className="text-xs text-gray-500">Succeeding ₱/hr</label>
              <input type="number" value={ts.succeedingRate || 0} onChange={e => updateField(timeSlots, setTimeSlots, i, 'succeedingRate', Number(e.target.value))}
                className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
        <div className="space-y-3">
          {services.map((sv, i) => (
            <div key={sv.id || i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <span className="flex-1 font-medium text-gray-900">{sv.name}</span>
              <label className="text-xs text-gray-500">Price ₱</label>
              <input type="number" value={sv.price || 0} onChange={e => updateField(services, setServices, i, 'price', Number(e.target.value))}
                className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PerformanceSection({ bookings }: { bookings: any[] }) {
  const confirmed = bookings.filter(b => b.status === 'confirmed' || b.status === 'checked_in').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;
  const total = bookings.length || 1;
  const occupancy = Math.round((confirmed / Math.max(total, DININGGASAN_ROOM_COUNT)) * 100);
  const paid = bookings.filter(b => b.paymentStatus === 'PAID' || b.paymentStatus === 'VERIFIED');
  const revenue = paid.reduce((s, b) => s + (b.amount || 0), 0);
  const adr = paid.length ? Math.round(revenue / paid.length) : 0;

  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleString('default', { month: 'short' });
    const rev = paid.filter(b => (b.createdAt?.toDate?.() || new Date(b.date || 0)).toISOString().slice(0, 7) === key)
      .reduce((s, b) => s + (b.amount || 0), 0);
    const occ = bookings.filter(b => (b.createdAt?.toDate?.() || new Date(b.date || 0)).toISOString().slice(0, 7) === key).length;
    return { label, revenue: rev, bookings: occ };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Performance</h2>
        <p className="text-gray-600">Derived from live bookings data</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Occupancy (all-time)', value: `${occupancy}%` },
          { label: 'Avg Daily Rate', value: `₱${adr.toLocaleString()}` },
          { label: 'Cancellation Rate', value: `${Math.round((cancelled / total) * 100)}%` },
          { label: 'Paid Revenue', value: `₱${revenue.toLocaleString()}` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-semibold mb-2">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" fontSize={12} stroke="#94a3b8" />
            <YAxis fontSize={12} stroke="#94a3b8" />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} dot={{ r: 4 }} name="Revenue (₱)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SettingsSection() {
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [notifications, setNotifications] = useState({ bookingAlerts: true, newReviews: true, checkInAlerts: true, weeklyDigest: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'businesses', DININGGASAN_BUSINESS_ID)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setContact(d.contact || '');
        setEmail(d.email || '');
        setName(d.name || '');
        if (d.notifications) setNotifications(d.notifications);
      }
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'businesses', DININGGASAN_BUSINESS_ID), {
        name, contact, email, notifications, updatedAt: serverTimestamp(),
      });
      toast.success('Settings saved');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'businesses');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600">Business profile and notification preferences</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Business Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Contact Number</label>
          <input value={contact} onChange={e => setContact(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><UilBell size="18" /> Notifications</h3>
        {[
          { key: 'bookingAlerts', label: 'Booking Alerts', desc: 'When a new booking is received' },
          { key: 'newReviews', label: 'New Reviews', desc: 'When a guest submits a review' },
          { key: 'checkInAlerts', label: 'Check-In Alerts', desc: 'When a guest checks in via QR' },
          { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly performance summary' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
            <button
              onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !(prev as any)[item.key] }))}
              className={`w-11 h-6 rounded-full relative transition-colors ${(notifications as any)[item.key] ? 'bg-slate-700' : 'bg-gray-200'}`}
            >
              <span className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow transition-all ${(notifications as any)[item.key] ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={save} disabled={saving}
        className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium text-sm disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}

export function GuideSection() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Guide</h2>
        <p className="text-gray-600">How to get the most out of the Dininggasan dashboard</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {[
          { title: 'Bookings', body: 'View, confirm, extend, and cancel reservations. Use the room status grid to check availability for any date. The search bar filters by guest name, room number, or contact.' },
          { title: 'Room Management', body: 'Monitor room occupancy per day and edit base rates for each room type. Changes apply to new bookings immediately.' },
          { title: 'Expenses', body: 'Log operational costs (utilities, supplies, repairs). Totals update instantly and are scoped to this property only.' },
          { title: 'Rates', body: 'Edit room nightly rates, function-room session pricing (base hours + succeeding hourly rate), and service prices such as pickleball court access.' },
          { title: 'Reviews', body: 'Moderate guest reviews: approve or reject pending entries and reply directly. Approved reviews can appear publicly.' },
          { title: 'Performance', body: 'Occupancy, average daily rate, cancellation rate, and revenue trends — all computed from your live bookings.' },
          { title: 'Settings', body: 'Update contact details and toggle which in-app notifications you receive.' },
        ].map(g => (
          <div key={g.title} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
            <h3 className="font-semibold text-gray-900 mb-1">{g.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{g.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FaqSection() {
  const faqs = [
    { q: 'How do I confirm a booking?', a: 'Open the booking from the Bookings tab and click "Confirm & Proceed" on a pending reservation.' },
    { q: 'How do I extend a stay?', a: 'Open a stay booking and use the Extend Stay panel. The charge is calculated from the current room base rate × extension days.' },
    { q: 'Can I change room rates?', a: 'Yes — Room Management and Rate Calculator both edit base rates saved to the business document.' },
    { q: 'Where do expenses appear?', a: 'The Expenses tab shows a running list and monthly total for Dininggasan only.' },
    { q: 'Why is a review pending?', a: 'Reviews submitted by guests start unmoderated. Approve or reject them in the Reviews section.' },
    { q: 'How is occupancy calculated?', a: `Confirmed + checked-in bookings over the total booking count (min ${DININGGASAN_ROOM_COUNT} rooms), updated in real time.` },
  ];
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">FAQ</h2>
        <p className="text-gray-600">Frequently asked questions</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {faqs.map(f => (
          <details key={f.q} className="group p-5">
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
              {f.q}
              <span className="text-gray-400 group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

export function HelpSection() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Help Center</h2>
        <p className="text-gray-600">Get support for the Dininggasan dashboard</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold text-gray-900 text-sm mb-1">Phone</p>
          <p className="text-sm text-gray-600">0917-000-0000 (Dininggasan front desk)</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold text-gray-900 text-sm mb-1">Location</p>
          <p className="text-sm text-gray-600">Catarman, Camiguin, Philippines</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold text-gray-900 text-sm mb-1">Data issues</p>
          <p className="text-sm text-gray-600">If bookings or expenses fail to load, check your connection — the dashboard subscribes to Firestore in real time and will recover automatically.</p>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="font-semibold text-amber-800 text-sm mb-1">Payments</p>
          <p className="text-sm text-amber-700">Online payments are not yet integrated. Payment status is managed manually from each booking.</p>
        </div>
      </div>
    </div>
  );
}

export function AdminsSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [granteeRole, setGranteeRole] = useState<'LGU' | 'BUSINESS'>('LGU');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const grant = async () => {
    const target = users.find(u => (u.email || '').toLowerCase() === email.trim().toLowerCase());
    if (!target) {
      toast.error('No account with that email. They must sign in with Google once first, then retry.');
      return;
    }
    if (target.role === granteeRole && (granteeRole !== 'BUSINESS' || target.businessId === DININGGASAN_BUSINESS_ID)) {
      toast.info('Already has that role');
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', target.id), granteeRole === 'LGU'
        ? { role: 'LGU' }
        : { role: 'BUSINESS', businessId: DININGGASAN_BUSINESS_ID });
      toast.success(`Granted ${granteeRole} to ${target.email}`);
      setEmail('');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'users');
    } finally { setSaving(false); }
  };

  const roleBadge = (u: any) => {
    if (u.role === 'LGU') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">LGU</span>;
    if (u.role === 'BUSINESS' && u.businessId === DININGGASAN_BUSINESS_ID) return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Dininggasan Admin</span>;
    if (u.role === 'BUSINESS') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">Business</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">Tourist</span>;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admins</h2>
        <p className="text-gray-600">Grant dashboard access by email — user must have signed in at least once</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><UilShield size="18" /> Grant Admin Access</h3>
        <div className="flex flex-wrap gap-3">
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="user@example.com"
            className="flex-1 min-w-64 px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
          <select value={granteeRole} onChange={e => setGranteeRole(e.target.value as 'LGU' | 'BUSINESS')}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
            <option value="LGU">LGU (full admin)</option>
            <option value="BUSINESS">Dininggasan admin</option>
          </select>
          <button onClick={grant} disabled={saving || !email.trim()}
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-medium disabled:opacity-50">
            {saving ? 'Granting...' : 'Grant'}
          </button>
        </div>
        <p className="text-xs text-gray-500">Paste the email of an existing signed-in user. No invite emails are sent — they sign in with Google, then you grant here.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <UilUsersAlt size="18" className="text-gray-500" />
          <h3 className="font-semibold text-gray-900">Users ({users.length})</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{u.displayName || u.name || '—'}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{u.email || '—'}</td>
                    <td className="px-6 py-3">{roleBadge(u)}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No users yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
