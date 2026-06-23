import { motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, MapPin, Sparkle, CreditCard, User, Calendar, Motorcycle } from '@phosphor-icons/react';

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'explore';
  
  const navItems = [
    { path: '/mobile?tab=explore', id: 'explore', label: 'Home', icon: Compass },
    { path: '/mobile?tab=map', id: 'map', label: 'Map', icon: MapPin },
    { path: '/mobile?tab=rentals', id: 'rentals', label: 'Rentals', icon: Motorcycle },
    { path: '/mobile?tab=pass', id: 'pass', label: 'Pass', icon: CreditCard },
    { path: '/mobile?tab=profile', id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Plan with AI Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/planner')}
        className="fixed bottom-28 right-6 z-50 bg-gradient-to-r from-tropic-coral to-tropic-sunset text-white px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-tropic-coral/30 flex items-center gap-2 group border border-white/20"
      >
        <Sparkle size={18} className="animate-pulse" />
        <span>Plan with AI</span>
      </motion.button>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md md:hidden">
        <nav className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-2 flex items-center justify-around tropic-shadow-lg border border-tropic-sand/30">
          {navItems.map((item) => {
            const itemPath = item.path.split('?')[0];
            const itemTab = new URLSearchParams(item.path.split('?')[1]).get('tab');
            
            const isActive = location.pathname === itemPath && (itemTab ? currentTab === itemTab : location.pathname === item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative p-4 group"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-gradient-to-r from-tropic-emerald to-tropic-ocean rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`relative z-10 transition-colors ${
                    isActive ? 'text-white' : 'text-tropic-green/40 group-hover:text-tropic-green/60'
                  }`}
                >
                  <item.icon size={24} weight={isActive ? 'bold' : 'regular'} />
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
