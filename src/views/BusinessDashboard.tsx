import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Calendar, 
  Package, 
  Compass, 
  Star, 
  Settings, 
  Search, 
  Bell, 
  X,
  LayoutDashboard,
  LogOut,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  CreditCard,
  Users
} from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Business Modules
import AnalyticsModule from '../components/business/AnalyticsModule';
import BookingsModule from '../components/business/BookingsModule';
import InventoryModule from '../components/business/InventoryModule';
import ToursModule from '../components/business/ToursModule';
import ReviewsModule from '../components/business/ReviewsModule';
import SettingsModule from '../components/business/SettingsModule';

export default function BusinessDashboard() {
  const { logout, profile } = useAuth();
  const location = useLocation();

  const AnalyticsHome = () => (
    <div className="space-y-12">
      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          label="Weekly Revenue" 
          value="₱84,200" 
          change="+12.5%" 
          isPositive={true} 
          icon={CreditCard} 
          color="emerald" 
        />
        <StatCard 
          label="Active Bookings" 
          value="18" 
          change="+4.3%" 
          isPositive={true} 
          icon={Calendar} 
          color="ocean" 
        />
        <StatCard 
          label="Guest Satisfaction" 
          value="4.9/5" 
          change="+0.2" 
          isPositive={true} 
          icon={Star} 
          color="purple" 
        />
        <StatCard 
          label="Avg. Pulse" 
          value="High" 
          change="Optimum" 
          isPositive={true} 
          icon={TrendingUp} 
          color="coral" 
        />
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-12 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-island-volcanic tracking-tighter mb-4">Inventory Pulse</h3>
            <p className="text-slate-500 font-semibold mb-10">You have 4 items running low on stock.</p>
            <Link to="/business/inventory" className="btn-primary inline-flex items-center gap-3 px-8 py-4 rounded-2xl">
              Manage Inventory <ArrowUpRight size={20} strokeWidth={3} />
            </Link>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 group-hover:rotate-0 duration-700">
            <Package size={240} strokeWidth={1} />
          </div>
        </div>

        <div className="emerald-gradient p-12 rounded-[3.5rem] shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white tracking-tighter mb-4">Guest Experience</h3>
            <p className="text-emerald-50/70 font-semibold mb-10">3 new reviews pending your response.</p>
            <Link to="/business/reviews" className="bg-white text-island-emerald px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all inline-block">
              Open Feedback Loop
            </Link>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-opacity -rotate-12 group-hover:rotate-0 duration-700">
            <Star size={240} strokeWidth={1} />
          </div>
        </div>
      </div>

      {/* Recent Activity Mini-Module */}
      <div className="bg-white p-12 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-3xl font-black text-island-volcanic tracking-tighter">Real-time Stream</h3>
          <span className="text-[10px] font-black text-island-emerald bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">Live Telemetry</span>
        </div>
        <div className="space-y-8">
          {[
            { user: 'Juan Dela Cruz', action: 'Confirmed booking for Sunken Cemetery Dive', time: '2 mins ago', icon: Calendar },
            { user: 'Sarah Wilson', action: 'Added a 5-star review for Beachfront Resort', time: '1 hour ago', icon: Star },
            { user: 'System', action: 'Inventory node: "Diving Gear Set" updated', time: '3 hours ago', icon: Package },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-6 p-6 rounded-3xl hover:bg-stone-50 transition-all border border-transparent hover:border-stone-100">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-island-emerald border border-emerald-100">
                <item.icon size={24} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-island-volcanic font-bold"><span className="text-island-emerald">{item.user}</span> {item.action}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F4F4F1] selection:bg-island-emerald/20 overflow-hidden">
      {/* Sidebar - Sticky/Fixed via h-screen and overflow-hidden parent */}
      <aside className="w-[320px] bg-white border-r border-emerald-50 hidden lg:flex flex-col shadow-2xl shrink-0">
        <div className="p-10 flex-1 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-5 mb-16 px-4">
            <div className="w-14 h-14 rounded-2xl forest-gradient flex items-center justify-center text-white shadow-2xl border border-white/10">
              <LayoutDashboard size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-island-volcanic tracking-tighter leading-none mb-1">Business</h3>
              <span className="text-[10px] text-island-emerald font-black uppercase tracking-[0.4em]">Node Operator</span>
            </div>
          </div>

          <nav className="space-y-4">
            <SidebarItem icon={BarChart3} label="Telemetry" to="/business" active={location.pathname === '/business'} />
            <SidebarItem icon={Calendar} label="Bookings" to="/business/bookings" active={location.pathname.startsWith('/business/bookings')} />
            <SidebarItem icon={Package} label="Inventory" to="/business/inventory" active={location.pathname.startsWith('/business/inventory')} />
            <SidebarItem icon={Compass} label="Tour Nodes" to="/business/tours" active={location.pathname.startsWith('/business/tours')} />
            <SidebarItem icon={Star} label="Feedback Loop" to="/business/reviews" active={location.pathname.startsWith('/business/reviews')} />
          </nav>
        </div>
        
        <div className="p-10 border-t-2 border-stone-50 space-y-4">
          <SidebarItem icon={Settings} label="Protocols" to="/business/settings" active={location.pathname.startsWith('/business/settings')} />
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-5 px-8 py-5 rounded-[1.75rem] text-xs font-black uppercase tracking-widest text-slate-400 bg-stone-50 hover:bg-rose-50 hover:text-island-coral transition-all duration-300 border border-transparent hover:border-rose-100"
          >
            <LogOut size={22} strokeWidth={3} />
            Terminate
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Fixed at top of content */}
        <header className="bg-white/80 backdrop-blur-md border-b border-emerald-50 p-8 lg:px-12 z-30 shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <div>
              <span className="text-island-emerald font-black uppercase tracking-[0.5em] text-[10px] mb-2 block">Business Operator v1.2.0</span>
              <h1 className="text-4xl lg:text-5xl font-black text-island-volcanic tracking-tighter leading-none">Partner <span className="text-transparent bg-clip-text bg-gradient-to-r from-island-emerald to-island-green">Console.</span></h1>
              <p className="text-slate-500 font-semibold text-base mt-2">Monitoring {profile?.name || 'Business'} operational nodes.</p>
            </div>
            
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-300 group-focus-within:text-island-emerald transition-colors" size={20} strokeWidth={3} />
                <input 
                  type="text" 
                  placeholder="Query nodes..." 
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
              <Route path="/analytics" element={<AnalyticsModule />} />
              <Route path="/bookings" element={<BookingsModule />} />
              <Route path="/inventory" element={<InventoryModule />} />
              <Route path="/tours" element={<ToursModule />} />
              <Route path="/reviews" element={<ReviewsModule />} />
              <Route path="/settings" element={<SettingsModule />} />
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
