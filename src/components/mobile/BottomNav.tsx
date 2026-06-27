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
        className="bg-white/80 backdrop-blur-md rounded-[28px] p-1.5 flex items-center justify-around shadow-[var(--shadow-lg)] border border-white/20 gap-1"
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
                  activeTab === item.id ? 'bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)]' : 'bg-island-emerald/10'
                }`}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            ) : (
              activeTab === item.id && (
                <motion.div
                  layoutId="navActiveTab"
                  className="absolute inset-0 bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )
            )}
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`relative z-10 transition-colors ${
                item.id === 'planner'
                  ? activeTab === item.id ? 'text-white' : 'text-island-emerald'
                  : activeTab === item.id ? 'text-white' : 'text-[var(--muted)]/50 group-hover:text-[var(--muted)]'
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
