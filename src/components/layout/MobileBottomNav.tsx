import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Map as MapIcon, Sparkles, CreditCard, User as UserIcon } from 'lucide-react';

export function MobileBottomNav() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'explore';
  
  const navItems = [
    { path: '/mobile?tab=explore', label: 'Home', icon: Compass },
    { path: '/mobile?tab=map', label: 'Map', icon: MapIcon },
    { path: '/planner', label: 'Planner', icon: Sparkles },
    { path: '/mobile?tab=pass', label: 'Pass', icon: CreditCard },
    { path: '/mobile?tab=profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100/50 px-4 pb-safe-offset-4 pt-3 flex items-center justify-around md:hidden">
      {navItems.map((item) => {
        const itemPath = item.path.split('?')[0];
        const itemTab = new URLSearchParams(item.path.split('?')[1]).get('tab');
        
        const isActive = location.pathname === itemPath && (itemTab ? currentTab === itemTab : location.pathname === item.path);
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className="relative flex flex-col items-center gap-1 min-w-[64px]"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-2xl transition-colors ${
                isActive ? 'text-island-emerald' : 'text-slate-400'
              }`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-island-emerald rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </motion.div>
            <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
              isActive ? 'text-island-emerald' : 'text-slate-400'
            }`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
