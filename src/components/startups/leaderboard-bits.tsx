'use client';

import { ChevronUp, ChevronDown, Minus, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * O'rin harakati — IMDB/chart uslubidagi ▲ / ▼ / — / NEW.
 * delta = (oldingi o'rin − joriy). + ko'tarildi, − tushdi, 0 o'zgarmadi.
 */
export function RankMovement({
  delta,
  className,
}: {
  delta: number | null;
  className?: string;
}) {
  if (delta === null) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-md bg-iris-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-iris-600',
          className,
        )}
      >
        Yangi
      </span>
    );
  }
  if (delta === 0) {
    return (
      <span className={cn('inline-flex items-center text-slate-300', className)}>
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums',
        up ? 'text-emerald-600' : 'text-rose-500',
        className,
      )}
      title={up ? `${delta} pog'ona ko'tarildi` : `${-delta} pog'ona tushdi`}
    >
      {up ? (
        <ChevronUp className="h-3.5 w-3.5" />
      ) : (
        <ChevronDown className="h-3.5 w-3.5" />
      )}
      {Math.abs(delta)}
    </span>
  );
}

/** Reyting baliga qarab rang darajasi (oltin → yashil → kulrang) */
function scoreTone(score: number): string {
  if (score >= 4.5) return 'bg-amber-50 text-amber-700 ring-amber-200';
  if (score >= 4) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (score >= 3) return 'bg-sky-50 text-sky-700 ring-sky-200';
  return 'bg-slate-100 text-slate-600 ring-slate-200';
}

/** Bayes vaznli ball chipi (yulduz bilan) */
export function ScoreBadge({
  score,
  size = 'md',
  className,
}: {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const pad =
    size === 'lg'
      ? 'px-3 py-1.5 text-base gap-1.5'
      : size === 'sm'
        ? 'px-1.5 py-0.5 text-[11px] gap-0.5'
        : 'px-2 py-1 text-sm gap-1';
  const star = size === 'lg' ? 'h-4 w-4' : size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg font-extrabold tabular-nums ring-1 ring-inset',
        pad,
        scoreTone(score),
        className,
      )}
    >
      <Star className={cn(star, 'fill-current')} />
      {score.toFixed(2)}
    </span>
  );
}

/** Top-3 medal ranglari */
export const MEDAL = {
  1: {
    ring: 'ring-amber-300',
    grad: 'from-amber-300 via-yellow-400 to-amber-500',
    text: 'text-amber-900',
    glow: 'shadow-[0_8px_30px_-6px_rgba(245,158,11,0.55)]',
    label: 'Oltin',
  },
  2: {
    ring: 'ring-slate-300',
    grad: 'from-slate-200 via-slate-300 to-slate-400',
    text: 'text-slate-700',
    glow: 'shadow-[0_8px_30px_-8px_rgba(100,116,139,0.45)]',
    label: 'Kumush',
  },
  3: {
    ring: 'ring-orange-300',
    grad: 'from-orange-300 via-amber-600 to-orange-700',
    text: 'text-orange-950',
    glow: 'shadow-[0_8px_30px_-8px_rgba(194,120,3,0.5)]',
    label: 'Bronza',
  },
} as const;

/** Doira ichidagi o'rin raqami — top-3 medalli, qolgani sodda */
export function RankNumber({ rank }: { rank: number }) {
  const medal = MEDAL[rank as 1 | 2 | 3];
  if (medal) {
    return (
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black ring-2',
          medal.grad,
          medal.ring,
          medal.text,
          medal.glow,
        )}
      >
        {rank}
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-500">
      {rank}
    </span>
  );
}
