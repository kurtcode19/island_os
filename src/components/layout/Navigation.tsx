import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UilHome, UilBedDouble, UilNavigator, UilMapPin, UilStar, UilCalendarAlt, UilBuilding, UilChartBar, UilSignOutAlt, UilSignInAlt, UilShieldCheck, UilDashboard, UilCalendar, UilMap, UilTicket, UilTennisBall, UilCompass, UilListUl } from '@/icons';
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
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (currentScrollY <= 10) {
        setVisible(true);
      } else if (delta > 5) {
        setVisible(false);
      } else if (delta < -5) {
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDininggasan = true;

  const touristItems = isDininggasan ? [
    { path: '/', label: 'Tour Packages', icon: UilCompass },
    { path: '/function-room', label: 'Function Room', icon: UilBuilding },
    { path: '/services', label: 'Services Offered', icon: UilListUl },
  ] : [
    { path: '/', label: 'Home', icon: UilHome },
    { path: '/tours', label: 'Tour Packages', icon: UilCompass },
    { path: '/transport', label: 'Mobility', icon: UilNavigator },
    { path: '/locations', label: 'Map', icon: UilMapPin },
    { path: '/services', label: 'Services Offered', icon: UilListUl },
    { path: '/my-bookings', label: 'My Bookings', icon: UilCalendarAlt },
  ];

  const businessItems = [
    { path: '/business', label: 'Dashboard', icon: UilDashboard },
    { path: '/business/bookings', label: 'Bookings', icon: UilCalendar },
    { path: '/business/analytics', label: 'Analytics', icon: UilChartBar },
  ];

  const lguItems = [
    { path: '/government', label: 'Analytics', icon: UilDashboard },
    { path: '/government/map', label: 'Island Map', icon: UilMap },
    { path: '/government/reports', label: 'Reports', icon: UilTicket },
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
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        location.pathname === '/' 
          ? visible ? 'bg-transparent' : 'bg-white/80 backdrop-blur-xl border-b border-[#e8e8ed]/50'
          : 'bg-white border-b border-[#e8e8ed]'
      }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-20 items-center">
          
          {/* Left Side: Logo - Fixed width to balance the right side */}
          <div className="flex flex-initial w-[250px] justify-start">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-island-volcanic/5 rounded-xl flex items-center justify-center border border-island-volcanic/10 transition-transform group-hover:scale-110">
                <img src="/images/weblogo.png" alt="eSuroy Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
              </div>
              <span className={`text-lg font-semibold tracking-tight whitespace-nowrap ${
                location.pathname === '/' && visible ? 'text-white' : 'text-slate-800'
              }`}>
                {isDininggasan ? (
                  <span>Dininggasan</span>
                ) : (
                  <span className="text-island-emerald">eSuroy</span>
                )}
              </span>
            </div>
          </div>

          {/* Center: Navigation Links - Will be perfectly centered between logo and auth sections */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = item.path === '/' 
                  ? location.pathname === '/' 
                  : location.pathname.startsWith(item.path);
                  
                return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative px-5 py-2.5 rounded-full text-sm font-semibold tracking-tight transition-all group ${
                        isActive ? 'text-white' : location.pathname === '/' && visible ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-island-green'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navActiveBackground"
                        className="absolute inset-0 rounded-full -z-10 bg-island-volcanic"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side: Auth & Primary Action - Fixed width matching the left side */}
          <div className="hidden md:flex flex-initial w-[250px] justify-end items-center gap-6">
            {user ? (
              <div className="flex items-center gap-6">
                {/* Role Switcher */}
                <div className="relative">
                  <button 
                    onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-tight transition-all border bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
                  >
                    {currentRole}
                  </button>
                  
                  <AnimatePresence>
                    {isRoleMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
className="absolute right-0 mt-4 w-56 rounded-3xl shadow-2xl p-2 z-50 overflow-hidden bg-white"
                      >
                        {(['TOURIST', 'BUSINESS', 'LGU'] as UserRole[]).map((role) => (
                          <button
                            key={role}
                            onClick={() => handleRoleSwitch(role)}
                            className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-semibold tracking-tight transition-all ${
                              currentRole === role 
                                ? 'bg-island-emerald/10 text-island-emerald'
                                : 'text-slate-600 hover:bg-slate-50'
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
                    className="flex items-center gap-2 group"
                  >
                    <img 
                      src={user.photoURL || ''} 
                      alt={user.displayName || ''} 
                      className="w-10 h-10 rounded-full border-2 border-island-emerald/20 transition-transform group-hover:scale-105"
                      referrerPolicy="no-referrer" 
                    />
                  </button>
                  
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
className="absolute right-0 mt-4 w-72 rounded-[2.5rem] shadow-2xl p-6 z-50 bg-white"
                       >
                         <div className="mb-6 pb-6 text-center">
                           <p className="text-sm font-bold mb-1 text-slate-800">{user.displayName}</p>
                           <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">{user.email}</p>
                        </div>
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-semibold tracking-tight transition-all mb-2 text-slate-700 hover:bg-island-emerald/5"
                          >
                            <UilBuilding size="18" />
                            Dashboard
                          </Link>
                          <Link
                            to="/my-bookings"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-semibold tracking-tight transition-all mb-2 text-slate-700 hover:bg-island-emerald/5"
                          >
                            <UilCalendarAlt size="18" />
                            My Bookings
                          </Link>
                        <button
                          onClick={() => { logout(); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-semibold tracking-tight transition-all text-slate-700 hover:bg-island-coral/5"
                        >
                          <UilSignOutAlt size="18" />
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
                    className={`px-6 py-3 rounded-full text-xs font-bold tracking-wider transition-all hover:scale-105 active:scale-95 ${
                      location.pathname === '/' && visible
                        ? 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
                        : 'bg-island-emerald text-white hover:bg-emerald-600'
                    }`}
                  >
                  Register
                </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {user && (
              <button 
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className={`p-2 rounded-lg transition-all ${
                  location.pathname === '/' && visible
                    ? 'text-white/80 hover:bg-white/10'
                    : 'text-slate-600 bg-slate-50'
                }`}
              >
                <UilShieldCheck size="20" />
              </button>
            )}
            <button className={`text-sm font-semibold tracking-tight transition-all ${location.pathname === '/' && visible ? 'text-white' : 'text-slate-600'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? 'Close' : 'Menu'}
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
            className="md:hidden overflow-hidden bg-white"
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
                    className={`flex items-center gap-4 p-4 rounded-2xl text-sm font-semibold tracking-tight ${
                      isActive 
                        ? 'bg-[#8b7355]/10 text-[#8b7355]'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon size={22} />
                    {item.label}
                  </Link>
                );
              })}
              
              {!user && (
                <button 
                  onClick={login}
                  className="w-full flex items-center justify-center gap-4 p-4 rounded-2xl text-sm font-bold tracking-wider bg-island-emerald text-white hover:bg-emerald-600 transition-all"
                >
                  <UilSignInAlt size="22" />
                  Register
                </button>
              )}
              
              {user && (
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-4 p-4 rounded-2xl text-sm font-bold tracking-wider bg-island-coral/10 text-island-coral"
                >
                  <UilSignOutAlt size="22" />
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
            className="md:hidden overflow-hidden bg-white"
          >
            <div className="px-6 pt-4 pb-10 space-y-3">
              <p className="text-xs font-semibold tracking-tight px-4 mb-2 text-slate-500">Switch Role</p>
              {(['TOURIST', 'BUSINESS', 'LGU'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-semibold tracking-tight ${
                    currentRole === role 
                      ? 'bg-island-emerald/10 text-island-emerald'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                <UilShieldCheck size="20" />
                  {role}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    </>
  );
}
