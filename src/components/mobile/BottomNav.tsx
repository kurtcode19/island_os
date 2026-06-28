import { motion } from 'motion/react';
import { UilHouseUser, UilMapMarker, UilUser, UilStar, UilNavigator } from '@/icons';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'explore', icon: UilHouseUser },
  { id: 'map', icon: UilMapMarker },
  { id: 'planner', icon: UilStar },
  { id: 'mobility', icon: UilNavigator },
  { id: 'profile', icon: UilUser },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="absolute bottom-6 left-6 right-6">
      <nav
        className="bg-tropic-green rounded-[28px] p-2 flex items-center justify-around shadow-[var(--shadow-lg)] gap-1"
        aria-label="Main navigation"
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            aria-label={item.id}
            className="relative p-1.5 group"
          >
            {item.id === 'planner' ? (
              <motion.div
                layoutId="navActiveTabPlanner"
                className={`absolute -inset-1 rounded-full transition-colors ${
                  activeTab === item.id ? 'bg-white/20' : ''
                }`}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            ) : (
              activeTab === item.id && (
                <motion.div
                  layoutId="navActiveTab"
                  className="absolute inset-0 bg-white/20 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )
            )}
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`relative z-10 transition-colors ${
                activeTab === item.id ? 'text-white' : 'text-white/50 group-hover:text-white/80'
              }`}
            >
              <item.icon size={item.id === 'planner' ? "28" : "24"} />
            </motion.div>
          </button>
        ))}
      </nav>
    </div>
  );
}
