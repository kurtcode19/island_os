import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%]';

  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-2xl',
    card: 'rounded-[2.5rem] h-80 w-full',
  };

  return (
    <div
      className={clsx(baseClasses, variantClasses[variant], className)}
      style={{ animation: 'shimmer 1.5s infinite' }}
    />
  );
}
