'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Trophy, Flame } from '@/components/icons';
import { startupsApi } from '@/lib/api';
import { LEADERBOARD_PERIOD_OPTIONS } from '@/lib/constants';
import type { CategoryCount, LeaderboardPeriod, LeaderboardResponse } from '@/types';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { LeaderboardPodium } from '@/components/startups/leaderboard-podium';
import {
  LeaderboardRow,
  LeaderboardRowSkeleton,
} from '@/components/startups/leaderboard-row';
import { FormulaExplainer } from '@/components/startups/leaderboard-formula';
import { FoundersBoard } from '@/components/social/founders-board';
import { Segmented } from '@/components/ui/segmented';
import { EmptyState, FilterChip, PageHeader } from '@/components/ui/page-header';

const LIMIT = 20;

type BoardTab = 'startups' | 'founders';

export function LeaderboardClient({
  initialBoard,
  initialCategories,
}: {
  initialBoard: LeaderboardResponse | null;
  initialCategories: CategoryCount[] | null;
}) {
  const [tab, setTab] = useState<BoardTab>('startups');
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data: categories } = useQuery({
    queryKey: ['startup-categories'],
    queryFn: () => startupsApi.categories(),
    staleTime: 5 * 60_000,
    initialData: initialCategories ?? undefined,
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
    // SSR standart ko'rinish (period=all, 1-sahifa) — CLS/LCP uchun
    initialData:
      period === 'all' && !category && page === 1 ? (initialBoard ?? undefined) : undefined,
    initialDataUpdatedAt: 0,
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
    <div className="space-y-6">
      <PageHeader
        eyebrow={tab === 'startups' ? 'Startaplar reytingi' : 'Asoschilar reytingi'}
        title={tab === 'startups' ? 'Top startaplar' : 'Top asoschilar'}
        subtitle={
          tab === 'startups'
            ? 'Foydalanuvchilar baholari asosida, IMDB uslubidagi vaznli (Bayes) reyting bilan tartiblangan eng yaxshi startaplar.'
            : "Hamjamiyat ovozlari asosida tartiblangan startap asoschilari — o'z asoschingizga ovoz bering."
        }
      />

      {tab === 'startups' && total > 0 && (
        <p className="inline-flex items-center gap-1.5 text-footnote text-slate-500">
          <Flame className="h-3.5 w-3.5 text-amber-500" />
          {total} ta baholangan startap raqobatda
        </p>
      )}

      {/* Reyting turi — iOS segmented control */}
      <Segmented
        aria-label="Reyting turi"
        fullWidth={false}
        value={tab}
        onChange={(v) => setTab(v)}
        options={[
          { value: 'startups', label: 'Startaplar' },
          { value: 'founders', label: 'Asoschilar' },
        ]}
        className="w-full sm:w-72"
      />

      {tab === 'founders' ? (
        <FoundersBoard />
      ) : (
        <>
      {/* Davr filtri */}
      <div className="flex flex-wrap items-center gap-2">
        {LEADERBOARD_PERIOD_OPTIONS.map((o) => (
          <FilterChip key={o.value} active={period === o.value} onClick={() => selectPeriod(o.value)}>
            {o.label}
          </FilterChip>
        ))}
        {isFetching && (
          <span className="text-xs text-slate-500">yangilanmoqda…</span>
        )}
      </div>

      {/* Kategoriya chiplari */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip active={category === ''} onClick={() => selectCategory('')} className="text-footnote">
            Hammasi
          </FilterChip>
          {categories.map((c) => (
            <FilterChip
              key={c.category}
              active={category === c.category}
              onClick={() => selectCategory(c.category)}
              className="text-footnote"
            >
              {c.category}
              <span className={cn('tabular-nums', category === c.category ? 'text-white/80' : 'text-slate-400')}>
                {c.count}
              </span>
            </FilterChip>
          ))}
        </div>
      )}

      <h2 className="sr-only">Reyting ro&apos;yxati</h2>

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
        <EmptyState
          icon={<Trophy />}
          title="Hozircha baho yo'q"
          description="Bu davr/kategoriya bo'yicha baholangan startaplar topilmadi."
        />
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
