import { type ReactNode } from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant?: 'emerald' | 'coral' | 'sunset' | 'slate' | 'volcanic';
  size?: 'sm' | 'md';
}

const variantStyles = {
  emerald: 'bg-emerald-50 text-island-emerald border-emerald-100',
  coral: 'bg-rose-50 text-island-coral border-rose-100',
  sunset: 'bg-amber-50 text-island-sunset border-amber-100',
  slate: 'bg-slate-50 text-slate-500 border-slate-100',
  volcanic: 'bg-island-volcanic/60 text-white border-white/20',
};

const sizeStyles = {
  sm: 'text-[10px] px-3 py-1',
  md: 'text-xs px-4 py-1.5',
};

export function Badge({ children, variant = 'slate', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-bold tracking-wider rounded-full border',
        variantStyles[variant],
        sizeStyles[size]
      )}
    >
      {children}
    </span>
  );
}
