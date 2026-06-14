import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  Hotel, 
  Calendar, 
  DollarSign, 
  Globe, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Mountain,
  Waves,
  ShieldCheck,
  Ship,
  FileText,
  Settings,
  Search,
  Bell,
  ChevronRight,
  BarChart3,
  X,
  Sparkles
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import LocationsView from './LocationsView';
import RegistryModule from '../components/lgu/RegistryModule';
import PortModule from '../components/lgu/PortModule';
import SafetyModule from '../components/lgu/SafetyModule';
import ReportsModule from '../components/lgu/ReportsModule';

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
      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard 
          label="Total Nodes" 
          value={bookings.length.toLocaleString()} 
          change="+12.5%" 
          isPositive={true} 
          icon={Users} 
          color="emerald" 
        />
        <StatCard 
          label="Active Manifests" 
          value={bookings.length.toString()} 
          change="+4.3%" 
          isPositive={true} 
          icon={Hotel} 
          color="ocean" 
        />
        <StatCard 
          label="Node Revenue" 
          value={`₱${(bookings.reduce((acc, b) => acc + (b.amount || 0), 0) / 1000).toFixed(1)}k`} 
          change="-2.1%" 
          isPositive={false} 
          icon={DollarSign} 
          color="purple" 
        />
        <StatCard 
          label="System Health" 
          value="100%" 
          change="Optimum" 
          isPositive={true} 
          icon={Activity} 
          color="coral" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Visitor Trend */}
        <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-3xl font-black text-island-volcanic tracking-tighter">Node Activity Trends</h3>
            <div className="flex gap-6">
              <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-island-emerald shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div> Active Nodes</span>
              <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-emerald-100"></div> Dormant</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitorData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0fdf4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#064E3B', fontSize: 10, fontWeight: 800}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#064E3B', fontSize: 10, fontWeight: 800}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(6,78,59,0.2)', padding: '20px' }}
                />
                <Line type="monotone" dataKey="visitors" stroke="#10B981" strokeWidth={5} dot={{ r: 6, fill: '#10B981', strokeWidth: 4, stroke: '#fff' }} activeDot={{ r: 10, shadow: '0 0 20px rgba(16,185,129,0.5)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Origin Distribution */}
        <div className="bg-white p-12 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl">
          <h3 className="text-3xl font-black text-island-volcanic tracking-tighter mb-10">Node Origins</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={originData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
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
              <span className="text-4xl font-black text-island-volcanic tracking-tighter">65%</span>
              <span className="text-[9px] font-black text-island-emerald uppercase tracking-[0.3em]">Catarman</span>
            </div>
          </div>
          <div className="mt-10 space-y-5">
            {originData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs font-black text-island-green uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-sm font-black text-island-volcanic">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Destinations */}
        <div className="lg:col-span-1 bg-white p-12 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl">
          <h3 className="text-3xl font-black text-island-volcanic tracking-tighter mb-10">Peak Node Usage</h3>
          <div className="space-y-10">
            {destinationData.map((dest, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black text-island-green uppercase tracking-widest">{dest.name}</span>
                  <span className="text-[10px] font-black text-island-emerald bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">{dest.value} nodes</span>
                </div>
                <div className="w-full h-3 bg-stone-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(dest.value / 2400) * 100}%` }}
                    transition={{ duration: 1.2, delay: idx * 0.1 }}
                    className="h-full emerald-gradient rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Placeholder */}
        <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-3xl font-black text-island-volcanic tracking-tighter">Density Telemetry</h3>
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 border border-emerald-200"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Low Pulse</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-island-emerald shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">High Pulse</span>
              </div>
            </div>
          </div>
          <div className="aspect-video bg-emerald-50 rounded-[2.5rem] relative overflow-hidden group border-2 border-emerald-100 shadow-inner">
            <img 
              src="https://img.atlasobscura.com/CmlPBCqrdngS4DE4q_DDyDdVYBjhcSTHrsI9PUEbvkQ/rs:fill:780:520:1/g:ce/q:81/sm:1/scp:1/ar:1/aHR0cHM6Ly9hdGxh/cy1kZXYuczMuYW1h/em9uYXdzLmNvbS91/cGxvYWRzL3BsYWNl/X2ltYWdlcy85OTA0/ZjhlMDJiMGM0ODM5/NWJfU3Vua2VuX0Nl/bWV0ZXJ5LF9DYXRh/cm1hbixfQ2FtaWd1/aW4uanBn.jpg" 
              alt="Island Heatmap" 
              className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-island-green/10 backdrop-blur-[2px]"></div>
            {/* Simulated Heat Points */}
            <div className="absolute top-1/4 left-1/3 w-24 h-24 bg-island-emerald/50 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-island-emerald/70 rounded-full blur-[60px] animate-pulse delay-700"></div>
            <div className="absolute bottom-1/3 right-1/4 w-28 h-24 bg-island-coral/40 rounded-full blur-3xl animate-pulse delay-300"></div>
          </div>
        </div>
      </div>
    </>
  );

  const ModulePlaceholder = ({ title, icon: Icon = BarChart3 }: { title: string, icon?: any }) => (
    <div className="flex flex-col items-center justify-center h-[65vh] text-center px-10">
      <div className="w-24 h-24 forest-gradient text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl border border-white/10">
        <Icon size={48} strokeWidth={2.5} />
      </div>
      <h2 className="text-4xl font-black text-island-volcanic mb-4 tracking-tighter leading-none">{title} Node.</h2>
      <p className="text-island-green/60 font-semibold text-lg max-w-md leading-relaxed">The {title} administrative interface is currently being optimized for the Catarman pilot. Access will be granted shortly.</p>
      <Link 
        to="/government"
        className="mt-12 btn-primary px-12 py-6 rounded-full"
      >
        <Sparkles size={20} strokeWidth={3} /> Return to Telemetry
      </Link>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F4F4F1] selection:bg-island-emerald/20 overflow-hidden">
      {/* Sidebar - Sticky/Fixed via h-screen and overflow-hidden parent */}
      <aside className="w-[320px] bg-white border-r border-emerald-50 hidden lg:flex flex-col shadow-2xl shrink-0">
        <div className="p-10 flex-1 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-5 mb-16 px-4">
            <div className="w-14 h-14 rounded-2xl forest-gradient flex items-center justify-center text-white shadow-2xl border border-white/10">
              <ShieldCheck size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-island-volcanic tracking-tighter leading-none mb-1">Catarman</h3>
              <span className="text-[10px] text-island-emerald font-black uppercase tracking-[0.4em]">Node Master</span>
            </div>
          </div>

          <nav className="space-y-4">
            <SidebarItem icon={BarChart3} label="Telemetry" to="/government" active={location.pathname === '/government'} />
            <SidebarItem icon={MapPin} label="Active Map" to="/government/map" active={location.pathname.startsWith('/government/map')} />
            <SidebarItem icon={Users} label="Agent Registry" to="/government/registry" active={location.pathname.startsWith('/government/registry')} />
            <SidebarItem icon={Ship} label="Port Terminal" to="/government/port" active={location.pathname.startsWith('/government/port')} />
            <SidebarItem icon={Activity} label="System Health" to="/government/health" active={location.pathname.startsWith('/government/health')} />
            <SidebarItem icon={FileText} label="Manifests" to="/government/reports" active={location.pathname.startsWith('/government/reports')} />
          </nav>
        </div>
        
        <div className="p-10 border-t-2 border-stone-50 space-y-4">
          <SidebarItem icon={Settings} label="Protocols" to="/government/settings" active={location.pathname.startsWith('/government/settings')} />
          <Link 
            to="/"
            className="w-full flex items-center gap-5 px-8 py-5 rounded-[1.75rem] text-xs font-black uppercase tracking-widest text-slate-400 bg-stone-50 hover:bg-rose-50 hover:text-island-coral transition-all duration-300 border border-transparent hover:border-rose-100"
          >
            <X size={22} strokeWidth={3} />
            Terminate
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Fixed at top of content */}
        <header className="bg-white/80 backdrop-blur-md border-b border-emerald-50 p-8 lg:px-12 z-30 shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <div>
              <span className="text-island-emerald font-black uppercase tracking-[0.5em] text-[10px] mb-2 block">Operational Interface v1.0.5</span>
              <h1 className="text-4xl lg:text-5xl font-black text-island-volcanic tracking-tighter leading-none">Government <span className="text-transparent bg-clip-text bg-gradient-to-r from-island-emerald to-island-green">Command.</span></h1>
              <p className="text-slate-500 font-semibold text-base mt-2">Real-time municipal telemetry and administrative nodes.</p>
            </div>
            
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-300 group-focus-within:text-island-emerald transition-colors" size={20} strokeWidth={3} />
                <input 
                  type="text" 
                  placeholder="Query manifests..." 
                  className="pl-14 pr-6 py-4 bg-white border-2 border-emerald-50 rounded-2xl outline-none focus:ring-8 focus:ring-island-emerald/5 focus:border-island-emerald/20 transition-all w-full md:w-80 shadow-2xl"
                />
              </div>
              <button className="w-14 h-14 bg-white border-2 border-emerald-50 rounded-2xl text-island-volcanic flex items-center justify-center relative shadow-2xl hover:bg-emerald-50 active:scale-90 transition-all group shrink-0">
                <Bell size={24} strokeWidth={2.5} className="group-hover:text-island-emerald transition-colors" />
                <span className="absolute top-3.5 right-3.5 w-3 h-3 bg-island-coral rounded-full border-2 border-white ring-4 ring-rose-500/10"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 no-scrollbar scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            <Routes>
              <Route path="/" element={<AnalyticsHome />} />
              <Route path="/map" element={<div className="h-[78vh] bg-white rounded-[4rem] overflow-hidden border-2 border-emerald-50 shadow-3xl"><LocationsView /></div>} />
              <Route path="/registry" element={<RegistryModule />} />
              <Route path="/port" element={<PortModule />} />
              <Route path="/health" element={<SafetyModule />} />
              <Route path="/reports" element={<ReportsModule />} />
              <Route path="/settings" element={<ModulePlaceholder title="Protocols" icon={Settings} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, isPositive, icon: Icon, color }: any) {
  const colors: any = {
    emerald: 'text-island-emerald bg-emerald-50 border-emerald-100',
    ocean: 'text-blue-500 bg-blue-50 border-blue-100',
    purple: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    coral: 'text-island-coral bg-rose-50 border-rose-100',
  };

  return (
    <motion.div 
      whileHover={{ y: -12 }}
      className="bg-white p-10 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl hover:shadow-3xl transition-all duration-500"
    >
      <div className="flex justify-between items-start mb-8">
        <div className={`p-5 rounded-2xl border-2 ${colors[color]} shadow-lg`}>
          <Icon size={32} strokeWidth={2.5} />
        </div>
        <div className={`flex items-center gap-1.5 text-[10px] font-black px-4 py-2 rounded-full border-2 ${isPositive ? 'bg-emerald-50 text-island-emerald border-emerald-100' : 'bg-rose-50 text-island-coral border-rose-100'}`}>
          {isPositive ? <ArrowUpRight size={16} strokeWidth={3} /> : <ArrowDownRight size={16} strokeWidth={3} />}
          {change}
        </div>
      </div>
      <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">{label}</h4>
      <p className="text-4xl font-black text-island-volcanic tracking-tighter">{value}</p>
    </motion.div>
  );
}

function SidebarItem({ icon: Icon, label, to, active = false }: { icon: any, label: string, to: string, active?: boolean }) {
  return (
    <Link 
      to={to}
      className={`w-full flex items-center gap-5 px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${
      active 
        ? 'emerald-gradient text-white shadow-2xl shadow-island-emerald/30 border border-white/10' 
        : 'text-island-green/40 bg-transparent hover:bg-emerald-50/50 hover:text-island-green'
    }`}>
      <Icon size={22} strokeWidth={active ? 3 : 2.5} />
      {label}
    </Link>
  );
}
