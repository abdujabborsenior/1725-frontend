'use client';

import { useState } from 'react';
import { StarFill } from '@/components/icons';
import { cn } from '@/lib/utils';

/** Reyting shkalasi — IMDB uslubi (1..10 butun ovoz, o'rtacha kasrli) */
export const RATING_MAX = 10;

/**
 * O'rtacha bahoni ko'rsatish — IMDB naqshi: BITTA to'ldirilgan yulduz +
 * "8.4" + xira "/10". O'nta yulduz chizish shovqinli va mobilда siqiladi;
 * bitta yulduz + raqam esa istalgan o'lchamda aniq o'qiladi.
 */
export function RatingValue({
  value,
  count,
  size = 'md',
  className,
}: {
  value: number;
  /** Ovozlar soni — berilsa qavs ichida ko'rsatiladi */
  count?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const S = {
    xs: { star: 'h-3 w-3', num: 'text-caption-1', sub: 'text-caption-2' },
    sm: { star: 'h-3.5 w-3.5', num: 'text-footnote', sub: 'text-caption-1' },
    md: { star: 'h-4 w-4', num: 'text-subhead', sub: 'text-footnote' },
    lg: { star: 'h-6 w-6', num: 'text-title-1', sub: 'text-subhead' },
  }[size];

  return (
    <span
      className={cn('inline-flex items-baseline gap-1', className)}
      role="img"
      aria-label={`Reyting ${value.toFixed(1)} / ${RATING_MAX}${
        count != null ? ` — ${count} ta ovoz` : ''
      }`}
    >
      <StarFill className={cn(S.star, 'self-center text-amber-500')} aria-hidden />
      <span className={cn(S.num, 'font-semibold tabular-nums text-brand-900')}>
        {value.toFixed(1)}
      </span>
      <span className={cn(S.sub, 'text-slate-500')}>/{RATING_MAX}</span>
      {count != null && (
        <span className={cn(S.sub, 'text-slate-500')}>({count})</span>
      )}
    </span>
  );
}

/**
 * Interaktiv baholash — IMDB "Rate this" naqshi: 10 ta yulduz qatori.
 * Ustiga olib borilganda o'sha darajagacha yonadi, tanlanganda ball ko'rinadi.
 * Klaviatura bilan ham boshqariladi (radiogroup — ←/→ bilan).
 */
export function RatingInput({
  value,
  onChange,
  size = 26,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="radiogroup"
        aria-label={`Baho — 1 dan ${RATING_MAX} gacha`}
        className="inline-flex items-center gap-0.5"
        onMouseLeave={() => setHover(0)}
      >
        {Array.from({ length: RATING_MAX }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} ball`}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            onClick={() => onChange(n)}
            className="rounded-md p-0.5 transition-transform duration-150 ease-ios hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            <StarFill
              style={{ width: size, height: size }}
              className={cn('transition-colors duration-150', n <= active ? 'text-amber-500' : 'text-slate-200')}
            />
          </button>
        ))}
      </div>
      <span
        className={cn(
          'min-w-[3.5rem] text-subhead font-semibold tabular-nums',
          active ? 'text-brand-900' : 'text-slate-400',
        )}
        aria-live="polite"
      >
        {active ? `${active} / ${RATING_MAX}` : `— / ${RATING_MAX}`}
      </span>
    </div>
  );
}
