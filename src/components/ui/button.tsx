'use client';

import { cn } from '@/lib/utils';
import { Spinner } from '@/components/icons';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
}

/* iOS tugma uslublari (UIButton.Configuration):
   filled · gray · bordered · plain · destructive.
   iOS'da tugma bosilganda KO'TARILMAYDI — foni to'qlashadi va bir oz kichrayadi.
   Kursorli qurilmada har bir variant O'Z hover holatiga ega (rang variantga mos
   tanlangan; `hoverOnlyWhenSupported` tufayli sensorli ekranda umuman yoqilmaydi):
   to'ldirilgan tugma to'qlashadi va ostida rangdosh yumshoq nur paydo bo'ladi —
   ko'tarilish YO'Q, ya'ni maket sakramaydi. */
const variants = {
  // Filled — asosiy harakat (tinted fill, oq yorliq)
  primary:
    'bg-accent-600 text-white enabled:hover:bg-accent-700 enabled:hover:shadow-[0_8px_22px_-12px_rgba(0,113,227,0.65)] active:bg-accent-700',
  accent:
    'bg-accent-600 text-white enabled:hover:bg-accent-700 enabled:hover:shadow-[0_8px_22px_-12px_rgba(0,113,227,0.65)] active:bg-accent-700',
  // Gray — ikkilamchi (system fill)
  secondary: 'bg-fill-tertiary text-brand-900 enabled:hover:bg-fill-secondary active:bg-fill',
  // Bordered — oq sirt + hairline
  outline:
    'bg-white text-brand-900 border border-slate-200 enabled:hover:border-slate-300 enabled:hover:bg-slate-50 active:bg-slate-100',
  // Plain — fonsiz, neytral yorliq
  ghost: 'text-slate-600 enabled:hover:bg-fill-quaternary enabled:hover:text-brand-900 active:bg-fill-tertiary active:text-brand-900',
  // Destructive — iOS qizil, yumshoq fon
  danger: 'bg-rose-50 text-rose-600 enabled:hover:bg-rose-100 active:bg-rose-100',
};

/* Balandliklar iOS tegish maydonlariga bog'langan: 34 / 44 / 50 / 54pt. */
const sizes = {
  sm: 'h-9 px-3.5 text-subhead gap-1.5 rounded-ios',
  md: 'h-11 px-5 text-callout gap-2 rounded-ios-md',
  lg: 'h-[50px] px-6 text-body gap-2 rounded-ios-lg',
  xl: 'h-[54px] px-7 text-body gap-2 rounded-ios-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled ?? loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold',
        'transition-[background-color,border-color,box-shadow,transform,opacity] duration-150 ease-ios active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-500/25',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && <Spinner className="h-[1.15em] w-[1.15em] animate-spin" />}
      {children}
    </button>
  );
}
