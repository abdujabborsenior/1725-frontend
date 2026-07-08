'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Faqat ko'rsatish uchun — qisman to'ldirishni qo'llab-quvvatlaydi */
export function StarRating({
  value,
  size = 14,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    // role="img" — aria-label generik span'da taqiqlangan (aria-prohibited-attr)
    <span role="img" className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value} / 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-slate-200" style={{ width: size, height: size }} fill="currentColor" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="text-amber-400" style={{ width: size, height: size }} fill="currentColor" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Interaktiv — sharh formasi uchun */
export function RatingInput({
  value,
  onChange,
  size = 30,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="inline-flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          aria-label={`${n} yulduz`}
          className="transition-transform hover:scale-110"
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(
              'transition-colors',
              n <= active ? 'text-amber-400' : 'text-slate-200',
            )}
            fill="currentColor"
          />
        </button>
      ))}
    </div>
  );
}
