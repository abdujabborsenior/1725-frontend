'use client';

import Link from 'next/link';
import { Eye, StarFill, Users } from '@/components/icons';
import type { LeaderboardEntry } from '@/types';
import { cn } from '@/lib/utils';
import { MEDAL, RankMovement } from './leaderboard-bits';
import { StartupLogo } from './startup-logo';

/**
 * Podium kartasi — reytingning tantanali qismi.
 *
 * Kompozitsiya: metal qirra → o'rin tamg'asi → metal halqadagi logotip →
 * nom/kategoriya → **ball asosiy qahramon** (yirik raqam) → hairline →
 * ovoz/ko'rish sanoqlari. Ball yirik yozilgani bejiz emas: reyting
 * sahifasining butun mazmuni shu raqamda, ilgari u kichik chip edi va
 * karta "bo'sh" ko'rinardi.
 */
function PodiumCard({
  entry,
  elevated,
}: {
  entry: LeaderboardEntry;
  elevated?: boolean;
}) {
  const medal = MEDAL[entry.rank as 1 | 2 | 3];
  const MedalIcon = medal?.icon;

  return (
    <Link
      href={`/startups/${entry.slug}`}
      aria-label={`${entry.rank}-o'rin: ${entry.title}, ball ${entry.score.toFixed(1)}`}
      className={cn(
        'podium-card group relative flex flex-col items-center overflow-hidden rounded-ios-2xl bg-white text-center',
        medal?.cls,
        elevated ? 'pb-6 pt-11 shadow-card-hover md:-mt-5' : 'pb-5 pt-10 shadow-card',
      )}
    >
      {/* Metal qirra — kartaning imzosi */}
      <span className="medal-edge absolute inset-x-0 top-0 h-[3px]" aria-hidden />

      {/* Metal nurning juda past intensivlikdagi aksi (faqat g'olibda) */}
      {elevated && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-[0.13]"
          style={{
            background:
              'radial-gradient(60% 100% at 50% 0%, var(--m2) 0%, transparent 70%)',
          }}
        />
      )}

      {/* O'rin tamg'asi */}
      <span className="medal-badge absolute left-1/2 top-3 inline-flex h-7 -translate-x-1/2 items-center gap-1.5 rounded-full pl-2 pr-2.5 text-caption-1 font-bold">
        {MedalIcon && <MedalIcon className="h-3.5 w-3.5" />}
        {entry.rank}-o&apos;rin
      </span>

      {/* Logotip — metal halqada */}
      <StartupLogo
        src={entry.logoUrl}
        title={entry.title}
        size={elevated ? 80 : 64}
        className="medal-ring relative"
      />

      <h3
        className={cn(
          'mt-4 line-clamp-1 w-full px-4 font-semibold text-brand-900 transition-colors duration-150 group-hover:text-accent-700',
          elevated ? 'text-title-3' : 'text-callout',
        )}
      >
        {entry.title}
      </h3>
      {entry.category && (
        <span className="mt-0.5 line-clamp-1 px-4 text-caption-1 font-medium text-slate-500">
          {entry.category}
        </span>
      )}

      {/* Ball — kartaning qahramoni */}
      <div className="mt-3 flex items-baseline gap-1.5">
        <StarFill
          className={cn('self-center', elevated ? 'h-5 w-5' : 'h-4 w-4')}
          style={{ color: 'var(--m2)' }}
        />
        <span
          className={cn(
            'font-bold tabular-nums tracking-tight text-brand-900',
            elevated ? 'text-large-title' : 'text-title-1',
          )}
        >
          {entry.score.toFixed(1)}
        </span>
        <span className="text-footnote font-medium text-slate-500">/10</span>
      </div>

      {/* Sanoqlar + o'rin harakati */}
      <div className="mt-4 flex w-full items-center justify-center gap-4 border-t border-slate-200/70 px-4 pt-3.5 text-caption-1 text-slate-600">
        <span className="inline-flex items-center gap-1 tabular-nums" title="Baholaganlar">
          <Users className="h-3.5 w-3.5 text-slate-400" /> {entry.leaderboardVotes}
        </span>
        <span className="inline-flex items-center gap-1 tabular-nums" title="Ko'rishlar">
          <Eye className="h-3.5 w-3.5 text-slate-400" /> {entry.viewCount}
        </span>
        <RankMovement delta={entry.rankDelta} />
      </div>
    </Link>
  );
}

/** Top-3 podium — markazda #1 baland, chapda #2, o'ngda #3 (klassik podium) */
export function LeaderboardPodium({ top }: { top: LeaderboardEntry[] }) {
  const [first, second, third] = top;
  if (!first) return null;

  return (
    <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3 sm:gap-5">
      {/* Mobilda tartib: 1,2,3 — desktopda: 2,1,3 */}
      <div className="order-2 sm:order-1">{second && <PodiumCard entry={second} />}</div>
      <div className="order-1 sm:order-2">
        <PodiumCard entry={first} elevated />
      </div>
      <div className="order-3">{third && <PodiumCard entry={third} />}</div>
    </div>
  );
}
