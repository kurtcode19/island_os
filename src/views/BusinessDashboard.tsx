import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  Compass, 
  BarChart3, 
  MessageSquare, 
  Tag, 
  Settings, 
  Bell, 
  Search,
  TrendingUp,
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Building2,
  Hotel,
  Plus,
  X
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import BookingsModule from '../components/business/BookingsModule';
import InventoryModule from '../components/business/InventoryModule';
import ToursModule from '../components/business/ToursModule';
import AnalyticsModule from '../components/business/AnalyticsModule';
import ReviewsModule from '../components/business/ReviewsModule';
import SettingsModule from '../components/business/SettingsModule';

const chartData = [
  { name: 'Mon', revenue: 4000, bookings: 24 },
  { name: 'Tue', revenue: 3000, bookings: 18 },
  { name: 'Wed', revenue: 2000, bookings: 12 },
  { name: 'Thu', revenue: 2780, bookings: 22 },
  { name: 'Fri', revenue: 1890, bookings: 15 },
  { name: 'Sat', revenue: 2390, bookings: 28 },
  { name: 'Sun', revenue: 3490, bookings: 32 },
];

export default function BusinessDashboard() {
  const location = useLocation();
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.businessId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'bookings'),
      where('businessId', '==', profile.businessId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.businessId]);

  const stats = [
    { 
      label: "Total Bookings", 
      value: bookings.length.toString(), 
      change: '+15%', 
      icon: Calendar, 
      color: 'text-island-emerald', 
      bg: 'bg-island-emerald/10' 
    },
    { 
      label: 'Confirmed Rate', 
      value: bookings.length > 0 ? `${Math.round((bookings.filter(b => b.status === 'confirmed').length / bookings.length) * 100)}%` : '0%', 
      change: '+4%', 
      icon: TrendingUp, 
      color: 'text-island-ocean', 
      bg: 'bg-island-ocean/10' 
    },
    { 
      label: 'Total Revenue', 
      value: `₱${bookings.filter(b => b.status === 'confirmed').reduce((acc, b) => acc + (b.amount || 0), 0).toLocaleString()}`, 
      change: '+12%', 
      icon: CreditCard, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
    { 
      label: 'Active Guests', 
      value: bookings.filter(b => b.status === 'confirmed').length.toString(), 
      change: '+8', 
      icon: Users, 
      color: 'text-island-coral', 
      bg: 'bg-island-coral/10' 
    },
  ];

  const DashboardHome = () => (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-island-emerald/10 text-island-emerald' : 'bg-island-coral/10 text-island-coral'}`}>
                {stat.change}
              </span>
            </div>
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</h4>
            <p className="text-3xl font-bold text-island-green">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-serif font-bold text-island-green">Revenue Overview</h3>
            <div className="flex gap-2">
              {['7D', '30D', '1Y'].map(t => (
                <button key={t} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${t === '7D' ? 'island-gradient text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5E8C71" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#5E8C71" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#5E8C71" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Tours */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-serif font-bold text-island-green mb-8">Upcoming Tours</h3>
          <div className="space-y-8">
            {[
              { title: 'Sunken Cemetery Dive', time: '09:00 AM', guests: 4, status: 'Ready', color: 'bg-island-ocean' },
              { title: 'White Island Hopping', time: '10:30 AM', guests: 8, status: 'Ready', color: 'bg-island-emerald' },
              { title: 'Hibok-Hibok Trek', time: '01:00 PM', guests: 2, status: 'Pending', color: 'bg-island-coral' },
            ].map((tour, idx) => (
              <div key={idx} className="flex items-center gap-5 group cursor-pointer">
                <div className={`w-14 h-14 rounded-2xl ${tour.color}/10 flex flex-col items-center justify-center transition-all group-hover:scale-110`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Oct</span>
                  <span className={`text-lg font-bold ${tour.color.replace('bg-', 'text-')}`}>25</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-island-green group-hover:text-island-emerald transition-colors">{tour.title}</h4>
                  <p className="text-xs text-slate-400 font-medium">{tour.time} • {tour.guests} guests</p>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-island-emerald transition-all group-hover:translate-x-1" />
              </div>
            ))}
          </div>
          <Link to="/business/tours" className="w-full mt-12 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold transition-all flex items-center justify-center">
            View All Tours
          </Link>
        </div>

        {/* Recent Bookings Table */}
        <div className="lg:col-span-3 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-serif font-bold text-island-green">Recent Bookings</h3>
            <Link to="/business/bookings" className="text-island-emerald text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all">
              View All Bookings <ChevronRight size={18} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-50">
                  <th className="pb-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Booking ID</th>
                  <th className="pb-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Guest</th>
                  <th className="pb-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Service</th>
                  <th className="pb-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="pb-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="pb-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 italic">No recent bookings.</td>
                  </tr>
                ) : (
                  bookings.slice(0, 5).map((booking) => (
                    <tr key={booking.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="py-6 text-sm font-bold text-island-green">BK-{booking.id.slice(0, 4).toUpperCase()}</td>
                      <td className="py-6 text-sm text-slate-600 font-medium">{booking.guestName}</td>
                      <td className="py-6 text-sm text-slate-600 font-medium">{booking.serviceName}</td>
                      <td className="py-6 text-sm text-slate-600 font-medium">{booking.date}</td>
                      <td className="py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          booking.status === 'confirmed' ? 'bg-island-emerald/10 text-island-emerald' : 
                          booking.status === 'pending' ? 'bg-island-ocean/10 text-island-ocean' : 
                          'bg-island-coral/10 text-island-coral'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-6 text-sm font-bold text-island-green">₱{booking.amount?.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );

  const ModulePlaceholder = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-20 h-20 bg-island-emerald/10 text-island-emerald rounded-3xl flex items-center justify-center mb-6">
        <LayoutDashboard size={40} />
      </div>
      <h2 className="text-3xl font-serif font-bold text-island-green mb-2 italic">{title} <span className="not-italic text-island-emerald">Module</span></h2>
      <p className="text-slate-500 font-light max-w-md">The {title} management system is currently being optimized for your business. Check back soon for full functionality.</p>
      <Link 
        to="/business"
        className="mt-8 px-8 py-4 island-gradient text-white rounded-2xl font-bold shadow-lg shadow-island-emerald/20"
      >
        Back to Dashboard
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-island-cream">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-2xl island-gradient flex items-center justify-center text-white shadow-lg shadow-island-emerald/20">
              <Hotel size={24} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-island-green text-lg leading-none">{profile?.name || 'Business'}</h3>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{profile?.role || 'Partner'}</span>
            </div>
          </div>

          <nav className="space-y-2">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/business" active={location.pathname === '/business'} />
            <SidebarItem icon={Calendar} label="Bookings" to="/business/bookings" active={location.pathname.startsWith('/business/bookings')} />
            <SidebarItem icon={Package} label="Inventory" to="/business/inventory" active={location.pathname.startsWith('/business/inventory')} />
            <SidebarItem icon={Compass} label="Tours" to="/business/tours" active={location.pathname.startsWith('/business/tours')} />
            <SidebarItem icon={BarChart3} label="Analytics" to="/business/analytics" active={location.pathname.startsWith('/business/analytics')} />
            <SidebarItem icon={MessageSquare} label="Reviews" to="/business/reviews" active={location.pathname.startsWith('/business/reviews')} />
            <SidebarItem icon={Tag} label="Promotions" to="/business/promotions" active={location.pathname.startsWith('/business/promotions')} />
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-slate-50 space-y-2">
          <SidebarItem icon={Settings} label="Settings" to="/business/settings" active={location.pathname.startsWith('/business/settings')} />
          <Link 
            to="/"
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:bg-island-coral/5 hover:text-island-coral transition-all"
          >
            <X size={22} />
            Exit Portal
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-island-green mb-2 italic">Welcome back, <span className="not-italic text-island-emerald">{profile?.name || 'Partner'}</span></h1>
            <p className="text-slate-500 font-light">Here's what's happening at your business today.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search bookings..." 
                className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all w-full md:w-72 shadow-sm"
              />
            </div>
            <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 relative shadow-sm">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-island-coral rounded-full border-2 border-white"></span>
            </button>
            <button className="island-gradient p-3 rounded-2xl text-white shadow-lg shadow-island-emerald/20">
              <Plus size={20} />
            </button>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/bookings" element={<BookingsModule />} />
          <Route path="/inventory" element={<InventoryModule />} />
          <Route path="/tours" element={<ToursModule />} />
          <Route path="/analytics" element={<AnalyticsModule />} />
          <Route path="/reviews" element={<ReviewsModule />} />
          <Route path="/promotions" element={<ModulePlaceholder title="Promotions" />} />
          <Route path="/settings" element={<SettingsModule />} />
        </Routes>
      </main>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, to, active = false }: { icon: any, label: string, to: string, active?: boolean }) {
  return (
    <Link 
      to={to}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
      active ? 'island-gradient text-white shadow-lg shadow-island-emerald/20' : 'text-slate-400 hover:bg-slate-50 hover:text-island-green'
    }`}>
      <Icon size={22} />
      {label}
    </Link>
  );
}
