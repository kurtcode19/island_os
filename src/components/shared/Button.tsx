import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'volcanic' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantStyles = {
  primary: 'accent-gradient text-island-volcanic shadow-xl shadow-island-accent/20 hover:shadow-island-accent/40',
  secondary: 'bg-white border-2 border-emerald-100 text-island-green hover:border-island-emerald/50 hover:bg-island-cream',
  volcanic: 'forest-gradient text-white border border-white/10 shadow-xl hover:shadow-island-green/40',
  ghost: 'bg-transparent text-slate-500 hover:text-island-green hover:bg-slate-50',
  danger: 'bg-rose-50 text-island-coral border border-rose-100 hover:bg-rose-100',
};

const sizeStyles = {
  sm: 'px-5 py-2.5 text-[10px] rounded-xl',
  md: 'px-8 py-4 text-xs rounded-2xl',
  lg: 'px-12 py-6 text-sm rounded-[2rem]',
};

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'font-bold tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all duration-300',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
