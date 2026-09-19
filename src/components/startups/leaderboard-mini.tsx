'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Users } from '@/components/icons';
import type { LeaderboardEntry } from '@/types';
import { useFormatNumber } from '@/lib/format';
import { RankNumber, ScoreBadge } from './leaderboard-bits';

/**
 * Bosh sahifa / yon panel uchun ixcham reyting ro'yxati (top N).
 * Ovozlar soni — umumiy `social.votes` (global lug'at): bosh sahifaga butun
 * `leaderboard` nomlar maydonini yuklamaslik uchun.
 */
export function LeaderboardMini({ entries }: { entries: LeaderboardEntry[] }) {
  const t = useTranslations('social');
  const fmt = useFormatNumber();
  return (
    <div className="overflow-hidden rounded-ios-2xl bg-white shadow-soft">
      {entries.map((e, i) => (
        <Link
          key={e.id}
          href={`/startups/${e.slug}`}
          className={`group flex items-center gap-3 px-3 py-2.5 hv-row ${
            i > 0 ? 'border-t border-slate-100' : ''
          }`}
        >
          <RankNumber rank={e.rank} />
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-ios-lg bg-white">
            {e.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.logoUrl} alt={e.title} className="h-full w-full object-cover" />
            ) : (
              <span className="text-subhead font-semibold text-brand-900">
                {e.title.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-subhead font-bold text-brand-900 group-hover:text-accent-700">
              {e.title}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-caption-1 text-slate-500">
              <Users className="h-3 w-3" />{' '}
              {t('votes', { count: e.leaderboardVotes, n: fmt(e.leaderboardVotes) })}
            </p>
          </div>
          <ScoreBadge score={e.score} size="sm" />
        </Link>
      ))}
    </div>
  );
}
