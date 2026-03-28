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
  X
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
  { name: 'Philippines', value: 65, color: '#5E8C71' },
  { name: 'Europe', value: 15, color: '#7BA9B8' },
  { name: 'USA', value: 10, color: '#D9A066' },
  { name: 'Asia (Other)', value: 10, color: '#E67E6E' },
];

const destinationData = [
  { name: 'White Island', value: 2400 },
  { name: 'Sunken Cemetery', value: 1800 },
  { name: 'Ardent Hot Springs', value: 1500 },
  { name: 'Katibawasan Falls', value: 1200 },
  { name: 'Hibok-Hibok', value: 900 },
];

const COLORS = ['#5E8C71', '#7BA9B8', '#D9A066', '#E67E6E'];

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
          label="Tourism Revenue" 
          value={`₱${(bookings.reduce((acc, b) => acc + (b.amount || 0), 0) / 1000000).toFixed(1)}M`} 
          change="-2.1%" 
          isPositive={false} 
          icon={DollarSign} 
          color="purple" 
        />
        <StatCard 
          label="Active Experiences" 
          value="142" 
          change="+5" 
          isPositive={true} 
          icon={Activity} 
          color="coral" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Visitor Trend */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-serif font-bold text-island-green">Visitor Trends (2026)</h3>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-island-emerald"></div> Domestic</span>
              <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-island-ocean"></div> International</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitorData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                />
                <Line type="monotone" dataKey="visitors" stroke="#5E8C71" strokeWidth={4} dot={{ r: 6, fill: '#5E8C71', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Origin Distribution */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-serif font-bold text-island-green mb-10">Visitor Origin</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={originData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {originData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-island-green">65%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Domestic</span>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {originData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-island-green">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Destinations */}
        <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-serif font-bold text-island-green mb-10">Peak Destinations</h3>
          <div className="space-y-8">
            {destinationData.map((dest, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-slate-700">{dest.name}</span>
                  <span className="text-xs font-bold text-island-emerald bg-island-emerald/10 px-2 py-1 rounded-lg">{dest.value} visits</span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(dest.value / 2400) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full island-gradient rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Placeholder */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-serif font-bold text-island-green">Visitor Density Heatmap</h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-island-emerald/20"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-island-emerald"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">High</span>
              </div>
            </div>
          </div>
          <div className="aspect-video bg-slate-50 rounded-[2.5rem] relative overflow-hidden group">
            <img 
              src="https://picsum.photos/seed/tropical-island-aerial/1200/800" 
              alt="Island Heatmap" 
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-island-green/10 backdrop-blur-[1px]"></div>
            {/* Simulated Heat Points */}
            <div className="absolute top-1/4 left-1/3 w-20 h-20 bg-island-emerald/40 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-island-emerald/60 rounded-full blur-3xl animate-pulse delay-700"></div>
            <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-island-coral/30 rounded-full blur-2xl animate-pulse delay-300"></div>
          </div>
        </div>
      </div>
    </>
  );

  const ModulePlaceholder = ({ title, icon: Icon = BarChart3 }: { title: string, icon?: any }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-20 h-20 bg-island-emerald/10 text-island-emerald rounded-3xl flex items-center justify-center mb-6">
        <Icon size={40} />
      </div>
      <h2 className="text-3xl font-serif font-bold text-island-green mb-2 italic">{title} <span className="not-italic text-island-emerald">Module</span></h2>
      <p className="text-slate-500 font-light max-w-md">The {title} administrative system is currently being optimized for government use. Check back soon for full functionality.</p>
      <Link 
        to="/government"
        className="mt-8 px-8 py-4 island-gradient text-white rounded-2xl font-bold shadow-lg shadow-island-emerald/20"
      >
        Back to Analytics
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
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-island-green text-lg leading-none">Camiguin</h3>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">LGU Dashboard</span>
            </div>
          </div>

          <nav className="space-y-2">
            <SidebarItem icon={BarChart3} label="Analytics" to="/government" active={location.pathname === '/government'} />
            <SidebarItem icon={MapPin} label="Island Map" to="/government/map" active={location.pathname.startsWith('/government/map')} />
            <SidebarItem icon={Users} label="Tourist Registry" to="/government/registry" active={location.pathname.startsWith('/government/registry')} />
            <SidebarItem icon={Ship} label="Port Authority" to="/government/port" active={location.pathname.startsWith('/government/port')} />
            <SidebarItem icon={Activity} label="Health & Safety" to="/government/health" active={location.pathname.startsWith('/government/health')} />
            <SidebarItem icon={FileText} label="Reports" to="/government/reports" active={location.pathname.startsWith('/government/reports')} />
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-slate-50 space-y-2">
          <SidebarItem icon={Settings} label="Settings" to="/government/settings" active={location.pathname.startsWith('/government/settings')} />
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
            <h1 className="text-4xl font-serif font-bold text-island-green mb-2 italic">Government <span className="not-italic text-island-emerald">Control Center</span></h1>
            <p className="text-slate-500 font-light">Real-time monitoring and administrative tools for Camiguin Island.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search records..." 
                className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all w-full md:w-72 shadow-sm"
              />
            </div>
            <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 relative shadow-sm">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-island-coral rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<AnalyticsHome />} />
          <Route path="/map" element={<div className="h-[75vh] bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm"><LocationsView /></div>} />
          <Route path="/registry" element={<RegistryModule />} />
          <Route path="/port" element={<PortModule />} />
          <Route path="/health" element={<SafetyModule />} />
          <Route path="/reports" element={<ReportsModule />} />
          <Route path="/settings" element={<ModulePlaceholder title="Settings" icon={Settings} />} />
        </Routes>
      </main>
    </div>
  );
}

function StatCard({ label, value, change, isPositive, icon: Icon, color }: any) {
  const colors: any = {
    emerald: 'text-island-emerald bg-island-emerald/10',
    ocean: 'text-island-ocean bg-island-ocean/10',
    purple: 'text-purple-600 bg-purple-50',
    coral: 'text-island-coral bg-island-coral/10',
  };

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${colors[color]}`}>
          <Icon size={28} />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full ${isPositive ? 'bg-island-emerald/10 text-island-emerald' : 'bg-island-coral/10 text-island-coral'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      </div>
      <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{label}</h4>
      <p className="text-3xl font-bold text-island-green">{value}</p>
    </motion.div>
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
