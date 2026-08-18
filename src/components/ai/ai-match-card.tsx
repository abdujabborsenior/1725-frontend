'use client';

import Link from 'next/link';
import { ChevronRight, Star } from '@/components/icons';
import { StartupLogo } from '@/components/startups/startup-logo';
import type { AiMatch } from '@/types';

/**
 * AI topgan loyiha — iOS "natija qatori" (inset grouped list ichida).
 * Bu yerda ODDIY startap kartasi ATAYLAB ishlatilmaydi: javob oqimida asosiy
 * narsa — **nega mos ekani**, katta muqova rasm emas. Shuning uchun zich
 * qator: logotip + nom + AI izohi + chevron.
 */
export function AiMatchCard({ match, index }: { match: AiMatch; index: number }) {
  const { startup, reason } = match;
  return (
    <Link
      href={`/startups/${startup.slug || startup.id}`}
      className="ios-row items-start gap-3 py-3.5"
      style={{ animationDelay: `${0.05 * index}s` }}
    >
      <StartupLogo
        src={startup.logoUrl}
        title={startup.title}
        size={44}
        className="mt-0.5 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="min-w-0 truncate text-callout font-semibold text-brand-900">
            {startup.title}
          </p>
          {startup.ratingCount > 0 && (
            <span className="flex shrink-0 items-center gap-0.5 text-caption-1 tabular-nums text-slate-500">
              <Star className="h-3 w-3 text-amber-500" />
              {startup.ratingAvg.toFixed(1)}
            </span>
          )}
        </div>
        {reason && (
          <p className="mt-0.5 text-subhead leading-snug text-slate-600">{reason}</p>
        )}
        {startup.category && (
          <p className="mt-1 text-caption-1 text-slate-400">{startup.category}</p>
        )}
      </div>
      <ChevronRight className="mt-3 h-4 w-4 shrink-0 text-slate-300" strokeWidth={2.5} />
    </Link>
  );
}
