import { Link } from 'react-router-dom';
interface SidebarItemProps {
  icon?: any;
  label: string;
  to: string;
  active?: boolean;
}

export function SidebarItem({ icon: Icon, label, to, active = false }: SidebarItemProps) {
  return (
    <Link
      to={to}
      className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-xl text-sm font-medium tracking-tight transition-all duration-200 ${
        active
          ? 'bg-black text-white'
          : 'text-gray-400 hover:text-black hover:bg-gray-50'
      }`}
    >
      {Icon && <Icon size="16" className="shrink-0" />}
      {label}
    </Link>
  );
}
