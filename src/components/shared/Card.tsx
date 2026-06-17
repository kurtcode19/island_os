import { type ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  elevation?: 'flat' | 'raised' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  hover?: boolean;
}

const elevationStyles = {
  flat: 'border border-slate-100 shadow-sm',
  raised: 'border-2 border-emerald-50 shadow-xl',
  elevated: 'border-2 border-emerald-50 shadow-2xl hover:shadow-3xl',
};

const paddingStyles = {
  none: '',
  sm: 'p-6',
  md: 'p-8',
  lg: 'p-10',
};

export function Card({ children, elevation = 'raised', padding = 'lg', className, hover = false }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-[2.5rem] transition-all duration-500',
        elevationStyles[elevation],
        paddingStyles[padding],
        hover && 'hover:-translate-y-2 hover:shadow-3xl cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
