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

   HOVER TILI ("Yorug'lik", 2026-08-30): kursor ostida tugma XIRALASHMAYDI va
   qorayib ketmaydi — u YORISHADI:
     · to'ldirilgan (blue/red) — sirt bo'ylab bir marta specular yorug'lik
       yuguradi (`hv-sheen`) + ostida rangdosh nur; fon rangi O'ZGARMAYDI,
       chunki uni ochsak oq yorliq AA kontrastdan chiqib ketadi;
     · kulrang/fonsiz/hoshiyali — kulrangdan KULRANGGA o'tish o'rniga brend
       tinti ko'tariladi (accent-50 + accent-700 yorliq), ya'ni javob rangli;
   ko'tarilish YO'Q — maket sakramaydi. Sensorli ekranda hover umuman
   yoqilmaydi (`hoverOnlyWhenSupported`). */
const variants = {
  // Filled — asosiy harakat (tinted fill, oq yorliq)
  primary:
    'hv-sheen bg-accent-600 text-white enabled:hover:shadow-[0_10px_26px_-12px_rgba(0,113,227,0.75)] active:bg-accent-700',
  accent:
    'hv-sheen bg-accent-600 text-white enabled:hover:shadow-[0_10px_26px_-12px_rgba(0,113,227,0.75)] active:bg-accent-700',
  // Gray — ikkilamchi (system fill), hover'da brend tintiga o'tadi
  secondary:
    'bg-fill-tertiary text-brand-900 enabled:hover:bg-accent-50 enabled:hover:text-accent-700 active:bg-accent-100',
  // Bordered — oq sirt + hairline; hover'da hoshiya "rangga kiradi"
  outline:
    'bg-white text-brand-900 border border-slate-200 enabled:hover:border-accent-200 enabled:hover:bg-accent-50 enabled:hover:text-accent-700 active:bg-accent-100',
  // Plain — fonsiz yorliq; hover'da tint plate
  ghost:
    'text-slate-600 enabled:hover:bg-accent-50 enabled:hover:text-accent-700 active:bg-accent-100 active:text-accent-700',
  // Destructive — iOS qizil, yumshoq fon
  // (sheen YO'Q: oq sirt ustida oq yorug'lik ko'rinmaydi — javob nur bilan)
  danger:
    'bg-rose-50 text-rose-600 enabled:hover:bg-rose-100 enabled:hover:shadow-[0_10px_26px_-14px_rgba(229,39,27,0.45)] active:bg-rose-100',
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
