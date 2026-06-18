'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  /** Tarix bo'sh bo'lsa qaytadigan manzil */
  fallbackHref?: string;
  /** Yon matn (masalan "Ortga") — berilsa pill ko'rinishida chiqadi */
  label?: string;
  className?: string;
}

/**
 * Qayta ishlatiladigan "Ortga" tugmasi.
 * router.back() ni chaqiradi; tarix bo'lmasa fallbackHref ga yo'naltiradi.
 */
export function BackButton({ fallbackHref = '/', label, className }: BackButtonProps) {
  const router = useRouter();

  function goBack() {
    if (typeof window !== 'undefined' && window.history.length <= 1) {
      router.push(fallbackHref);
    } else {
      router.back();
    }
  }

  if (label) {
    return (
      <button
        type="button"
        onClick={goBack}
        className={cn(
          'group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 py-2 pl-3 pr-4 text-sm font-semibold text-slate-600 shadow-soft backdrop-blur transition-all hover:border-slate-300 hover:text-brand-900 active:scale-[0.97]',
          className,
        )}
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Ortga"
      title="Ortga"
      className={cn(
        'group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 shadow-soft backdrop-blur transition-all hover:border-slate-300 hover:text-brand-900 active:scale-95',
        className,
      )}
    >
      <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
    </button>
  );
}
