import { motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UilHouseUser, UilMapMarker, UilStar, UilUser, UilNavigator } from '@/icons';

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'explore';
  
  const navItems = [
    { path: '/mobile?tab=explore', id: 'explore', label: 'Home', icon: UilHouseUser },
    { path: '/mobile?tab=map', id: 'map', label: 'Map', icon: UilMapMarker },
    { path: '/mobile?tab=mobility', id: 'mobility', label: 'Mobility', icon: UilNavigator },
    { path: '/mobile?tab=profile', id: 'profile', label: 'Profile', icon: UilUser },
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
        <UilStar size="18" className="animate-pulse" />
        <span>Plan with AI</span>
      </motion.button>

      <div className="fixed bottom-8 left-6 right-6 z-50 md:hidden">
        <nav className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-2 flex items-center justify-around tropic-shadow-lg border border-tropic-sand/30">
          {navItems.map((item) => {
            const itemPath = item.path.split('?')[0];
            const itemTab = new URLSearchParams(item.path.split('?')[1]).get('tab');
            
            const isActive = location.pathname === itemPath && (itemTab ? currentTab === itemTab : location.pathname === item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative p-2.5 group"
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
                  {item.id === 'planner' ? (
                    <img src="/images/mascot.png" alt="" className="w-8 h-8 object-contain" />
                  ) : (
                    <item.icon size="28" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
