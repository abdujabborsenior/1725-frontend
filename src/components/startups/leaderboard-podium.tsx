'use client';

import Link from 'next/link';
import { Crown, Eye, Users } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';
import { cn } from '@/lib/utils';
import { MEDAL, RankMovement, ScoreBadge } from './leaderboard-bits';

function PodiumCard({
  entry,
  elevated,
}: {
  entry: LeaderboardEntry;
  elevated?: boolean;
}) {
  const medal = MEDAL[entry.rank as 1 | 2 | 3];
  return (
    <Link
      href={`/startups/${entry.slug}`}
      className={cn(
        'group relative flex flex-col items-center rounded-3xl border bg-white p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover',
        elevated
          ? 'border-amber-200 shadow-card-hover md:-mt-6'
          : 'border-slate-200 shadow-card',
      )}
    >
      {/* Medal o'rin chipi */}
      <span
        className={cn(
          'absolute -top-3.5 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br text-xs font-black ring-2 ring-white',
          medal?.grad,
          medal?.text,
          medal?.glow,
        )}
      >
        {entry.rank}
      </span>

      {entry.rank === 1 && (
        <Crown className="absolute -top-9 left-1/2 h-6 w-6 -translate-x-1/2 fill-amber-400 text-amber-500 drop-shadow" />
      )}

      {/* Logo */}
      <div
        className={cn(
          'mt-3 flex items-center justify-center overflow-hidden rounded-2xl bg-white ring-2',
          elevated ? 'h-20 w-20' : 'h-16 w-16',
          medal?.ring,
        )}
      >
        {entry.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.logoUrl}
            alt={entry.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-2xl font-black text-brand-900">
            {entry.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <h3
        className={cn(
          'mt-3 line-clamp-1 font-bold text-brand-900 group-hover:text-accent-700',
          elevated ? 'text-base' : 'text-sm',
        )}
      >
        {entry.title}
      </h3>
      {entry.category && (
        <span className="mt-0.5 text-[11px] font-medium text-slate-400">
          {entry.category}
        </span>
      )}

      <div className="mt-3">
        <ScoreBadge score={entry.score} size={elevated ? 'lg' : 'md'} />
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3" /> {entry.leaderboardVotes} ovoz
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

/** Top-3 podium — markazда #1 baland, chapда #2, o'ngда #3 (klassik podium) */
export function LeaderboardPodium({ top }: { top: LeaderboardEntry[] }) {
  const [first, second, third] = top;
  if (!first) return null;

  return (
    <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
      {/* Mobilда tartib: 1,2,3 — desktopда: 2,1,3 */}
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
