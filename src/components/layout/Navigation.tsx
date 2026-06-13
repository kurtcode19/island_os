import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Hotel, Ship, Building2, MapIcon, Sparkles, Ticket, Calendar, BarChart3, LogOut, LogIn, ShieldCheck, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

export function Navigation({ currentRole, onRoleChange }: { currentRole: UserRole, onRoleChange: (role: UserRole) => void }) {
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
    { path: '/planner', label: 'AI Planner', icon: Sparkles },
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
            <img src="/images/logo.png" alt="Catarman eLaag Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
            <span className="text-2xl font-display font-bold text-island-dark tracking-tight">
              Catarman <span className="text-island-secondary">eLaag</span>
            </span>
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

      {/* Mobile Menu Dropdown */}
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

      {/* Mobile Role Switcher Dropdown */}
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
