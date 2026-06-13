import { Link, useLocation } from 'react-router-dom';
import { Compass, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function MobileHeader() {
  const { user } = useAuth();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100/50 h-16 flex items-center justify-between px-6 md:hidden">
      <Link to="/mobile?tab=explore" className="flex items-center gap-3">
        <img src="/images/logo.png" alt="Catarman eLaag Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
        <span className="text-xl font-display font-bold text-island-dark tracking-tight">
          Catarman <span className="text-island-secondary">eLaag</span>
        </span>
      </Link>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-island-coral rounded-full border-2 border-white"></span>
        </button>
        <Link to="/mobile?tab=profile" className="w-8 h-8 rounded-full overflow-hidden border-2 border-island-emerald/20">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
              <UserIcon size={16} />
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
