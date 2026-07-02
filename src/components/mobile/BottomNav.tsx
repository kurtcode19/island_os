import { motion } from 'motion/react';
import { UilCompass, UilMap, UilUser, UilCalendarAlt, UilCar } from '@/icons';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'explore', icon: UilCompass, label: 'Explore' },
  { id: 'map', icon: UilMap, label: 'Map' },
  { id: 'planner', icon: UilCalendarAlt, label: 'Planner' },
  { id: 'mobility', icon: UilCar, label: 'Mobility' },
  { id: 'profile', icon: UilUser, label: 'Profile' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="flex items-center justify-around w-full max-w-[340px] h-14 bg-black rounded-2xl mx-auto absolute bottom-6 left-1/2 -translate-x-1/2 px-2 shadow-lg" aria-label="Main navigation">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            aria-label={item.label}
            className="relative flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-all duration-200 cursor-pointer outline-none border-none"
          >
            {isActive && (
              <motion.div
                layoutId="mobileActiveTab"
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
          </button>
        );
      })}
    </nav>
  );
}
