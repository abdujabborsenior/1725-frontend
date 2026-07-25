'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Rocket, Plus } from '@/components/icons';
import { startupsApi } from '@/lib/api';
import {
  PLATFORM_META,
  PLATFORM_ORDER,
  STARTUP_SORT_OPTIONS,
} from '@/lib/constants';
import type { CategoryCount, PaginatedResponse, PlatformType, Startup, StartupSort } from '@/types';
import { useDebounce } from '@/lib/use-debounce';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { SearchField } from '@/components/ui/search-field';
import { EmptyState, FilterChip, PageHeader } from '@/components/ui/page-header';
import { StartupCard, StartupCardSkeleton } from '@/components/startups/startup-card';
import { PlatformIcon } from '@/components/startups/platform';

/**
 * initialList — server component (page.tsx) SSR'da keltirgan 1-sahifa:
 * kartalar (LCP rasm) HTML'da darhol chiqadi. Filtr/sahifa o'zgarsa odatdagi
 * client fetch; shaxsiy flaglar (likedByMe) background refetch'da yangilanadi.
 */
export function StartupsClient({
  initialList,
  initialCategories,
}: {
  initialList: PaginatedResponse<Startup> | null;
  initialCategories: CategoryCount[] | null;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [platform, setPlatform] = useState<PlatformType | ''>('');
  const [sort, setSort] = useState<StartupSort>('featured');

  const debouncedSearch = useDebounce(search, 350);

  const { data: categories } = useQuery({
    queryKey: ['startup-categories'],
    queryFn: () => startupsApi.categories(),
    staleTime: 5 * 60_000,
    initialData: initialCategories ?? undefined,
  });

  const isDefaultView =
    page === 1 && !debouncedSearch && !category && !platform && sort === 'featured';

  const { data, isLoading } = useQuery({
    queryKey: ['startups', { page, search: debouncedSearch, category, platform, sort }],
    queryFn: () =>
      startupsApi.list({
        page,
        limit: 12,
        search: debouncedSearch || undefined,
        category: category || undefined,
        platform: platform || undefined,
        sort,
      }),
    placeholderData: keepPreviousData,
    // SSR ma'lumoti — darhol ko'rsatiladi; updatedAt=0 → stale → jimgina yangilanadi
    initialData: isDefaultView ? (initialList ?? undefined) : undefined,
    initialDataUpdatedAt: 0,
  });

  const items = data?.data ?? [];
  const hasFilters = !!(search || category || platform);

  function resetFilters() {
    setSearch('');
    setCategory('');
    setPlatform('');
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Startaplar"
        subtitle="Hamjamiyat ishlab chiqqan ilovalar, saytlar va Telegram botlar — bir joyda."
        action={
          /* Joylash CTA — guest bosganda register orqali aynan shu yerga qaytadi */
          <Link
            href="/startups/create"
            className="tappable flex h-10 items-center gap-1 rounded-full bg-accent-600 pl-3.5 pr-4 text-subhead font-semibold text-white active:bg-accent-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.6} /> Joylash
          </Link>
        }
      />

      {/* Qidiruv + saralash */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchField
          value={search}
          onValueChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Startap nomi yoki tavsifi"
          containerClassName="flex-1"
        />
        <div className="md:w-56">
          <Select
            aria-label="Saralash"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as StartupSort);
              setPage(1);
            }}
            options={STARTUP_SORT_OPTIONS}
            className="h-10 text-subhead"
          />
        </div>
      </div>

      {/* Platforma filtri — iOS chiplari (mobilda suriladi) */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <FilterChip
          active={platform === ''}
          onClick={() => {
            setPlatform('');
            setPage(1);
          }}
        >
          Barchasi
        </FilterChip>
        {PLATFORM_ORDER.map((t) => (
          <FilterChip
            key={t}
            active={platform === t}
            onClick={() => {
              setPlatform(platform === t ? '' : t);
              setPage(1);
            }}
          >
            <PlatformIcon type={t} className="h-3.5 w-3.5" />
            {PLATFORM_META[t].label}
          </FilterChip>
        ))}
      </div>

      {/* Kategoriya chiplari */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <FilterChip
              key={c.category}
              active={category === c.category}
              onClick={() => {
                setCategory(category === c.category ? '' : c.category);
                setPage(1);
              }}
              className="text-footnote"
            >
              {c.category}
              <span className={cn('tabular-nums', category === c.category ? 'text-white/80' : 'text-slate-400')}>
                {c.count}
              </span>
            </FilterChip>
          ))}
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="tappable px-2 text-footnote font-medium text-accent-700"
            >
              Tozalash
            </button>
          )}
        </div>
      )}

      {/* Soni */}
      <p className="text-footnote text-slate-500">
        Jami <span className="font-medium text-brand-900">{data?.meta.total ?? '—'}</span> ta startap
      </p>

      {/* Grid */}
      <h2 className="sr-only">Startaplar ro&apos;yxati</h2>
      <div className="grid-rise grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <StartupCardSkeleton key={i} />)
        ) : items.length === 0 ? (
          <EmptyState
            className="col-span-full"
            icon={<Rocket />}
            title="Startaplar topilmadi"
            description={
              hasFilters
                ? "Filtrlarni o'zgartirib ko'ring"
                : "Hozircha e'lon qilingan startaplar yo'q"
            }
          />
        ) : (
          items.map((s, i) => <StartupCard key={s.id} startup={s} priority={i < 2} />)
        )}
      </div>

      {!isLoading && items.length > 0 && (
        <Pagination
          page={page}
          totalPages={data?.meta.totalPages ?? 1}
          onChange={setPage}
        />
      )}
    </div>
  );
}
