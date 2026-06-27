import { Link, useLocation } from 'react-router-dom';
import { UilBell, UilUser } from '@/icons';
import { useAuth } from '../../context/AuthContext';

export function MobileHeader() {
  const { user } = useAuth();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-tropic-cream/80 backdrop-blur-xl border-b border-tropic-sand/20 h-16 flex items-center justify-between px-6 md:hidden">
      <Link to="/mobile?tab=explore" className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tropic-emerald to-tropic-ocean flex items-center justify-center text-white text-[10px] font-black">
          CE
        </div>
        <span className="text-xl font-display font-bold text-tropic-green tracking-tight">
          Island <span className="text-tropic-ocean">Explorer</span>
        </span>
      </Link>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-tropic-green/50 hover:bg-tropic-sand/30 rounded-xl transition-colors">
          <UilBell size="20" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-tropic-rose rounded-full border-2 border-white"></span>
        </button>
        <Link to="/mobile?tab=profile" className="w-8 h-8 rounded-full overflow-hidden border-2 border-tropic-sage/30">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-tropic-sand/30 flex items-center justify-center text-tropic-green/40">
              <UilUser size="16" />
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
