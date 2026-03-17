import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  Building2, 
  Smartphone, 
  Menu, 
  X, 
  MapPin, 
  Calendar, 
  Search, 
  User,
  Compass,
  Hotel,
  Ship,
  Ticket,
  Map as MapIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Views
import LandingView from './views/LandingView';
import BusinessDashboard from './views/BusinessDashboard';
import GovernmentDashboard from './views/GovernmentDashboard';
import MobileAppView from './views/MobileAppView';
import StayView from './views/StayView';
import TransportView from './views/TransportView';
import TouristPassView from './views/TouristPassView';
import ShopsView from './views/ShopsView';
import LocationsView from './views/LocationsView';

function Navigation() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Explore', icon: Compass },
    { path: '/stay', label: 'Stay', icon: Hotel },
    { path: '/transport', label: 'Transport', icon: Ship },
    { path: '/shops', label: 'Shops', icon: Building2 },
    { path: '/locations', label: 'Locations', icon: MapIcon },
    { path: '/pass', label: 'Tourist Pass', icon: Ticket },
    { path: '/business', label: 'Business', icon: Building2 },
    { path: '/government', label: 'LGU', icon: LayoutDashboard },
    { path: '/mobile', label: 'App', icon: Smartphone },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="IsleGO Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-island-green/10" referrerPolicy="no-referrer" />
            <span className="text-2xl font-serif font-bold tracking-tight text-island-green italic">Isle<span className="not-italic text-island-emerald">GO</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${
                  location.pathname === item.path ? 'text-island-emerald' : 'text-slate-500 hover:text-island-green'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-6 pt-4 pb-10 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-2xl text-sm font-bold uppercase tracking-widest ${
                    location.pathname === item.path ? 'bg-island-emerald/10 text-island-emerald' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-island-cream font-sans text-island-volcanic selection:bg-island-emerald/20">
        <Navigation />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<LandingView />} />
            <Route path="/stay" element={<StayView />} />
            <Route path="/transport" element={<TransportView />} />
            <Route path="/shops" element={<ShopsView />} />
            <Route path="/locations" element={<LocationsView />} />
            <Route path="/pass" element={<TouristPassView />} />
            <Route path="/business/*" element={<BusinessDashboard />} />
            <Route path="/government" element={<GovernmentDashboard />} />
            <Route path="/mobile" element={<MobileAppView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
