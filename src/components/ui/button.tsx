'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'neon' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  primary:   'bg-gradient-brand text-white shadow-glow-brand hover:opacity-90',
  neon:      'bg-gradient-neon text-gray-900 font-bold shadow-glow-neon hover:opacity-90',
  secondary: 'glass text-slate-200 hover:bg-white/10',
  ghost:     'text-slate-400 hover:text-white hover:bg-white/5',
  outline:   'border border-white/20 text-slate-200 hover:border-white/40 hover:bg-white/5',
  danger:    'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25',
};

const sizes = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-7 text-base gap-2',
  xl: 'h-14 px-8 text-base gap-2',
};

export function Button({
  variant = 'primary', size = 'md', loading, disabled, fullWidth,
  className, children, ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled ?? loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-2xl',
        'transition-all duration-200 btn-lift',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
