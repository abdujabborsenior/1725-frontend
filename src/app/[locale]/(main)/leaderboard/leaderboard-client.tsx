'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Trophy, FlameFill } from '@/components/icons';
import { startupsApi } from '@/lib/api';
import { LEADERBOARD_PERIOD_OPTIONS } from '@/lib/constants';
import type { CategoryCount, LeaderboardPeriod, LeaderboardResponse } from '@/types';
import { cn } from '@/lib/utils';
import { useFormatNumber } from '@/lib/format';
import { useCategoryLabel } from '@/lib/category-labels';
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
import { useSsrSeed } from '@/lib/ssr-seed';

const LIMIT = 20;

type BoardTab = 'startups' | 'founders';

export function LeaderboardClient({
  initialBoard,
  initialCategories,
}: {
  initialBoard: LeaderboardResponse | null;
  initialCategories: CategoryCount[] | null;
}) {
  const t = useTranslations('leaderboard');
  const fmt = useFormatNumber();
  const catLabel = useCategoryLabel();
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

  // SSR standart ko'rinish (period=all, 1-sahifa) — mehmon API'ga so'rov yubormaydi
  const seed = useSsrSeed(
    period === 'all' && !category && page === 1 ? initialBoard : undefined,
    { personal: true },
  );

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
    initialData: seed.initialData,
    initialDataUpdatedAt: seed.initialDataUpdatedAt,
    enabled: tab === 'startups' && (seed.enabled ?? true),
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
        eyebrow={t(`eyebrow.${tab}`)}
        title={t(`title.${tab}`)}
        subtitle={t(`subtitle.${tab}`)}
      />

      {/* Reyting turi + raqobat ko'rsatkichi — bitta qatorda, lekin tor
          ekranda ustma-ust (yopishib qolmaydi). */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          aria-label={t('tabsLabel')}
          fullWidth={false}
          value={tab}
          onChange={(v) => setTab(v)}
          options={[
            { value: 'startups', label: t('tabs.startups') },
            { value: 'founders', label: t('tabs.founders') },
          ]}
          className="w-full sm:w-72"
        />

        {tab === 'startups' && total > 0 && (
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 py-1.5 ps-2 pe-3.5 text-footnote font-medium text-amber-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/15">
              <FlameFill className="h-3.5 w-3.5 text-amber-600" />
            </span>
            <span>
              {t.rich('competing', {
                count: total,
                n: fmt(total),
                b: (chunks) => <b className="font-semibold tabular-nums">{chunks}</b>,
              })}
            </span>
          </span>
        )}
      </div>

      {tab === 'founders' ? (
        <FoundersBoard />
      ) : (
        <>
      {/* Davr filtri */}
      <div className="flex flex-wrap items-center gap-2">
        {LEADERBOARD_PERIOD_OPTIONS.map((p) => (
          <FilterChip key={p} active={period === p} onClick={() => selectPeriod(p)}>
            {t(`period.${p}`)}
          </FilterChip>
        ))}
        {isFetching && (
          <span className="text-caption-1 text-slate-500">{t('updating')}</span>
        )}
      </div>

      {/* Kategoriya chiplari */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip active={category === ''} onClick={() => selectCategory('')} className="text-footnote">
            {t('allCategories')}
          </FilterChip>
          {categories.map((c) => (
            <FilterChip
              key={c.category}
              active={category === c.category}
              onClick={() => selectCategory(c.category)}
              className="text-footnote"
            >
              {catLabel(c.category)}
              <span className={cn('tabular-nums', category === c.category ? 'text-white/80' : 'text-slate-600')}>
                <span translate="no">{fmt(c.count)}</span>
              </span>
            </FilterChip>
          ))}
        </div>
      )}

      <h2 className="sr-only">{t('listHeading')}</h2>

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
          title={t('empty.title')}
          description={t('empty.description')}
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
