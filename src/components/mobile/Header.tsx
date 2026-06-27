import { UilBell } from '@/icons';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onNotificationClick?: () => void;
  showNotification?: boolean;
}

export function Header({ title, subtitle, onNotificationClick, showNotification }: HeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        {subtitle && (
          <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] mb-1 block">
            {subtitle}
          </span>
        )}
        <h2 className="text-[26px] font-black text-[var(--text)] tracking-tighter leading-tight">
          {title}
        </h2>
      </div>
      {onNotificationClick && (
        <button
          onClick={onNotificationClick}
          aria-label="Notifications"
          className="relative w-11 h-11 rounded-full bg-white/70 border border-gray-100 flex items-center justify-center text-[var(--text)] shadow-sm active:scale-90 transition-all"
        >
          <UilBell size="20" />
          {showNotification && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
          )}
        </button>
      )}
    </div>
  );
}
