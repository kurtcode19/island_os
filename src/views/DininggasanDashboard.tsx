import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
  UilChartBar, UilCalendar, UilSignOutAlt, UilBuilding, UilArrowUpRight,
  UilUsersAlt, UilCreditCard, UilBedDouble, UilCheckCircle, UilTimes,
} from '@/icons';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const BUSINESS_ID = 'dininggasan-catarman';

export default function DininggasanDashboard() {
  const { logout, user } = useAuth();
  const [businessName, setBusinessName] = useState('Dininggasan');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const bizDoc = await getDoc(doc(db, 'businesses', BUSINESS_ID));
      if (bizDoc.exists()) setBusinessName(bizDoc.data().name || 'Dininggasan');
    })();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'bookings'), where('businessId', '==', BUSINESS_ID), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setBookings(data);
      setLoading(false);
      snap.docChanges().forEach(c => {
        if (c.type === 'added') {
          const d = c.doc.data() as any;
          toast.success(`New booking: ${d.serviceName || 'Service'} from ${d.touristName || 'Guest'}`);
        }
      });
    });
    return () => unsub();
  }, []);

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'checked_in');
  const revenue = bookings.filter(b => b.paymentStatus === 'PAID').reduce((s, b) => s + (b.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex">
      <aside className="w-64 bg-white border-r border-[#e8e8ed] flex flex-col shrink-0">
        <div className="p-6 border-b border-[#e8e8ed]">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center">
              <UilBuilding className="text-[#8b7355]" size="18" />
            </div>
            <span className="text-sm font-semibold text-[#1d1d1f]">{businessName}</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { icon: UilChartBar, label: 'Dashboard', to: '/admin' },
          ].map(item => (
            <Link key={item.to} to={item.to}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#f5f5f7] text-[#1d1d1f]">
              <item.icon size="18" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3">
          <button onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[#6e6e73] hover:bg-[#f5f5f7] transition-all">
            <UilSignOutAlt size="18" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-[#1d1d1f]">Dashboard</h1>
              <p className="text-sm text-[#6e6e73] mt-1">Manage Dininggasan bookings</p>
            </div>
            <Link to="/"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-[#e8e8ed] text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-all">
              <UilArrowUpRight size="16" /> View Site
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {[
              { icon: UilCalendar, label: 'Total Bookings', value: bookings.length.toString() },
              { icon: UilUsersAlt, label: 'Pending', value: pendingBookings.length.toString() },
              { icon: UilCreditCard, label: 'Revenue', value: `₱${revenue.toLocaleString()}` },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-6 border border-[#e8e8ed]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] flex items-center justify-center">
                    <stat.icon className="text-[#8b7355]" size="20" />
                  </div>
                  <span className="text-sm font-medium text-[#6e6e73]">{stat.label}</span>
                </div>
                <p className="text-3xl font-semibold text-[#1d1d1f]">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-[#e8e8ed] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e8e8ed] flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1d1d1f]">Recent Bookings</h2>
              <span className="text-xs font-medium text-[#6e6e73]">{bookings.length} total</span>
            </div>
            {loading ? (
              <div className="p-12 text-center text-sm text-[#6e6e73]">Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center text-sm text-[#6e6e73]">No bookings yet</div>
            ) : (
              <div className="divide-y divide-[#e8e8ed]">
                {bookings.slice(0, 20).map(b => (
                  <div key={b.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        b.status === 'pending' ? 'bg-amber-50' : b.status === 'confirmed' || b.status === 'checked_in' ? 'bg-emerald-50' : 'bg-[#f5f5f7]'
                      }`}>
                        {b.serviceType === 'stay' ? <UilBedDouble size="16" className={
                          b.status === 'pending' ? 'text-amber-500' : b.status === 'confirmed' ? 'text-emerald-500' : 'text-[#6e6e73]'
                        } /> : <UilCalendar size="16" className={
                          b.status === 'pending' ? 'text-amber-500' : b.status === 'confirmed' ? 'text-emerald-500' : 'text-[#6e6e73]'
                        } />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1d1d1f]">{b.serviceName || 'Booking'}</p>
                        <p className="text-xs text-[#6e6e73]">{b.touristName} · {b.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        b.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-[#f5f5f7] text-[#6e6e73]'
                      }`}>
                        {b.status}
                      </span>
                      <span className="text-sm font-semibold text-[#1d1d1f]">₱{(b.amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
