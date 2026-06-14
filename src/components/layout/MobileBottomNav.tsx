import { motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Map as MapIcon, Sparkles, CreditCard, User as UserIcon, Calendar } from 'lucide-react';

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'explore';
  
  const navItems = [
    { path: '/mobile?tab=explore', id: 'explore', label: 'Home', icon: Compass },
    { path: '/mobile?tab=map', id: 'map', label: 'Map', icon: MapIcon },
    { path: '/mobile?tab=pass', id: 'pass', label: 'Pass', icon: CreditCard },
    { path: '/mobile?tab=profile', id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <>
      {/* Plan with AI Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/planner')}
        className="fixed bottom-28 right-6 z-50 bg-island-accent text-island-volcanic px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 group border border-island-accent/20"
      >
        <Sparkles size={18} className="animate-pulse" />
        <span>Plan with AI</span>
      </motion.button>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md md:hidden">
        <nav className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-2 flex items-center justify-around shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100">
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
                    className="absolute inset-0 bg-island-accent rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`relative z-10 transition-colors ${
                    isActive ? 'text-island-volcanic' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  <item.icon size={24} strokeWidth={isActive ? 3 : 2} />
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
