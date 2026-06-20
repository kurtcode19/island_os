import { motion } from 'motion/react';
import { Compass, MapPin, CreditCard, User, Motorcycle } from '@phosphor-icons/react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'explore', icon: Compass },
  { id: 'map', icon: MapPin },
  { id: 'rentals', icon: Motorcycle },
  { id: 'pass', icon: CreditCard },
  { id: 'profile', icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
      <nav
        className="bg-white/80 backdrop-blur-md rounded-[28px] p-2 flex items-center justify-around shadow-[var(--shadow-lg)] border border-white/20"
        aria-label="Main navigation"
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            aria-label={item.id}
            className="relative p-4 group"
          >
            {activeTab === item.id && (
              <motion.div
                layoutId="navActiveTab"
                className="absolute inset-0 bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`relative z-10 transition-colors ${
                activeTab === item.id ? 'text-white' : 'text-[var(--muted)]/50 group-hover:text-[var(--muted)]'
              }`}
            >
              <item.icon size={22} weight={activeTab === item.id ? 'bold' : 'regular'} />
            </motion.div>
          </button>
        ))}
      </nav>
    </div>
  );
}
