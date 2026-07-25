'use client';

import Link from 'next/link';
import { Eye, Users } from '@/components/icons';
import type { LeaderboardEntry } from '@/types';
import { RatingValue } from './rating';
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
      className="group flex items-center gap-3 rounded-ios-2xl bg-white p-3 transition-all duration-200 hover:shadow-card sm:gap-4 sm:p-4"
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
        <h3 className="truncate text-subhead font-bold text-brand-900 group-hover:text-accent-700 sm:text-callout">
          {entry.title}
        </h3>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-caption-1 text-slate-500">
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
            <span className="hidden items-center gap-1 text-slate-500 sm:inline-flex">
              {platformTypes.slice(0, 3).map((t) => (
                <PlatformIcon key={t} type={t} className="h-3 w-3" />
              ))}
            </span>
          )}
        </div>
        {/* O'rtacha ovoz — IMDB naqshi (X.X/10) */}
        <div className="mt-1">
          <RatingValue
            value={entry.leaderboardRating}
            count={entry.leaderboardVotes}
            size="xs"
          />
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
    <div className="flex animate-pulse items-center gap-4 rounded-ios-2xl bg-white p-4">
      <div className="h-9 w-9 rounded-ios-md bg-slate-100" />
      <div className="h-14 w-14 rounded-ios-md bg-slate-100" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded bg-slate-100" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
      </div>
      <div className="h-8 w-16 rounded-ios bg-slate-100" />
    </div>
  );
}
