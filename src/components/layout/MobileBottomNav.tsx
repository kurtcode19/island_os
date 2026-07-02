import { motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UilCompass, UilMap, UilUser, UilCalendarAlt, UilCar } from '@/icons';

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'explore';

  const navItems = [
    { path: '/mobile?tab=explore', id: 'explore', label: 'Explore', icon: UilCompass },
    { path: '/mobile?tab=map', id: 'map', label: 'Map', icon: UilMap },
    { path: '/mobile?tab=mobility', id: 'mobility', label: 'Mobility', icon: UilCar },
    { path: '/mobile?tab=profile', id: 'profile', label: 'Profile', icon: UilUser },
  ];

  const isOnPlanner = location.pathname === '/planner';

  return (
    <>
      {/* Plan with AI Floating Button */}
      {!isOnPlanner && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/planner')}
          className="fixed bottom-28 right-6 z-50 bg-black text-white px-6 py-3 rounded-2xl font-semibold text-xs shadow-lg flex items-center gap-2 group"
        >
          <UilCalendarAlt size="16" className="animate-pulse" />
          <span>Plan with AI</span>
        </motion.button>
      )}

      <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden flex justify-center">
        <nav className="w-full max-w-[340px] h-14 bg-black rounded-2xl flex items-center justify-around px-2 shadow-lg">
          {navItems.map((item) => {
            const itemPath = item.path.split('?')[0];
            const itemTab = new URLSearchParams(item.path.split('?')[1]).get('tab');
            const isActive = location.pathname === itemPath && (itemTab ? currentTab === itemTab : location.pathname === item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                aria-label={item.label}
                className="relative flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-all duration-200"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTabBg"
                    className="absolute inset-0 bg-white/15 rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-white/50'
                  }`}
                >
                  <item.icon size="22" />
                </motion.div>
                <span className={`relative z-10 text-[9px] font-semibold tracking-tight transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-white/40'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
