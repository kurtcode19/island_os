import { motion } from 'motion/react';
import { UilCompass, UilMap, UilUser, UilCalendarAlt, UilCar } from '@/icons';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'explore', icon: UilCompass },
  { id: 'map', icon: UilMap },
  { id: 'planner', icon: UilCalendarAlt },
  { id: 'mobility', icon: UilCar },
  { id: 'profile', icon: UilUser },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="flex items-center justify-around w-[250px] h-10 bg-black rounded-[10px] mx-auto absolute bottom-6 left-1/2 -translate-x-1/2" aria-label="Main navigation">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          aria-label={item.id}
          className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-white transition-all duration-300 cursor-pointer outline-none border-none hover:-translate-y-[3px]"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={`transition-colors duration-300 text-lg ${
              activeTab === item.id ? 'text-white' : 'text-white/60'
            }`}
          >
            <item.icon size="20" />
          </motion.div>
        </button>
      ))}
    </nav>
  );
}
