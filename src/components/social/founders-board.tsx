'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Crown, Rocket, Users } from '@/components/icons';
import { usersApi } from '@/lib/api';
import type { FounderEntry } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { Pagination } from '@/components/ui/pagination';
import { FounderBadge } from './founder-badge';
import { FounderVoteButton } from './founder-vote-button';
import { cn } from '@/lib/utils';

const LIMIT = 20;

/** Reyting o'rni belgisi — top-3 uchun maxsus, qolganlari sokin raqam */
function RankMark({ rank }: { rank: number }) {
  if (rank <= 3) {
    const tone =
      rank === 1
        ? 'bg-amber-100 text-amber-700 border-amber-200'
        : rank === 2
          ? 'bg-slate-100 text-slate-600 border-slate-200'
          : 'bg-orange-50 text-orange-700 border-orange-200';
    return (
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-ios-md border text-subhead font-semibold',
          tone,
        )}
      >
        {rank === 1 ? <Crown className="h-4 w-4" /> : rank}
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center text-subhead font-bold text-slate-400">
      {rank}
    </span>
  );
}

function FounderRow({ entry }: { entry: FounderEntry }) {
  const profileHref = entry.username ? `/u/${entry.username}` : `/u/${entry.id}`;
  return (
    <div className="flex items-center gap-3 rounded-ios-2xl bg-white p-3.5 transition-all hover:shadow-card-hover sm:gap-4 sm:p-4">
      <RankMark rank={entry.rank} />

      <Link href={profileHref} className="shrink-0 transition-opacity hover:opacity-80">
        <Avatar src={entry.avatarUrl} name={entry.fullName} size={44} />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <Link
            href={profileHref}
            className="truncate text-subhead font-bold text-brand-900 hover:underline"
          >
            {entry.fullName}
          </Link>
          <FounderBadge size="xs" />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-footnote text-slate-500">
          {entry.username && <span className="truncate">@{entry.username}</span>}
          <span className="inline-flex items-center gap-1">
            <Rocket className="h-3 w-3" /> {entry.startupCount} startap
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <Users className="h-3 w-3" /> {entry.followerCount.toLocaleString('uz')} obunachi
          </span>
        </div>
      </div>

      <FounderVoteButton
        key={`${entry.id}:${entry.votedByMe}:${entry.founderVoteCount}`}
        userId={entry.id}
        initialVoted={entry.votedByMe}
        initialCount={entry.founderVoteCount}
        size="sm"
      />
    </div>
  );
}

function FounderRowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-ios-2xl bg-white p-4">
      <div className="h-9 w-9 rounded-ios-md bg-slate-100" />
      <div className="h-11 w-11 rounded-full bg-slate-100" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-40 rounded bg-slate-100" />
        <div className="h-3 w-56 rounded bg-slate-100" />
      </div>
      <div className="h-8 w-28 rounded-full bg-slate-100" />
    </div>
  );
}

/** Asoschilar liderbordi — ovozlar bo'yicha reyting (sahifalangan). */
export function FoundersBoard() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['founders-leaderboard', page],
    queryFn: () => usersApi.foundersLeaderboard({ page, limit: LIMIT }),
    placeholderData: keepPreviousData,
  });

  const entries = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <FounderRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-ios-2xl bg-white py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-ios-lg bg-slate-100">
          <Rocket className="h-8 w-8 text-slate-400" />
        </div>
        <p className="font-semibold text-brand-900">Hozircha asoschilar yo&apos;q</p>
        <p className="mt-1 text-subhead text-slate-500">
          Birinchi startap joylagan foydalanuvchi shu yerda paydo bo&apos;ladi
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        {entries.map((e) => (
          <FounderRow key={e.id} entry={e} />
        ))}
      </div>
      <Pagination
        page={page}
        totalPages={data?.meta.totalPages ?? 1}
        onChange={setPage}
      />
    </div>
  );
}
