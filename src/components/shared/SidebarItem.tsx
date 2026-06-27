import { Link } from 'react-router-dom';
interface SidebarItemProps {
  icon: any;
  label: string;
  to: string;
  active?: boolean;
}

export function SidebarItem({ icon: Icon, label, to, active = false }: SidebarItemProps) {
  return (
    <Link
      to={to}
      className={`w-full flex items-center gap-5 px-8 py-5 rounded-2xl text-sm font-semibold tracking-tight transition-all duration-300 ${
        active
          ? 'emerald-gradient text-white shadow-2xl shadow-island-emerald/30 border border-white/10'
          : 'text-island-green/40 bg-transparent hover:bg-emerald-50/50 hover:text-island-green'
      }`}
    >
      <Icon size="22" />
      {label}
    </Link>
  );
}
