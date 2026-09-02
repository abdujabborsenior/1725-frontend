'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { ChevronRight, Star } from '@/components/icons';
import { StartupLogo } from '@/components/startups/startup-logo';
import { categoryTintDark } from '@/lib/category-tint';
import { cn } from '@/lib/utils';
import type { AiMatch } from '@/types';

/**
 * AI topgan loyiha — natija kartasi.
 *
 * Bu yerda ODDIY startap kartasi ATAYLAB ishlatilmaydi: javob oqimida
 * asosiy narsa katta muqova emas, **nega aynan shu loyiha mos ekani**.
 * Shuning uchun: logotip + nom + AI izohi. Eng mos variant birinchi
 * o'rinda va uning chekkasida nozik nur bor — tanlov yuki kamayadi.
 *
 * Rang tasodifiy emas: kategoriya rangi (butun mahsulot bo'ylab yagona
 * manba) hover nuriga va nom ostidagi chipга beriladi.
 */
export function AiMatchCard({
  match,
  index,
  animate,
}: {
  match: AiMatch;
  index: number;
  animate: boolean;
}) {
  const { startup, reason } = match;
  const top = index === 0;
  const tint = categoryTintDark(startup.category);

  return (
    <Link
      href={`/startups/${startup.slug || startup.id}`}
      style={
        {
          '--d': `${0.1 + index * 0.07}s`,
          '--yz-tint': `${tint}80`,
        } as CSSProperties
      }
      className={cn(
        'yz-card yz-card-tap group flex items-start gap-3.5 p-4',
        animate && 'yz-rise',
        top && 'shadow-[inset_0_0_0_1px_rgba(77,163,255,0.28)]',
      )}
    >
      <StartupLogo
        src={startup.logoUrl}
        title={startup.title}
        size={46}
        className="mt-0.5 shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="min-w-0 truncate text-callout font-semibold text-[color:var(--yz-ink)]">
            {startup.title}
          </p>
          {top && (
            <span className="shrink-0 rounded-full bg-[color:var(--yz-blue)]/18 px-2 py-0.5 text-caption-2 font-semibold text-[color:var(--yz-blue)]">
              Eng mos
            </span>
          )}
          {startup.ratingCount > 0 && (
            <span className="flex shrink-0 items-center gap-0.5 text-caption-1 tabular-nums text-[color:var(--yz-ink-3)]">
              <Star className="h-3 w-3 text-amber-400" />
              {startup.ratingAvg.toFixed(1)}
            </span>
          )}
        </div>

        {reason && (
          <p className="mt-1 text-subhead leading-snug text-[color:var(--yz-ink-2)]">
            {reason}
          </p>
        )}
        {startup.category && (
          <span
            className="mt-2 inline-block text-caption-1 font-medium"
            style={{ color: tint }}
          >
            {startup.category}
          </span>
        )}
      </div>

      <ChevronRight
        className="mt-3 h-4 w-4 shrink-0 text-[color:var(--yz-ink-3)] transition-transform duration-250 ease-ios group-hover:translate-x-1"
        strokeWidth={2.5}
      />
    </Link>
  );
}
