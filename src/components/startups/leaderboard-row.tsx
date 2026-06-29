'use client';

import Link from 'next/link';
import { Eye, Users } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';
import { StarRating } from './rating';
import { PlatformIcon } from './platform';
import { PLATFORM_ORDER } from '@/lib/constants';
import { RankMovement, RankNumber, ScoreBadge } from './leaderboard-bits';
import { StartupLogo } from './startup-logo';

export function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const platformTypes = Array.from(
    new Set(entry.platforms.map((p) => p.type)),
  ).sort((a, b) => PLATFORM_ORDER.indexOf(a) - PLATFORM_ORDER.indexOf(b));

  return (
    <Link
      href={`/startups/${entry.slug}`}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-all duration-200 hover:border-accent-300 hover:shadow-card sm:gap-4 sm:p-4"
    >
      {/* O'rin + harakat */}
      <div className="flex w-9 flex-col items-center gap-1 shrink-0">
        <RankNumber rank={entry.rank} />
        <RankMovement delta={entry.rankDelta} />
      </div>

      {/* Logo — har doim ko'rinadi */}
      <StartupLogo
        src={entry.logoUrl}
        title={entry.title}
        size={56}
        className="h-12 w-12 ring-1 ring-slate-200/70 sm:h-14 sm:w-14"
      />

      {/* Nom + meta */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-brand-900 group-hover:text-accent-700 sm:text-base">
          {entry.title}
        </h3>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
          {entry.category && (
            <span className="font-medium text-slate-500">{entry.category}</span>
          )}
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" /> {entry.leaderboardVotes}
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <Eye className="h-3 w-3" /> {entry.viewCount}
          </span>
          {platformTypes.length > 0 && (
            <span className="hidden items-center gap-1 text-slate-400 sm:inline-flex">
              {platformTypes.slice(0, 3).map((t) => (
                <PlatformIcon key={t} type={t} className="h-3 w-3" />
              ))}
            </span>
          )}
        </div>
        {/* Yulduzli o'rtacha (mobilда ham) */}
        <div className="mt-1 flex items-center gap-1.5">
          <StarRating value={entry.leaderboardRating} size={11} />
          <span className="text-[11px] font-semibold text-slate-500">
            {entry.leaderboardRating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Bayes ball */}
      <div className="shrink-0">
        <ScoreBadge score={entry.score} />
      </div>
    </Link>
  );
}

export function LeaderboardRowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="h-9 w-9 rounded-xl bg-slate-100" />
      <div className="h-14 w-14 rounded-xl bg-slate-100" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded bg-slate-100" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
      </div>
      <div className="h-8 w-16 rounded-lg bg-slate-100" />
    </div>
  );
}
