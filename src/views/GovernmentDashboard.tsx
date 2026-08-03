import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
   UilUsersAlt as Users, 
   UilMapMarker as MapPin, 
   UilChartGrowth as TrendingUp, 
   UilBuilding as Hotel, 
   UilCalendar as Calendar, 
   UilDollarSign as DollarSign, 
   UilGlobe as Globe, 
   UilHeartbeat as Activity,
   UilFilter as Filter,
   UilDownloadAlt as Download,
   UilShieldCheck as ShieldCheck,
   UilShip as Ship,
   UilFileAlt as FileText,
   UilSetting as Settings,
   UilSearch as Search,
   UilBell as Bell,
   UilQrcodeScan as Scan,
   UilAngleRightB as ChevronRight,
   UilChartBar as BarChart3,
   UilTimes as X,
   UilArrowUpRight as ArrowUpRight
} from '@/icons';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import LocationsView from './LocationsView';
import CheckInView from './CheckInView';
import { StatCard } from '../components/shared/StatCard';
import { SidebarItem } from '../components/shared/SidebarItem';
import RegistryModule from '../components/lgu/RegistryModule';
import PortModule from '../components/lgu/PortModule';
import SafetyModule from '../components/lgu/SafetyModule';
import ReportsModule from '../components/lgu/ReportsModule';
import PaymentModule from '../components/lgu/PaymentModule';
import SettlementModule from '../components/lgu/SettlementModule';

const visitorData = [
  { name: 'Jan', visitors: 4500 },
  { name: 'Feb', visitors: 5200 },
  { name: 'Mar', visitors: 6100 },
  { name: 'Apr', visitors: 8900 },
  { name: 'May', visitors: 9500 },
  { name: 'Jun', visitors: 7200 },
  { name: 'Jul', visitors: 6800 },
];

const originData = [
  { name: 'Domestic', value: 65, color: '#10B981' },
  { name: 'Europe', value: 15, color: '#059669' },
  { name: 'USA', value: 10, color: '#064E3B' },
  { name: 'Asia (Other)', value: 10, color: '#022C22' },
];

const destinationData = [
  { name: 'Sunken Cemetery', value: 2400 },
  { name: 'Church Ruins', value: 1800 },
  { name: 'Tuasan Falls', value: 1500 },
  { name: 'Soda Water Park', value: 1200 },
  { name: 'Sto. Niño Spring', value: 900 },
];

export default function GovernmentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'bookings'),
      where('status', '==', 'confirmed')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    return () => unsubscribe();
  }, []);

  const AnalyticsHome = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Visitors" 
          value={bookings.length.toLocaleString()} 
          change="+12.5%" 
          isPositive={true} 
          icon={Users} 
          color="emerald" 
        />
        <StatCard 
          label="Active Bookings" 
          value={bookings.length.toString()} 
          change="+4.3%" 
          isPositive={true} 
          icon={Hotel} 
          color="ocean" 
        />
        <StatCard 
          label="Revenue" 
          value={`₱${(bookings.reduce((acc, b) => acc + (b.amount || 0), 0) / 1000).toFixed(1)}k`} 
          change="-2.1%" 
          isPositive={false} 
          icon={DollarSign} 
          color="purple" 
        />
        <StatCard 
          label="System Status" 
          value="Online" 
          change="Optimum" 
          isPositive={true} 
          icon={Activity} 
          color="coral" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-semibold text-black tracking-tight">Visitor Trends</h3>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-[10px] font-medium text-gray-400"><div className="w-2 h-2 rounded-full bg-black"></div> Active</span>
              <span className="flex items-center gap-2 text-[10px] font-medium text-gray-400"><div className="w-2 h-2 rounded-full bg-gray-200"></div> Dormant</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitorData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '16px' }}
                />
                <Line type="monotone" dataKey="visitors" stroke="#000" strokeWidth={3} dot={{ r: 4, fill: '#000', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-semibold text-black tracking-tight mb-8">Visitor Origins</h3>
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={originData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {originData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-semibold text-black tracking-tight">65%</span>
              <span className="text-[8px] font-medium text-gray-400 uppercase tracking-[0.2em]">Domestic</span>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {originData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-500">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-black">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-semibold text-black tracking-tight mb-8">Top Destinations</h3>
          <div className="space-y-6">
            {destinationData.map((dest, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">{dest.name}</span>
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">{dest.value}</span>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(dest.value / 2400) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full bg-black rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-semibold text-black tracking-tight">Visitor Density</h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300"></div>
                <span className="text-[10px] font-medium text-gray-400">Light</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-black"></div>
                <span className="text-[10px] font-medium text-gray-400">Heavy</span>
              </div>
            </div>
          </div>
          <div className="aspect-video bg-gray-50 rounded-xl relative overflow-hidden group border border-gray-100">
            <img 
              src="/images/hero-sunken.png" 
              alt="Island Heatmap" 
              className="w-full h-full object-cover opacity-10 group-hover:scale-105 transition-transform duration-1000 grayscale"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="absolute top-1/4 left-1/3 w-24 h-24 bg-black/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-black/30 rounded-full blur-[60px] animate-pulse delay-700"></div>
          </div>
        </div>
      </div>
    </>
  );

  const SettingsModule = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-10"
    >
      <div>
        <h2 className="text-2xl font-semibold text-black tracking-tight">Settings</h2>
        <p className="text-gray-400 text-sm">Manage municipal dashboard preferences.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-semibold text-black tracking-tight">Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-2">Municipal</label>
            <input defaultValue="Dininggasan" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-gray-200" readOnly />
          </div>
          <div>
            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-2">Province</label>
            <input defaultValue="Camiguin" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-gray-200" readOnly />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-semibold text-black tracking-tight">Notifications</h3>
        <div className="space-y-4">
          {[
            { label: 'Booking Alerts', desc: 'New bookings and cancellations' },
            { label: 'Safety Incidents', desc: 'Emergency reports and health alerts' },
            { label: 'Port Updates', desc: 'Vessel arrivals and departures' },
            { label: 'Weekly Reports', desc: 'Automated visitor statistics digest' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-black">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <div className="w-11 h-6 bg-black rounded-full relative cursor-pointer shadow-sm">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-semibold text-black tracking-tight">Display</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-black">Compact Mode</p>
            <p className="text-xs text-gray-400">Show more data in less space</p>
          </div>
          <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-pointer shadow-sm">
            <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => toast.success('Settings saved successfully')}
          className="px-6 py-3 bg-black text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-all active:scale-95"
        >
          Save Settings
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <aside className="w-[280px] bg-white border-r border-gray-100 hidden lg:flex flex-col shrink-0">
        <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
          <div className="mb-12 px-4">
            <h3 className="text-xl font-semibold text-black tracking-tight">Dininggasan</h3>
            <span className="text-xs text-gray-400 font-medium">Municipal</span>
          </div>

          <nav className="space-y-1">
            <SidebarItem label="Dashboard" to="/government" active={location.pathname === '/government'} />
            <SidebarItem label="Map" to="/government/map" active={location.pathname.startsWith('/government/map')} />
            <SidebarItem label="Registry" to="/government/registry" active={location.pathname.startsWith('/government/registry')} />
            <SidebarItem label="Port" to="/government/port" active={location.pathname.startsWith('/government/port')} />
            <SidebarItem label="Safety" to="/government/health" active={location.pathname.startsWith('/government/health')} />
            <SidebarItem label="Reports" to="/government/reports" active={location.pathname.startsWith('/government/reports')} />
            <SidebarItem label="Payments" to="/government/payments" active={location.pathname.startsWith('/government/payments')} />
            <SidebarItem label="Settlement" to="/government/settlement" active={location.pathname.startsWith('/government/settlement')} />
            <SidebarItem label="Departure Scanner" to="/government/departure" active={location.pathname.startsWith('/government/departure')} />
          </nav>
        </div>
        
        <div className="p-8 border-t border-gray-100 space-y-1">
          <SidebarItem label="Settings" to="/government/settings" active={location.pathname.startsWith('/government/settings')} />
          <Link 
            to="/"
            className="w-full flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-medium text-gray-400 hover:text-black hover:bg-gray-50 transition-all duration-200"
          >
            <ArrowUpRight size="16" className="shrink-0" />
            Back to Site
          </Link>
          <button
            onClick={async () => { await logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-medium text-gray-400 hover:text-black hover:bg-gray-50 transition-all duration-200"
          >
            <X size="16" className="shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 p-6 lg:px-10 z-30 shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-gray-400 font-medium text-xs tracking-wide uppercase mb-1 block">Government Dashboard</span>
              <h1 className="text-3xl lg:text-4xl font-semibold text-black tracking-tight leading-none">Municipal Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Municipal oversight and analytics platform</p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-500 transition-colors" size="16" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-200 transition-all w-full md:w-64 text-sm"
                />
              </div>
              <button className="w-10 h-10 bg-white border border-gray-100 rounded-xl text-gray-500 flex items-center justify-center relative hover:bg-gray-50 active:scale-90 transition-all group shrink-0">
                <Bell size="18" className="group-hover:text-black transition-colors" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-black rounded-full border-2 border-white"></span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar scroll-smooth">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <Routes>
              <Route path="/" element={<AnalyticsHome />} />
              <Route path="/map" element={<div className="h-[78vh] bg-white rounded-[4rem] overflow-hidden border-2 border-emerald-50 shadow-3xl"><LocationsView /></div>} />
              <Route path="/registry" element={<RegistryModule />} />
              <Route path="/port" element={<PortModule />} />
              <Route path="/health" element={<SafetyModule />} />
              <Route path="/reports" element={<ReportsModule />} />
              <Route path="/payments" element={<PaymentModule />} />
              <Route path="/settlement" element={<SettlementModule />} />
              <Route path="/departure" element={<CheckInView />} />
              <Route path="/settings" element={<SettingsModule />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}


