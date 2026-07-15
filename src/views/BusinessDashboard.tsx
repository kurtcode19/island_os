import React, { useState, useEffect } from 'react';
import { 
  UilChartBar as BarChart3, 
  UilCalendar as Calendar, 
  UilPackage as Package, 
  UilCompass as Compass, 
  UilStar as Star, 
  UilSetting as Settings, 
  UilSearch as Search, 
  UilBell as Bell, 
  UilTimes as X,
  UilQrcodeScan as Scan,
  UilDashboard as LayoutDashboard,
  UilSignOutAlt as LogOut,
  UilStar as Sparkles,
  UilArrowUpRight as ArrowUpRight,
  UilChartGrowth as TrendingUp,
  UilCreditCard as CreditCard,
  UilUsersAlt as Users,
  UilBuilding as Hotel,
  UilCar as Car,
  UilShip as Ship,
  UilRefresh as RefreshCw,
  UilDollarSign as DollarSign,
  UilShoppingBag as ShoppingBag,
  UilExclamationTriangle as AlertTriangle,
  UilCheckCircle as CheckCircle2,
  UilPlus as Plus,
  UilClock as Clock
} from '@/icons';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/shared/StatCard';
import { SidebarItem } from '../components/shared/SidebarItem';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion } from 'motion/react';
import { toast } from 'sonner';

// Business Modules
import AnalyticsModule from '../components/business/AnalyticsModule';
import BookingsModule from '../components/business/BookingsModule';
import InventoryModule from '../components/business/InventoryModule';
import ToursModule from '../components/business/ToursModule';
import ReviewsModule from '../components/business/ReviewsModule';
import SettingsModule from '../components/business/SettingsModule';
import CheckInView from './CheckInView';
import RentalModule from '../components/business/RentalModule';

import { businesses as staticBusinesses } from '../data/businesses';
import { BusinessType, BUSINESS_TYPE_CONFIGS } from '../types';
import { getPilotConfig, type PilotConfig } from '../lib/pilotService';

const typeIcons: Record<string, any> = {
  accommodation: Hotel,
  rental: Car,
  transport: Ship,
};

export default function BusinessDashboard() {
  const { logout, profile } = useAuth();
  const location = useLocation();
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [businessName, setBusinessName] = useState('Business');
  const [pilotConfig, setPilotConfig] = useState<PilotConfig | null>(null);

  useEffect(() => {
    getPilotConfig().then(setPilotConfig);
  }, []);

  const effectiveBusinessId = pilotConfig?.enabled && pilotConfig.businessId
    ? pilotConfig.businessId
    : profile?.businessId;

  useEffect(() => {
    if (!effectiveBusinessId) return;

    const loadBusinessType = async () => {
      try {
        const bizDoc = await getDoc(doc(db, 'businesses', effectiveBusinessId!));
        if (bizDoc.exists()) {
          const data = bizDoc.data();
          setBusinessType(data.businessType as BusinessType);
          setBusinessName(data.name || 'Business');
          return;
        }
      } catch {}
      const staticBiz = staticBusinesses.find(b => b.id === effectiveBusinessId);
      if (staticBiz) {
        setBusinessType(staticBiz.businessType);
        setBusinessName(staticBiz.name);
      }
    };

    loadBusinessType();
  }, [effectiveBusinessId]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [previousBookingIds, setPreviousBookingIds] = useState<Set<string>>(new Set());
  const [dashboardStats, setDashboardStats] = useState({
    totalBookings: 0,
    pendingCount: 0,
    todaysCheckIns: 0,
    weeklyRevenue: 0,
    activeBookings: 0,
  });

  useEffect(() => {
    if (!effectiveBusinessId) return;

    const q = query(
      collection(db, 'bookings'),
      where('businessId', '==', effectiveBusinessId),
      orderBy('createdAt', 'desc')
    );

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const todayStr = now.toLocaleDateString();

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allBookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const pendingIds = new Set(allBookings.filter(b => b.status === 'pending').map(b => b.id));
      setUnreadCount(pendingIds.size);

      snapshot.docChanges().forEach((change: any) => {
        if (change.type === 'added' && previousBookingIds.size > 0 && !previousBookingIds.has(change.doc.id)) {
          const data = change.doc.data();
          toast.success(
            `New booking from ${data.touristName || 'a guest'} for ${data.serviceName || 'a service'}`,
            { duration: 5000 }
          );
        }
      });
      setPreviousBookingIds(new Set(allBookings.map(b => b.id)));

      const totalBookings = allBookings.length;
      const pendingCount = allBookings.filter(b => b.status === 'pending').length;
      const activeBookings = allBookings.filter(b => b.status === 'confirmed' || b.status === 'checked_in').length;
      const todaysCheckIns = allBookings.filter(b => {
        const ciDate = b.checkInDate || (b.checkInTimestamp?.toDate?.()?.toLocaleDateString());
        return (b.status === 'confirmed' || b.status === 'checked_in') && ciDate === todayStr;
      }).length;
      const weekRevenue = allBookings
        .filter(b => {
          const createdAt = b.createdAt?.toDate?.();
          return createdAt && createdAt >= startOfWeek && b.paymentStatus === 'PAID';
        })
        .reduce((sum, b) => sum + (b.amount || 0), 0);

      setDashboardStats({ totalBookings, pendingCount, todaysCheckIns, weeklyRevenue: weekRevenue, activeBookings });
    });

    return () => unsubscribe();
  }, [effectiveBusinessId]);

  const config = businessType ? BUSINESS_TYPE_CONFIGS[businessType] : null;
  const modules = config?.modules || ['analytics', 'bookings', 'inventory', 'tours', 'reviews', 'checkin'];

  const sidebarItems = [
    { icon: BarChart3, label: 'Dashboard', to: '/business', show: true },
    { icon: Calendar, label: 'Bookings', to: '/business/bookings', show: modules.includes('bookings') },
    { icon: Package, label: 'Inventory', to: '/business/inventory', show: modules.includes('inventory') },
    { icon: Car, label: 'Fleet', to: '/business/fleet', show: modules.includes('fleet') },
    { icon: Compass, label: 'Tours', to: '/business/tours', show: modules.includes('tours') },
    { icon: Star, label: 'Reviews', to: '/business/reviews', show: modules.includes('reviews') },
    { icon: Scan, label: 'Check-In Scanner', to: '/business/checkin', show: modules.includes('checkin') },
  ].filter(item => item.show);

  const typeLabel = config?.label || 'Business';
  const TypeIcon = businessType ? typeIcons[businessType] || LayoutDashboard : LayoutDashboard;

  const [showManualEarnings, setShowManualEarnings] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [manualProduct, setManualProduct] = useState('');

  const handleManualEarningsSubmit = async () => {
    if (!manualAmount || !manualProduct) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!effectiveBusinessId) {
      toast.error('No business ID found');
      return;
    }
    try {
      await addDoc(collection(db, 'manual_earnings'), {
        businessId: effectiveBusinessId,
        product: manualProduct,
        amount: Number(manualAmount),
        recordedAt: serverTimestamp(),
      });
      toast.success(`₱${Number(manualAmount).toLocaleString()} recorded for ${manualProduct}`);
      setManualAmount('');
      setManualProduct('');
      setShowManualEarnings(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'manual_earnings');
    }
  };

  const AnalyticsHome = () => (
    <div className="space-y-12">
      {businessType === 'shop' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
              <AlertTriangle size="18" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-black mb-1">Update Your Product Availability</h4>
              <p className="text-gray-400 text-sm mb-3">
                For accurate inventory tracking, please update your product availability every 3 days.
              </p>
              <Link to="/business/inventory" className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-all">
                <RefreshCw size="14" /> Update Now
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Weekly Revenue" value={`₱${dashboardStats.weeklyRevenue.toLocaleString()}`} change="Updated daily" isPositive={true} icon={CreditCard} color="emerald" />
        <StatCard label="Active Bookings" value={String(dashboardStats.activeBookings)} change={`${dashboardStats.pendingCount} pending`} isPositive={true} icon={Calendar} color="ocean" />
        <StatCard label="Today's Check-ins" value={String(dashboardStats.todaysCheckIns)} change={`${dashboardStats.totalBookings} total bookings`} isPositive={true} icon={Star} color="purple" />
        <StatCard label="Pending" value={String(dashboardStats.pendingCount)} change="Awaiting confirmation" isPositive={true} icon={TrendingUp} color="coral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modules.includes('inventory') && (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-black tracking-tight mb-2">Inventory</h3>
              <p className="text-gray-400 text-sm mb-6">You have 4 items running low on stock.</p>
              <Link to="/business/inventory" className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all">
                Manage Inventory <ArrowUpRight size="16" />
              </Link>
            </div>
          </div>
        )}
        <div className="bg-black p-8 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-semibold text-white tracking-tight mb-2">Reviews</h3>
            <p className="text-gray-400 text-sm mb-6">3 new reviews pending your response.</p>
            <Link to="/business/reviews" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-all">
              View Reviews
            </Link>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-semibold text-black tracking-tight mb-2">Manual Update</h3>
            <p className="text-gray-400 text-sm mb-6">Record offline sales that were not captured by the system.</p>
            <button onClick={() => setShowManualEarnings(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all">
              <DollarSign size="16" />
              Add Manual Entry
            </button>
          </div>
        </div>
      </div>

      {/* Manual Earnings Modal */}
      {showManualEarnings && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowManualEarnings(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-black">Record Offline Sale</h3>
              <button onClick={() => setShowManualEarnings(false)} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-black transition-all">
                <X size="16" />
              </button>
            </div>
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Product/Service Name</label>
                <input type="text" value={manualProduct} onChange={e => setManualProduct(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-gray-200 text-sm text-gray-800"
                  placeholder="e.g., Fresh Lanzones" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Amount Earned (₱)</label>
                <input type="number" value={manualAmount} onChange={e => setManualAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-gray-200 text-sm text-gray-800"
                  placeholder="0" />
              </div>
            </div>
            <button onClick={handleManualEarningsSubmit}
              className="w-full bg-black text-white py-4 rounded-xl font-medium text-sm hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
              <CheckCircle2 size="18" /> Record Sale
            </button>
          </motion.div>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-semibold text-black tracking-tight">Recent Activity</h3>
          <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">Live</span>
        </div>
        <div className="space-y-4">
          {[
            { user: 'Juan Dela Cruz', action: `Confirmed booking for ${businessName}`, time: '2 mins ago', icon: Calendar },
            { user: 'Sarah Wilson', action: 'Added a 5-star review', time: '1 hour ago', icon: Star },
            { user: 'System', action: 'Dashboard synced', time: '3 hours ago', icon: Package },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                <item.icon size="18" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600"><span className="text-black font-medium">{item.user}</span> {item.action}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <aside className="w-[280px] bg-white border-r border-gray-100 hidden lg:flex flex-col shrink-0">
        <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
          <div className="mb-12 px-4">
            <h3 className="text-xl font-semibold text-black tracking-tight">{typeLabel}</h3>
            <span className="text-xs text-gray-400 font-medium">{businessName}</span>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map(item => (
              <SidebarItem key={item.to} label={item.label} to={item.to}
                active={item.to === '/business' ? location.pathname === '/business' : location.pathname.startsWith(item.to)} />
            ))}
          </nav>
        </div>
        
        <div className="p-8 border-t border-gray-100 space-y-1">
          <SidebarItem label="Settings" to="/business/settings" active={location.pathname.startsWith('/business/settings')} />
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-medium text-gray-400 hover:text-black hover:bg-gray-50 transition-all duration-200"
          >
            <ArrowUpRight size="16" className="shrink-0" />
            Back to Site
          </Link>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-medium text-gray-400 hover:text-black hover:bg-gray-50 transition-all duration-200"
          >
            <LogOut size="16" className="shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 p-6 lg:px-10 z-30 shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-gray-400 font-medium text-xs tracking-wide uppercase mb-1 block">{typeLabel} Dashboard</span>
              <h1 className="text-3xl lg:text-4xl font-semibold text-black tracking-tight leading-none">Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Welcome back, {profile?.name || 'Business'}</p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-500 transition-colors" size="16" />
                <input type="text" placeholder="Search..." className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-200 transition-all w-full md:w-64 text-sm" />
              </div>
              <button className="w-10 h-10 bg-white border border-gray-100 rounded-xl text-gray-500 flex items-center justify-center relative hover:bg-gray-50 active:scale-90 transition-all group shrink-0">
                <Bell size="18" className="group-hover:text-black transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-black text-white text-[9px] font-semibold rounded-full flex items-center justify-center px-1 border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar scroll-smooth">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <Routes>
              <Route path="/" element={<AnalyticsHome />} />
              {modules.includes('analytics') && <Route path="/analytics" element={<AnalyticsModule />} />}
              {modules.includes('bookings') && <Route path="/bookings" element={<BookingsModule />} />}
              {modules.includes('inventory') && <Route path="/inventory" element={<InventoryModule />} />}
              {modules.includes('fleet') && <Route path="/fleet" element={<RentalModule />} />}
              {modules.includes('tours') && <Route path="/tours" element={<ToursModule />} />}
              {modules.includes('reviews') && <Route path="/reviews" element={<ReviewsModule />} />}
              {modules.includes('checkin') && <Route path="/checkin" element={<CheckInView />} />}
              <Route path="/settings" element={<SettingsModule />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
