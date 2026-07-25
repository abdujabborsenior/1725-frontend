'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from '@/components/icons';
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

  /* iOS "Back": chevron + tint yorliq — pill/karta emas */
  if (label) {
    return (
      <button
        type="button"
        onClick={goBack}
        className={cn('tappable -ml-1 -my-2 flex min-h-[38px] items-center gap-0.5 py-2 text-body text-accent-700', className)}
      >
        <ChevronLeft className="h-[19px] w-[19px]" strokeWidth={3} />
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
        'tappable flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-accent-700',
        className,
      )}
    >
      <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={3} />
    </button>
  );
}
