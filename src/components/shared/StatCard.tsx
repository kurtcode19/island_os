import { motion } from 'motion/react';
import { UilArrowUpRight, UilArrowDownRight } from '@/icons';

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: any;
}

export function StatCard({ label, value, change, isPositive, icon: Icon }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-500">
          <Icon size="20" />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border ${
          isPositive
            ? 'bg-gray-50 text-gray-500 border-gray-100'
            : 'bg-gray-50 text-gray-500 border-gray-100'
        }`}>
          {isPositive ? <UilArrowUpRight size="14" /> : <UilArrowDownRight size="14" />}
          {change}
        </div>
      </div>
      <p className="text-gray-400 text-xs font-medium mb-1">{label}</p>
      <p className="text-2xl font-semibold text-black tracking-tight">{value}</p>
    </motion.div>
  );
}
