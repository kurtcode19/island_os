import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
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
  Map as MapIcon,
  BarChart3
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

type UserRole = 'TOURIST' | 'BUSINESS' | 'LGU';

function RoleNavigator({ role }: { role: UserRole }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    if (role === 'BUSINESS' && !currentPath.startsWith('/business')) {
      navigate('/business');
    } else if (role === 'LGU' && !currentPath.startsWith('/government')) {
      navigate('/government');
    } else if (role === 'TOURIST' && (currentPath.startsWith('/business') || currentPath.startsWith('/government'))) {
      navigate('/');
    }
  }, [role, navigate, location.pathname]);

  return null;
}

function Navigation({ currentRole, onRoleChange }: { currentRole: UserRole, onRoleChange: (role: UserRole) => void }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const touristItems = [
    { path: '/', label: 'Explore', icon: Compass },
    { path: '/stay', label: 'Stay', icon: Hotel },
    { path: '/transport', label: 'Transport', icon: Ship },
    { path: '/shops', label: 'Shops', icon: Building2 },
    { path: '/locations', label: 'Locations', icon: MapIcon },
    { path: '/pass', label: 'Tourist Pass', icon: Ticket },
    { path: '/mobile', label: 'App', icon: Smartphone },
  ];

  const businessItems = [
    { path: '/business', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/business/bookings', label: 'Bookings', icon: Calendar },
    { path: '/business/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const lguItems = [
    { path: '/government', label: 'Analytics', icon: LayoutDashboard },
    { path: '/government/map', label: 'Island Map', icon: MapIcon },
    { path: '/government/reports', label: 'Reports', icon: Ticket },
  ];

  const getNavItems = () => {
    switch (currentRole) {
      case 'BUSINESS': return businessItems;
      case 'LGU': return lguItems;
      default: return touristItems;
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="IsleGO Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-island-green/10" referrerPolicy="no-referrer" />
            <span className="text-2xl font-serif font-bold tracking-tight text-island-green italic">Isle<span className="not-italic text-island-emerald">GO</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  location.pathname === item.path ? 'text-island-emerald' : 'text-slate-500 hover:text-island-green'
                }`}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}

            {/* Role Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all border border-slate-100"
              >
                <User size={14} />
                Role: {currentRole}
              </button>
              
              <AnimatePresence>
                {isRoleMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50"
                  >
                    {(['TOURIST', 'BUSINESS', 'LGU'] as UserRole[]).map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          onRoleChange(role);
                          setIsRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                          currentRole === role ? 'bg-island-emerald/10 text-island-emerald' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="p-2 text-slate-600 bg-slate-50 rounded-lg"
            >
              <User size={20} />
            </button>
            <button className="p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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

      {/* Mobile Role Switcher */}
      <AnimatePresence>
        {isRoleMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-6 pt-4 pb-10 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Switch Role</p>
              {(['TOURIST', 'BUSINESS', 'LGU'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onRoleChange(role);
                    setIsRoleMenuOpen(false);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-bold uppercase tracking-widest ${
                    currentRole === role ? 'bg-island-emerald/10 text-island-emerald' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <User size={20} />
                  {role}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default function App() {
  const [role, setRole] = useState<UserRole>('TOURIST');

  return (
    <Router>
      <RoleNavigator role={role} />
      <div className="min-h-screen bg-island-cream font-sans text-island-volcanic selection:bg-island-emerald/20">
        <Navigation currentRole={role} onRoleChange={setRole} />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<LandingView />} />
            <Route path="/stay" element={<StayView />} />
            <Route path="/transport" element={<TransportView />} />
            <Route path="/shops" element={<ShopsView />} />
            <Route path="/locations" element={<LocationsView />} />
            <Route path="/pass" element={<TouristPassView />} />
            <Route path="/business/*" element={<BusinessDashboard />} />
            <Route path="/government/*" element={<GovernmentDashboard />} />
            <Route path="/mobile" element={<MobileAppView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
