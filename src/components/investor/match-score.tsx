'use client';

import { cn } from '@/lib/utils';
import { DETAIL_LABEL, DETAIL_TONE, FACTOR_LABEL, scoreTone } from '@/lib/venture';
import type { MatchFactor } from '@/types';

/**
 * **Match Score halqasi.**
 *
 * Foiz o'z-o'zicha ishonch uyg'otmaydi — shuning uchun halqa hech qachon
 * yolg'iz ko'rsatilmaydi: yonida doim daraja yorlig'i ("Juda mos") turadi,
 * kartada esa omillar taqsimoti bir bosishda ochiladi.
 */
export function MatchScoreRing({
  score,
  size = 56,
  className,
}: {
  score: number;
  size?: number;
  className?: string;
}) {
  const tone = scoreTone(score);
  const stroke = size >= 56 ? 4 : 3;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Moslik ${score} foiz — ${tone.label}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-slate-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className={cn(tone.ring, 'transition-[stroke-dasharray] duration-500 ease-ios')}
        />
      </svg>
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center font-semibold tabular-nums',
          tone.text,
          size >= 56 ? 'text-subhead' : 'text-caption-1',
        )}
      >
        {score}
      </span>
    </div>
  );
}

/**
 * **Omillar taqsimoti** — ballning ortida nima turgani.
 *
 * Bu ro'yxat mahsulotning ishonch mexanizmi: "94%" degan raqam ostida
 * "soha 28/28 · bosqich 18/18 · summa 8/16" ko'rinmasa, investor bir marta
 * ishonmay qo'yadi va qaytmaydi.
 */
export function FactorBreakdown({
  factors,
  className,
}: {
  factors: MatchFactor[];
  className?: string;
}) {
  const sorted = [...factors].sort((a, b) => b.max - a.max);
  return (
    <ul className={cn('space-y-2.5', className)}>
      {sorted.map((f) => {
        const pct = f.max > 0 ? Math.round((f.earned / f.max) * 100) : 0;
        return (
          <li key={f.key}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-subhead text-brand-900">
                {FACTOR_LABEL[f.key]}
              </span>
              <span className="flex items-baseline gap-2">
                <span className={cn('text-caption-1', DETAIL_TONE[f.detail])}>
                  {DETAIL_LABEL[f.detail]}
                </span>
                <span className="text-caption-1 tabular-nums text-slate-500">
                  {f.earned}/{f.max}
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-500 ease-ios',
                  pct >= 80
                    ? 'bg-accent-500'
                    : pct >= 40
                      ? 'bg-amber-500'
                      : 'bg-slate-400',
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
