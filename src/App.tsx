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
  User as UserIcon,
  Compass,
  Hotel,
  Ship,
  Ticket,
  Map as MapIcon,
  BarChart3,
  ShieldCheck,
  LogOut,
  LogIn
} from 'lucide-react';
import React, { useState, useEffect, useLayoutEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

// Types
type UserRole = 'TOURIST' | 'BUSINESS' | 'LGU';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

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
import MyBookingsView from './views/MyBookingsView';
import ClaimBusinessView from './views/ClaimBusinessView';

function RoleNavigator({ role, onRoleChange }: { role: UserRole, onRoleChange: (role: UserRole) => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;

    // If on mobile and not already on the mobile view, redirect to /mobile
    if (isMobile && currentPath !== '/mobile') {
      navigate('/mobile');
      return;
    }

    // If not on mobile but on the mobile view, redirect back to home (or stay if appropriate)
    if (!isMobile && currentPath === '/mobile') {
      navigate('/');
      return;
    }

    // Auto-switch role based on path
    // This is now the primary way role state is updated
    if (currentPath.startsWith('/business')) {
      if (role !== 'BUSINESS') onRoleChange('BUSINESS');
    } else if (currentPath.startsWith('/government')) {
      if (role !== 'LGU') onRoleChange('LGU');
    } else {
      // If not in a dashboard path, default to TOURIST
      if (role !== 'TOURIST') onRoleChange('TOURIST');
    }
  }, [location.pathname, isMobile, onRoleChange, role, navigate]);

  return null;
}

function Navigation({ currentRole, onRoleChange }: { currentRole: UserRole, onRoleChange: (role: UserRole) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const touristItems = [
    { path: '/', label: 'Explore', icon: Compass },
    { path: '/stay', label: 'Stay', icon: Hotel },
    { path: '/transport', label: 'Transport', icon: Ship },
    { path: '/shops', label: 'Shops', icon: Building2 },
    { path: '/locations', label: 'Locations', icon: MapIcon },
    { path: '/pass', label: 'Tourist Pass', icon: Ticket },
    { path: '/my-bookings', label: 'My Bookings', icon: Calendar },
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

  const handleRoleSwitch = async (role: UserRole) => {
    if (profile && user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { ...profile, role }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
    
    setIsRoleMenuOpen(false);
    setIsMenuOpen(false);
    
    // Navigate to the appropriate dashboard/home
    if (role === 'BUSINESS') {
      navigate('/business');
    } else if (role === 'LGU') {
      navigate('/government');
    } else {
      navigate('/');
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
            {navItems.map((item) => {
              const isActive = item.path === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(item.path);
                
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    isActive ? 'text-island-emerald' : 'text-slate-500 hover:text-island-green'
                  }`}
                >
                  <item.icon size={14} />
                  {item.label}
                </Link>
              );
            })}

            {/* User & Role Controls */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  {/* Role Switcher */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all border border-slate-100"
                    >
                      <ShieldCheck size={14} />
                      {currentRole}
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
                              onClick={() => handleRoleSwitch(role)}
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

                  {/* User Profile */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2"
                    >
                      <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-10 h-10 rounded-full border-2 border-island-emerald/20" referrerPolicy="no-referrer" />
                    </button>
                    
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 z-50"
                        >
                          <div className="mb-4 pb-4 border-b border-slate-50">
                            <p className="text-sm font-bold text-island-green">{user.displayName}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                          <Link
                            to="/claim-business"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-island-emerald hover:bg-island-emerald/5 transition-all mb-2"
                          >
                            <Building2 size={16} />
                            Claim Business
                          </Link>
                          <button
                            onClick={() => { logout(); setIsUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-island-coral hover:bg-island-coral/5 transition-all"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={login}
                  className="flex items-center gap-2 px-6 py-3 island-gradient text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-island-emerald/20 hover:scale-105 transition-all"
                >
                  <LogIn size={14} />
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {user && (
              <button 
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="p-2 text-slate-600 bg-slate-50 rounded-lg"
              >
                <ShieldCheck size={20} />
              </button>
            )}
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
              {navItems.map((item) => {
                const isActive = item.path === '/' 
                  ? location.pathname === '/' 
                  : location.pathname.startsWith(item.path);
                  
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-2xl text-sm font-bold uppercase tracking-widest ${
                      isActive ? 'bg-island-emerald/10 text-island-emerald' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
              
              {!user && (
                <button 
                  onClick={login}
                  className="w-full flex items-center justify-center gap-4 p-4 rounded-2xl bg-island-emerald text-white text-sm font-bold uppercase tracking-widest"
                >
                  <LogIn size={20} />
                  Sign In
                </button>
              )}
              
              {user && (
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-4 p-4 rounded-2xl bg-island-coral/10 text-island-coral text-sm font-bold uppercase tracking-widest"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              )}
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
                  onClick={() => handleRoleSwitch(role)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-bold uppercase tracking-widest ${
                    currentRole === role ? 'bg-island-emerald/10 text-island-emerald' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck size={20} />
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

function AppRoutes({ role, setRole }: { role: UserRole, setRole: (role: UserRole) => void }) {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/mobile" element={<MobileAppView />} />
      <Route path="*" element={
        <>
          <Navigation currentRole={role} onRoleChange={setRole} />
          <main className="pt-20">
            <AnimatePresence mode="wait">
              <motion.div 
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Routes location={location}>
                  <Route path="/" element={<LandingView />} />
                  <Route path="/stay" element={<StayView />} />
                  <Route path="/transport" element={<TransportView />} />
                  <Route path="/shops" element={<ShopsView />} />
                  <Route path="/locations" element={<LocationsView />} />
                  <Route path="/pass" element={<TouristPassView />} />
                  <Route path="/my-bookings" element={<MyBookingsView />} />
                  <Route path="/claim-business" element={<ClaimBusinessView />} />
                  <Route path="/business/*" element={<BusinessDashboard />} />
                  <Route path="/government/*" element={<GovernmentDashboard />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
        </>
      } />
    </Routes>
  );
}

export default function App() {
  const [role, setRole] = useState<UserRole>('TOURIST');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot for real-time profile updates
        unsubscribeProfile = onSnapshot(userRef, async (userSnap) => {
          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            setProfile(data);
            setRole(data.role);
            setLoading(false);
          } else {
            // Create profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Anonymous',
              email: firebaseUser.email || '',
              role: 'TOURIST',
            };
            try {
              await setDoc(userRef, newProfile);
              // onSnapshot will trigger again with the new data
            } catch (error) {
              setLoading(false);
              handleFirestoreError(error, OperationType.CREATE, `users/${firebaseUser.uid}`);
            }
          }
        }, (error) => {
          setLoading(false);
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        });
      } else {
        setProfile(null);
        setRole('TOURIST');
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-island-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-island-emerald border-t-transparent rounded-full animate-spin"></div>
          <p className="text-island-green font-bold uppercase tracking-widest text-xs">Loading IsleGO...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      <Router>
        <ScrollToTop />
        <RoleNavigator role={role} onRoleChange={setRole} />
        <div className="min-h-screen bg-island-cream font-sans text-island-volcanic selection:bg-island-emerald/20">
          <AppRoutes role={role} setRole={setRole} />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
