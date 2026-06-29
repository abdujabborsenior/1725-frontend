'use client';

import Link from 'next/link';
import { Eye, Users } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';
import { cn } from '@/lib/utils';
import { MEDAL, RankMovement, ScoreBadge } from './leaderboard-bits';
import { StartupLogo } from './startup-logo';

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
      className={cn(
        'group relative flex flex-col items-center rounded-3xl border bg-white px-4 pb-5 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover',
        elevated
          ? 'border-amber-200/80 pt-10 shadow-card-hover md:-mt-6'
          : 'border-slate-200 pt-9 shadow-card',
      )}
    >
      {/* Medal — o'rin + tartib belgisi */}
      <span
        className={cn(
          'absolute -top-4 left-1/2 inline-flex h-9 -translate-x-1/2 items-center gap-1 rounded-full px-3 text-xs font-black ring-1 ring-inset shadow-sm',
          medal?.bg,
          medal?.ring,
          medal?.text,
        )}
      >
        {MedalIcon && <MedalIcon className="h-3.5 w-3.5" />}
        {entry.rank}-o&apos;rin
      </span>

      {/* Logo — har doim ko'rinadi (gradient + harf zaxira) */}
      <StartupLogo
        src={entry.logoUrl}
        title={entry.title}
        size={elevated ? 76 : 60}
        className={cn('ring-2', medal?.ring)}
      />

      <h3
        className={cn(
          'mt-3 line-clamp-1 font-bold text-brand-900 group-hover:text-accent-700',
          elevated ? 'text-base' : 'text-sm',
        )}
      >
        {entry.title}
      </h3>
      {entry.category && (
        <span className="mt-0.5 line-clamp-1 text-[11px] font-medium text-slate-400">
          {entry.category}
        </span>
      )}

      <div className="mt-3">
        <ScoreBadge score={entry.score} size={elevated ? 'lg' : 'md'} />
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3" /> {entry.leaderboardVotes}
        </span>
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3 w-3" /> {entry.viewCount}
        </span>
      </div>

      <div className="mt-2">
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
    <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
      {/* Mobilda tartib: 1,2,3 — desktopda: 2,1,3 */}
      <div className="order-2 sm:order-1">
        {second && <PodiumCard entry={second} />}
      </div>
      <div className="order-1 sm:order-2">
        <PodiumCard entry={first} elevated />
      </div>
      <div className="order-3">{third && <PodiumCard entry={third} />}</div>
    </div>
  );
}
