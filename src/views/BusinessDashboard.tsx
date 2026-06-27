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

import { businesses as staticBusinesses } from '../data/businesses';
import { BusinessType, BUSINESS_TYPE_CONFIGS } from '../types';

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

  useEffect(() => {
    if (!profile?.businessId) return;

    const loadBusinessType = async () => {
      try {
        const bizDoc = await getDoc(doc(db, 'businesses', profile.businessId!));
        if (bizDoc.exists()) {
          const data = bizDoc.data();
          setBusinessType(data.businessType as BusinessType);
          setBusinessName(data.name || 'Business');
          return;
        }
      } catch {}
      const staticBiz = staticBusinesses.find(b => b.id === profile.businessId);
      if (staticBiz) {
        setBusinessType(staticBiz.businessType);
        setBusinessName(staticBiz.name);
      }
    };

    loadBusinessType();
  }, [profile?.businessId]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [previousBookingIds, setPreviousBookingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!profile?.businessId) return;

    const q = query(
      collection(db, 'bookings'),
      where('businessId', '==', profile.businessId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const currentIds = new Set(snapshot.docs.map(d => d.id));
      setUnreadCount(currentIds.size);

      snapshot.docChanges().forEach((change: any) => {
        if (change.type === 'added' && previousBookingIds.size > 0 && !previousBookingIds.has(change.doc.id)) {
          const data = change.doc.data();
          toast.success(
            `New booking from ${data.touristName || 'a guest'} for ${data.serviceName || 'a service'}`,
            { duration: 5000 }
          );
        }
      });
      setPreviousBookingIds(currentIds);
    });

    return () => unsubscribe();
  }, [profile?.businessId]);

  const config = businessType ? BUSINESS_TYPE_CONFIGS[businessType] : null;
  const modules = config?.modules || ['analytics', 'bookings', 'inventory', 'tours', 'reviews', 'checkin'];

  const sidebarItems = [
    { icon: BarChart3, label: 'Dashboard', to: '/business', show: true },
    { icon: Calendar, label: 'Bookings', to: '/business/bookings', show: modules.includes('bookings') },
    { icon: Package, label: 'Inventory', to: '/business/inventory', show: modules.includes('inventory') },
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
    if (!profile?.businessId) {
      toast.error('No business ID found');
      return;
    }
    try {
      await addDoc(collection(db, 'manual_earnings'), {
        businessId: profile.businessId,
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
      {/* Inventory Update Notification */}
      {businessType === 'shop' && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-[2.5rem] p-8 flex items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <AlertTriangle size="28" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-black text-amber-900 tracking-tighter mb-2">Update Your Product Availability</h4>
            <p className="text-amber-800 font-medium text-sm leading-relaxed mb-4">
              For accurate inventory tracking, please update your product availability every 3 days. 
              Walk-in purchases may affect stock levels not recorded in the system.
            </p>
            <Link to="/business/inventory" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-800 text-white rounded-2xl text-xs font-bold hover:bg-amber-900 transition-all">
              <RefreshCw size="16" /> Update Now
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Weekly Revenue" value="₱84,200" change="+12.5%" isPositive={true} icon={CreditCard} color="emerald" />
        <StatCard label="Active Bookings" value="18" change="+4.3%" isPositive={true} icon={Calendar} color="ocean" />
        <StatCard label="Guest Satisfaction" value="4.9/5" change="+0.2" isPositive={true} icon={Star} color="purple" />
        <StatCard label="System Status" value="Active" change="Optimum" isPositive={true} icon={TrendingUp} color="coral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {modules.includes('inventory') && (
          <div className="bg-white p-12 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-island-volcanic tracking-tighter mb-4">Inventory</h3>
              <p className="text-slate-500 font-medium mb-10">You have 4 items running low on stock.</p>
              <Link to="/business/inventory" className="btn-primary inline-flex items-center gap-3 px-8 py-4 rounded-2xl">
                Manage Inventory <ArrowUpRight size="20" />
              </Link>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 group-hover:rotate-0 duration-700">
              <Package size="240" />
            </div>
          </div>
        )}
        <div className="emerald-gradient p-12 rounded-[3.5rem] shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white tracking-tighter mb-4">Reviews</h3>
            <p className="text-emerald-50/70 font-medium mb-10">3 new reviews pending your response.</p>
            <Link to="/business/reviews" className="bg-white text-island-emerald px-8 py-4 rounded-2xl font-semibold text-xs tracking-wider hover:bg-emerald-50 transition-all inline-block">
              View Reviews
            </Link>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-opacity -rotate-12 group-hover:rotate-0 duration-700">
            <Star size="240" />
          </div>
        </div>
        {/* Manual Earnings / Product Sold Card */}
        <div className="bg-white p-12 rounded-[3.5rem] border-2 border-slate-100 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-island-volcanic tracking-tighter mb-4">Manual Update</h3>
            <p className="text-slate-500 font-medium mb-10">Record offline sales that were not captured by the system.</p>
            <button onClick={() => setShowManualEarnings(true)} className="btn-primary inline-flex items-center gap-3 px-8 py-4 rounded-2xl">
              <DollarSign size="20" />
              Add Manual Entry
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 group-hover:rotate-0 duration-700">
            <ShoppingBag size="240" />
          </div>
        </div>
      </div>

      {/* Manual Earnings Modal */}
      {showManualEarnings && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-island-volcanic/60 backdrop-blur-sm" onClick={() => setShowManualEarnings(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-island-green">Record Offline Sale</h3>
              <button onClick={() => setShowManualEarnings(false)} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-island-coral transition-all">
                <X size="16" />
              </button>
            </div>
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Product/Service Name</label>
                <input type="text" value={manualProduct} onChange={e => setManualProduct(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 text-sm font-semibold text-slate-800"
                  placeholder="e.g., Fresh Lanzones" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Amount Earned (₱)</label>
                <input type="number" value={manualAmount} onChange={e => setManualAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-island-emerald/5 text-sm font-semibold text-slate-800"
                  placeholder="0" />
              </div>
            </div>
            <button onClick={handleManualEarningsSubmit}
              className="w-full bg-island-green text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-island-green/20 hover:shadow-island-green/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
              <CheckCircle2 size="20" /> Record Sale
            </button>
          </motion.div>
        </div>
      )}

      <div className="bg-white p-12 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-3xl font-black text-island-volcanic tracking-tighter">Recent Activity</h3>
          <span className="text-[10px] font-bold text-island-emerald bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">Live Activity</span>
        </div>
        <div className="space-y-8">
          {[
            { user: 'Juan Dela Cruz', action: `Confirmed booking for ${businessName}`, time: '2 mins ago', icon: Calendar },
            { user: 'Sarah Wilson', action: 'Added a 5-star review', time: '1 hour ago', icon: Star },
            { user: 'System', action: 'Dashboard node synchronized', time: '3 hours ago', icon: Package },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-6 p-6 rounded-3xl hover:bg-stone-50 transition-all border border-transparent hover:border-stone-100">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-island-emerald border border-emerald-100">
                <item.icon size="24" />
              </div>
              <div className="flex-1">
                <p className="text-island-volcanic font-bold"><span className="text-island-emerald">{item.user}</span> {item.action}</p>
                <p className="text-[10px] text-slate-400 font-semibold tracking-tight mt-1">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F4F4F1] selection:bg-island-emerald/20 overflow-hidden">
      <aside className="w-[320px] bg-white border-r border-emerald-50 hidden lg:flex flex-col shadow-2xl shrink-0">
        <div className="p-10 flex-1 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-5 mb-16 px-4">
            <div className="w-14 h-14 rounded-2xl forest-gradient flex items-center justify-center text-white shadow-2xl border border-white/10">
              <TypeIcon size="32" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-island-volcanic tracking-tighter leading-none mb-1">{typeLabel}</h3>
              <span className="text-xs text-island-emerald font-bold tracking-wider">{businessName}</span>
            </div>
          </div>

          <nav className="space-y-4">
            {sidebarItems.map(item => (
              <SidebarItem key={item.to} icon={item.icon} label={item.label} to={item.to}
                active={item.to === '/business' ? location.pathname === '/business' : location.pathname.startsWith(item.to)} />
            ))}
          </nav>
        </div>
        
        <div className="p-10 border-t-2 border-stone-50 space-y-4">
          <SidebarItem icon={Settings} label="Settings" to="/business/settings" active={location.pathname.startsWith('/business/settings')} />
          <Link
            to="/"
            className="w-full flex items-center gap-5 px-8 py-5 rounded-[1.75rem] text-xs font-semibold tracking-tight text-slate-400 bg-stone-50 hover:bg-emerald-50 hover:text-island-emerald transition-all duration-300 border border-transparent hover:border-emerald-100"
          >
            <ArrowUpRight size="22" />
            Back to Site
          </Link>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-5 px-8 py-5 rounded-[1.75rem] text-xs font-semibold tracking-tight text-slate-400 bg-stone-50 hover:bg-rose-50 hover:text-island-coral transition-all duration-300 border border-transparent hover:border-rose-100"
          >
            <LogOut size="22" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-emerald-50 p-8 lg:px-12 z-30 shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <div>
              <span className="text-island-emerald font-bold tracking-wider text-xs mb-2 block">{typeLabel} Dashboard</span>
              <h1 className="text-4xl lg:text-5xl font-black text-island-volcanic tracking-tighter leading-none">{typeLabel} <span className="text-transparent bg-clip-text bg-gradient-to-r from-island-emerald to-island-green">Dashboard.</span></h1>
              <p className="text-slate-500 font-medium text-base mt-2">Welcome back, {profile?.name || 'Business'}</p>
            </div>
            
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-300 group-focus-within:text-island-emerald transition-colors" size="20" />
                <input type="text" placeholder="Search..." className="pl-14 pr-6 py-4 bg-white border-2 border-emerald-50 rounded-2xl outline-none focus:ring-8 focus:ring-island-emerald/5 focus:border-island-emerald/20 transition-all w-full md:w-80 shadow-2xl" />
              </div>
              <button className="w-14 h-14 bg-white border-2 border-emerald-50 rounded-2xl text-island-volcanic flex items-center justify-center relative shadow-2xl hover:bg-emerald-50 active:scale-90 transition-all group shrink-0">
                <Bell size="24" className="group-hover:text-island-emerald transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-island-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 border-2 border-white shadow-lg">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 lg:p-12 no-scrollbar scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            <Routes>
              <Route path="/" element={<AnalyticsHome />} />
              {modules.includes('analytics') && <Route path="/analytics" element={<AnalyticsModule />} />}
              {modules.includes('bookings') && <Route path="/bookings" element={<BookingsModule />} />}
              {modules.includes('inventory') && <Route path="/inventory" element={<InventoryModule />} />}
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
