'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  // Brand navy — asosiy harakat (login, registratsiya, jiddiy bloklar)
  primary:   'bg-brand-900 text-white hover:bg-brand-800 shadow-glow-brand',
  // Emerald CTA — eng muhim harakatlar (Muammo yuborish, Yechim taklif qilish).
  // accent-700: oq matn bilan WCAG AA kontrast (4.98:1) — accent-500 2.5:1 edi.
  accent:    'bg-accent-700 text-white hover:bg-accent-800 shadow-glow-accent',
  // Secondary — kulrang fon
  secondary: 'bg-slate-100 text-brand-900 hover:bg-slate-200',
  // Outline — chegaralangan
  outline:   'border border-slate-300 text-brand-900 bg-white hover:bg-slate-50 hover:border-slate-400',
  // Ghost — fonsiz
  ghost:     'text-slate-600 hover:text-brand-900 hover:bg-slate-100',
  // Danger
  danger:    'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100',
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
        'inline-flex items-center justify-center font-semibold rounded-xl',
        'transition-all duration-150 btn-lift',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
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
