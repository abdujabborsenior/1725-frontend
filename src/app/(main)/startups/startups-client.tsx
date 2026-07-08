'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Search, Rocket, SlidersHorizontal, X, Plus } from 'lucide-react';
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
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-brand p-6 md:p-8">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 mb-3">
              <Rocket className="h-3.5 w-3.5 text-accent-400" />
              <span className="text-xs font-semibold text-white/90">Startaplar katalogi</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Yaratilgan mahsulotlar
            </h1>
            <p className="mt-1.5 text-sm text-slate-300 max-w-lg">
              Hamjamiyat tomonidan ishlab chiqilgan startaplar — ilovalar, saytlar
              va Telegram botlar bir joyda.
            </p>
          </div>
          {/* Joylash CTA — guest bosganда register orqali aynan shu yerga qaytadi */}
          <Link
            href="/startups/create"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-accent-700 text-sm font-semibold text-white shadow-glow-accent hover:bg-accent-800 transition-all btn-lift shrink-0 self-start md:self-auto"
          >
            <Plus className="h-4 w-4" /> Startap joylash
          </Link>
        </div>
      </div>

      {/* Search + sort */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Startap nomi yoki tavsifi bo'yicha qidirish..."
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus transition-all"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            aria-label="Saralash"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as StartupSort);
              setPage(1);
            }}
            className="h-12 pl-10 pr-9 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-sm font-medium text-brand-900 appearance-none cursor-pointer focus:outline-none input-focus transition-all"
          >
            {STARTUP_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Platform filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setPlatform('');
            setPage(1);
          }}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all',
            platform === ''
              ? 'bg-brand-900 text-white border-brand-900'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
          )}
        >
          Barcha platformalar
        </button>
        {PLATFORM_ORDER.map((t) => (
          <button
            key={t}
            onClick={() => {
              setPlatform(platform === t ? '' : t);
              setPage(1);
            }}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all',
              platform === t
                ? 'bg-brand-900 text-white border-brand-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
            )}
          >
            <PlatformIcon type={t} className="h-3.5 w-3.5" />
            {PLATFORM_META[t].label}
          </button>
        ))}
      </div>

      {/* Category chips */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c.category}
              onClick={() => {
                setCategory(category === c.category ? '' : c.category);
                setPage(1);
              }}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                category === c.category
                  ? 'bg-accent-700 text-white border-accent-700'
                  : 'bg-surface-soft text-slate-600 border-slate-200 hover:border-accent-300',
              )}
            >
              {c.category}
              <span className={cn('ml-1.5', category === c.category ? 'text-white/90' : 'text-slate-600')}>{c.count}</span>
            </button>
          ))}
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-rose-600 hover:bg-rose-50 transition-all"
            >
              <X className="h-3 w-3" /> Tozalash
            </button>
          )}
        </div>
      )}

      {/* Count */}
      <p className="text-sm text-slate-500">
        Jami{' '}
        <span className="font-semibold text-brand-900">{data?.meta.total ?? '—'}</span> ta
        startap
      </p>

      {/* Grid */}
      <h2 className="sr-only">Startaplar ro&apos;yxati</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <StartupCardSkeleton key={i} />)
        ) : items.length === 0 ? (
          <div className="col-span-full py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Rocket className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-brand-900 font-semibold">Startaplar topilmadi</p>
            <p className="text-sm text-slate-500 mt-1">
              {hasFilters
                ? 'Filtrlarni o\'zgartirib ko\'ring'
                : 'Hozircha e\'lon qilingan startaplar yo\'q'}
            </p>
          </div>
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
