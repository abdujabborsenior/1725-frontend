'use client';

import Link from 'next/link';
import { Users } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';
import { RankNumber, ScoreBadge } from './leaderboard-bits';

/** Bosh sahifa / yon panel uchun ixcham reyting ro'yxati (top N) */
export function LeaderboardMini({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
      {entries.map((e, i) => (
        <Link
          key={e.id}
          href={`/startups/${e.slug}`}
          className={`group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-slate-50 ${
            i > 0 ? 'border-t border-slate-100' : ''
          }`}
        >
          <RankNumber rank={e.rank} />
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
            {e.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.logoUrl} alt={e.title} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-black text-brand-900">
                {e.title.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-brand-900 group-hover:text-accent-700">
              {e.title}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
              <Users className="h-3 w-3" /> {e.leaderboardVotes} ovoz
            </p>
          </div>
          <ScoreBadge score={e.score} size="sm" />
        </Link>
      ))}
    </div>
  );
}
