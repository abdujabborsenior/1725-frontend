'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Trophy, Flame, Rocket, UserRound } from 'lucide-react';
import { startupsApi } from '@/lib/api';
import { LEADERBOARD_PERIOD_OPTIONS } from '@/lib/constants';
import type { LeaderboardPeriod } from '@/types';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { LeaderboardPodium } from '@/components/startups/leaderboard-podium';
import {
  LeaderboardRow,
  LeaderboardRowSkeleton,
} from '@/components/startups/leaderboard-row';
import { FormulaExplainer } from '@/components/startups/leaderboard-formula';
import { FoundersBoard } from '@/components/social/founders-board';

const LIMIT = 20;

type BoardTab = 'startups' | 'founders';

export default function LeaderboardPage() {
  const [tab, setTab] = useState<BoardTab>('startups');
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data: categories } = useQuery({
    queryKey: ['startup-categories'],
    queryFn: () => startupsApi.categories(),
    staleTime: 5 * 60_000,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['leaderboard', { period, category, page }],
    queryFn: () =>
      startupsApi.leaderboard({
        period,
        category: category || undefined,
        page,
        limit: LIMIT,
      }),
    placeholderData: keepPreviousData,
    enabled: tab === 'startups',
  });

  const entries = data?.data ?? [];
  const formula = data?.meta.formula;
  const total = data?.meta.total ?? 0;

  // 1-sahifada top-3 podiumда, qolgani qatorlarда. Keyingi sahifalarда — hammasi qator.
  const showPodium = page === 1 && category === '' && entries.length >= 3;
  const podium = showPodium ? entries.slice(0, 3) : [];
  const rows = showPodium ? entries.slice(3) : entries;

  function selectPeriod(p: LeaderboardPeriod) {
    setPeriod(p);
    setPage(1);
  }
  function selectCategory(c: string) {
    setCategory((cur) => (cur === c ? '' : c));
    setPage(1);
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-brand p-6 md:p-8">
        {/* nozik mesh + bitta vazmin yorug'lik */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
              <Trophy className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-xs font-semibold tracking-wide text-white/90">
                {tab === 'startups' ? 'Startaplar reytingi' : 'Asoschilar reytingi'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-[2rem]">
              {tab === 'startups' ? 'Top Startaplar' : 'Top Asoschilar'}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-300">
              {tab === 'startups'
                ? 'Foydalanuvchilar baholari asosida, IMDB uslubidagi vaznli (Bayes) reyting bilan tartiblangan eng yaxshi startaplar.'
                : "Hamjamiyat ovozlari asosida tartiblangan startap asoschilari — o'z asoschingizga ovoz bering."}
            </p>
            {tab === 'startups' && total > 0 && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-amber-200/90">
                <Flame className="h-3.5 w-3.5" />
                {total} ta baholangan startap raqobatda
              </p>
            )}
          </div>
          {/* katta vazmin kubok belgisi (faqat desktop) */}
          <div className="hidden shrink-0 sm:block">
            <span className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
              <Trophy className="h-8 w-8 text-amber-300/90" />
            </span>
          </div>
        </div>
      </div>

      {/* Reyting turi: Startaplar / Asoschilar */}
      <div className="flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1">
        {(
          [
            { key: 'startups' as const, label: 'Startaplar', icon: Rocket },
            { key: 'founders' as const, label: 'Asoschilar', icon: UserRound },
          ]
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150',
              tab === key
                ? 'bg-brand-900 text-white'
                : 'text-slate-600 hover:bg-slate-50 hover:text-brand-900',
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'founders' ? (
        <FoundersBoard />
      ) : (
        <>
      {/* Davr filtri */}
      <div className="flex flex-wrap items-center gap-2">
        {LEADERBOARD_PERIOD_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => selectPeriod(o.value)}
            className={cn(
              'rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all',
              period === o.value
                ? 'border-brand-900 bg-brand-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
            )}
          >
            {o.label}
          </button>
        ))}
        {isFetching && (
          <span className="text-xs text-slate-400">yangilanmoqda…</span>
        )}
      </div>

      {/* Kategoriya chiplari */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => selectCategory('')}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-all',
              category === ''
                ? 'border-accent-500 bg-accent-500 text-white'
                : 'border-slate-200 bg-surface-soft text-slate-600 hover:border-accent-300',
            )}
          >
            Hammasi
          </button>
          {categories.map((c) => (
            <button
              key={c.category}
              onClick={() => selectCategory(c.category)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                category === c.category
                  ? 'border-accent-500 bg-accent-500 text-white'
                  : 'border-slate-200 bg-surface-soft text-slate-600 hover:border-accent-300',
              )}
            >
              {c.category}
              <span className="ml-1.5 opacity-60">{c.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Formula shaffofligi */}
      {formula && <FormulaExplainer formula={formula} />}

      {/* Kontent */}
      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <LeaderboardRowSkeleton key={i} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Trophy className="h-8 w-8 text-slate-400" />
          </div>
          <p className="font-semibold text-brand-900">Hozircha baho yo&apos;q</p>
          <p className="mt-1 text-sm text-slate-500">
            Bu davr/kategoriya bo&apos;yicha baholangan startaplar topilmadi.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {podium.length === 3 && <LeaderboardPodium top={podium} />}
          <div className="space-y-2.5">
            {rows.map((e) => (
              <LeaderboardRow key={e.id} entry={e} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={data?.meta.totalPages ?? 1}
            onChange={setPage}
          />
        </div>
      )}
        </>
      )}
    </div>
  );
}
