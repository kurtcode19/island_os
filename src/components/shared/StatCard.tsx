import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
  color?: 'emerald' | 'ocean' | 'purple' | 'coral';
}

const colorMap: Record<string, string> = {
  emerald: 'text-island-emerald bg-emerald-50 border-emerald-100',
  ocean: 'text-blue-500 bg-blue-50 border-blue-100',
  purple: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  coral: 'text-island-coral bg-rose-50 border-rose-100',
};

export function StatCard({ label, value, change, isPositive, icon: Icon, color = 'emerald' }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -12 }}
      className="bg-white p-10 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl hover:shadow-3xl transition-all duration-500"
    >
      <div className="flex justify-between items-start mb-8">
        <div className={`p-5 rounded-2xl border-2 ${colorMap[color]} shadow-lg`}>
          <Icon size={32} strokeWidth={2.5} />
        </div>
        <div className={`flex items-center gap-1.5 text-[10px] font-bold px-4 py-2 rounded-full border-2 ${
          isPositive
            ? 'bg-emerald-50 text-island-emerald border-emerald-100'
            : 'bg-rose-50 text-island-coral border-rose-100'
        }`}>
          {isPositive ? <ArrowUpRight size={16} strokeWidth={3} /> : <ArrowDownRight size={16} strokeWidth={3} />}
          {change}
        </div>
      </div>
      <p className="text-slate-400 text-xs font-semibold tracking-tight mb-3">{label}</p>
      <p className="text-4xl font-black text-island-volcanic tracking-tighter">{value}</p>
    </motion.div>
  );
}
