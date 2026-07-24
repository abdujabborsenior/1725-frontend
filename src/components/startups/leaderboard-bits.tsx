'use client';

import { ChevronUp, ChevronDown, Minus, Star, Trophy, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * O'rin harakati — chart uslubidagi ▲ / ▼ / — / Yangi.
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
      {up ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      {Math.abs(delta)}
    </span>
  );
}

/** Reyting baliga qarab vazmin rang darajasi (10 ballik shkala) */
function scoreTone(score: number): string {
  if (score >= 9) return 'bg-amber-50 text-amber-700 ring-amber-200';
  if (score >= 8) return 'bg-accent-50 text-accent-700 ring-accent-200';
  if (score >= 6) return 'bg-sky-50 text-sky-700 ring-sky-200';
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
      {score.toFixed(1)}
    </span>
  );
}

/** Top-3 — vazmin, jiddiy oltin/kumush/bronza palitra (porloq emas) */
export const MEDAL = {
  1: {
    ring: 'ring-amber-300',
    bg: 'bg-gradient-to-br from-amber-300 to-amber-500',
    text: 'text-amber-950',
    soft: 'bg-amber-50 text-amber-700 ring-amber-200',
    icon: Trophy,
    label: 'Oltin',
  },
  2: {
    ring: 'ring-slate-300',
    bg: 'bg-gradient-to-br from-slate-300 to-slate-400',
    text: 'text-slate-800',
    soft: 'bg-slate-100 text-slate-600 ring-slate-300',
    icon: Medal,
    label: 'Kumush',
  },
  3: {
    ring: 'ring-orange-300',
    bg: 'bg-gradient-to-br from-orange-300 to-orange-500',
    text: 'text-orange-950',
    soft: 'bg-orange-50 text-orange-700 ring-orange-200',
    icon: Medal,
    label: 'Bronza',
  },
} as const;

/** Yumaloq-kvadrat ichidagi o'rin raqami — top-3 medalli, qolgani sodda */
export function RankNumber({ rank }: { rank: number }) {
  const medal = MEDAL[rank as 1 | 2 | 3];
  if (medal) {
    return (
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ring-1 ring-inset shadow-sm',
          medal.bg,
          medal.ring,
          medal.text,
        )}
      >
        {rank}
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
      {rank}
    </span>
  );
}
