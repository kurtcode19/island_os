import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { UilCompass, UilBuilding, UilListUl, UilCalendarAlt } from '@/icons';

const navItems = [
  { path: '/', icon: UilCompass },
  { path: '/function-room', icon: UilBuilding },
  { path: '/services', icon: UilListUl },
  { path: '/my-bookings', icon: UilCalendarAlt },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden flex justify-center">
      <nav className="w-full max-w-[340px] h-14 bg-black/90 backdrop-blur-xl rounded-2xl flex items-center justify-around px-2 shadow-lg">
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTabBg"
                  className="absolute inset-0 bg-white/15 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`relative z-10 transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-white/40'
                }`}
              >
                <item.icon size="22" />
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
