'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { ChevronRight, Star, Sparkles } from '@/components/icons';
import { StartupLogo } from '@/components/startups/startup-logo';
import { cn } from '@/lib/utils';
import type { AiMatch } from '@/types';

/**
 * AI topgan loyiha — natija kartasi.
 *
 * Bu yerda ODDIY startap kartasi ATAYLAB ishlatilmaydi: javob oqimida
 * asosiy narsa katta muqova rasm emas, **nega aynan shu loyiha mos ekani**.
 * Shuning uchun: logotip + nom + AI izohi, va eng mos variant birinchi
 * o'rinda nozik "Eng mos" tamg'asi bilan ajratiladi (tanlov yuki kamayadi —
 * foydalanuvchi qaysi biridan boshlashni biladi).
 */
export function AiMatchCard({ match, index }: { match: AiMatch; index: number }) {
  const { startup, reason } = match;
  const top = index === 0;

  return (
    <Link
      href={`/startups/${startup.slug || startup.id}`}
      style={{ '--ai-delay': `${0.08 + index * 0.07}s` } as CSSProperties}
      className={cn(
        'ai-focus-in tappable group relative flex items-start gap-3.5 rounded-ios-xl bg-white p-4 transition-shadow duration-250 ease-ios hover:shadow-card',
        top && 'ring-1 ring-accent-500/25',
      )}
    >
      <StartupLogo
        src={startup.logoUrl}
        title={startup.title}
        size={48}
        className="mt-0.5 shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="min-w-0 truncate text-callout font-semibold text-brand-900">
            {startup.title}
          </p>
          {top && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-caption-2 font-semibold text-accent-700">
              <Sparkles className="h-3 w-3" /> Eng mos
            </span>
          )}
          {startup.ratingCount > 0 && (
            <span className="flex shrink-0 items-center gap-0.5 text-caption-1 tabular-nums text-slate-500">
              <Star className="h-3 w-3 text-amber-500" />
              {startup.ratingAvg.toFixed(1)}
            </span>
          )}
        </div>

        {reason && (
          <p className="mt-1 text-subhead leading-snug text-slate-600">{reason}</p>
        )}
        {startup.category && (
          <p className="mt-1.5 text-caption-1 text-slate-500">{startup.category}</p>
        )}
      </div>

      <ChevronRight
        className="mt-3 h-4 w-4 shrink-0 text-slate-300 transition-transform duration-250 ease-ios group-hover:translate-x-0.5 group-hover:text-accent-600"
        strokeWidth={2.5}
      />
    </Link>
  );
}
