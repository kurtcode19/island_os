import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UilBuilding, UilCalendarAlt, UilSignOutAlt, UilSignInAlt, UilUser } from '@/icons';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { id: 'home', label: 'Home', to: '/' },
  { id: 'about', label: 'About Us', to: '/#about' },
  { id: 'home', label: 'Riverside Inn', to: '/#home' },
  { id: 'rooms', label: 'Rooms', to: '/#rooms' },
  { id: 'facilities', label: 'Facilities', to: '/#facilities' },
  { id: 'function-room', label: 'Function Rooms', to: '/function-room' },
  { id: 'gallery', label: 'Gallery', to: '/#gallery' },
  { id: 'contact', label: 'Contact Us', to: '/#contact' },
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const handleNavClick = (item: { id: string; label: string; to: string }) => {
    if (item.id === 'function-room') {
      navigate('/function-room');
    } else {
      if (location.pathname !== '/') navigate('/');
      setTimeout(() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        location.pathname === '/' 
          ? visible ? 'bg-transparent' : 'bg-white/80 backdrop-blur-xl border-b border-[#e8e8ed]/50'
          : 'bg-white border-b border-[#e8e8ed]'
      }`}>
      <div className="w-full px-12">
        <div className="flex justify-between h-20 items-center">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-island-volcanic/5 rounded-xl flex items-center justify-center border border-island-volcanic/10 transition-transform group-hover:scale-110">
              <img src="/images/weblogo.png" alt="Dininggasan Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className={`font-montserrat text-lg font-semibold uppercase tracking-[0.2em] whitespace-nowrap ${
              location.pathname === '/' && visible ? 'text-white' : 'text-slate-800'
            }`}>
              {isDininggasan ? (
                <span>Dininggasan</span>
              ) : (
                <span className="text-island-emerald">Dininggasan</span>
              )}
            </span>
          </div>

{/* Right: Nav Links + Auth */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center space-x-1">
              {menuItems.map((item) => {
                const isActive = item.id === 'function-room'
                  ? location.pathname === '/function-room'
                  : location.pathname === '/';
                  
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item)}
                    className={`relative px-4 py-2 font-montserrat text-xs font-semibold uppercase tracking-[0.15em] transition-opacity duration-300 ${
                      isActive ? (location.pathname === '/' && visible ? 'text-white' : 'text-island-green') : location.pathname === '/' && visible ? 'text-white/80 hover:opacity-50' : 'text-slate-600 hover:opacity-50'
                    }`}
                  >
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-6">
                {/* User Menu */}
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center justify-center transition-opacity duration-300 ${
                      location.pathname === '/' && visible ? 'text-white/80 hover:opacity-50' : 'text-slate-600 hover:opacity-50'
                    }`}
                  >
                    <UilUser size="20" />
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
                    className={`flex items-center justify-center transition-opacity duration-300 ${
                      location.pathname === '/' && visible ? 'text-white/80 hover:opacity-50' : 'text-slate-600 hover:opacity-50'
                    }`}
                  >
                  <UilSignInAlt size="20" />
                </button>
            )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button className={`text-sm font-semibold tracking-tight transition-all ${location.pathname === '/' && visible ? 'text-white' : 'text-slate-600'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Slide from left */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 md:hidden shadow-2xl"
            >
              <div className="px-4 pt-24 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleNavClick(item);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-2xl text-sm font-light tracking-tight w-full text-left ${
                      location.pathname === '/' && item.id === 'home'
                        ? 'bg-[#8b7355]/10 text-[#8b7355]'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="absolute bottom-8 left-6 right-6 space-y-2">
                {!user ? (
                  <button onClick={() => { login(); setIsMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl text-sm font-bold bg-island-emerald text-white hover:bg-emerald-600 transition-all">
                    <UilSignInAlt size="20" />
                    Register
                  </button>
                ) : (
                  <button onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl text-sm font-bold bg-island-coral/10 text-island-coral transition-all">
                    <UilSignOutAlt size="20" />
                    Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
    </>
  );
}
