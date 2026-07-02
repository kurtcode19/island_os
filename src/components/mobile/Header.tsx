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
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.3em] mb-1 block">
            {subtitle}
          </span>
        )}
        <h2 className="text-[26px] font-bold text-gray-900 tracking-tight leading-tight whitespace-pre-line">
          {title}
        </h2>
      </div>
      {onNotificationClick && (
        <button
          onClick={onNotificationClick}
          aria-label="Notifications"
          className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-all"
        >
          <UilBell size="18" />
          {showNotification && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          )}
        </button>
      )}
    </div>
  );
}
