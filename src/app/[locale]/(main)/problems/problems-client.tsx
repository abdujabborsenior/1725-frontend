'use client';

import { Link } from '@/i18n/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Plus, FileText } from '@/components/icons';
import { problemsApi } from '@/lib/api';
import type { PaginatedResponse, Problem } from '@/types';
import { Pagination } from '@/components/ui/pagination';
import { SearchField } from '@/components/ui/search-field';
import { EmptyState, PageHeader } from '@/components/ui/page-header';
import { ProblemCard, ProblemCardSkeleton } from '@/components/problems/problem-card';
import { useDebounce } from '@/lib/use-debounce';
import { useFormatNumber } from '@/lib/format';

export function ProblemsClient({ initialList }: { initialList: PaginatedResponse<Problem> | null }) {
  const t = useTranslations('problemsPage');
  const fmt = useFormatNumber();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const isDefaultView = page === 1 && !debouncedSearch;

  const { data, isLoading } = useQuery({
    queryKey: ['problems', { page, search: debouncedSearch }],
    queryFn: () =>
      problemsApi.list({
        page,
        limit: 9,
        search: debouncedSearch || undefined,
      }),
    // SSR ma'lumoti — darhol ko'rsatiladi; updatedAt=0 → stale → jimgina yangilanadi
    initialData: isDefaultView ? (initialList ?? undefined) : undefined,
    initialDataUpdatedAt: 0,
  });

  const items = data?.data ?? [];
  const total = data?.meta.total;

  return (
    <div className="space-y-7">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle', { count: total ?? 0, n: total != null ? fmt(total) : '—' })}
        action={
          /* Guest ham ko'radi — bosganda register orqali aynan shu yerga qaytadi */
          <Link
            href="/problems/create"
            className="tappable flex h-10 items-center gap-1 rounded-full bg-accent-600 pl-3.5 pr-4 text-subhead font-semibold text-white active:bg-accent-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.6} /> {t('add')}
          </Link>
        }
      />

      {/* Qidiruv (holat filtri ataylab yo'q — 2026-07-24 direktivasi) */}
      <SearchField
        value={search}
        onValueChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder={t('searchPlaceholder')}
        containerClassName="sm:max-w-md"
      />

      {/* ── Grid ─────────────────────────────────────────── */}
      <h2 className="sr-only">{t('listHeading')}</h2>
      <div className="grid-rise grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => <ProblemCardSkeleton key={i} />)
          : items.length === 0
            ? (
              <EmptyState
                className="col-span-full"
                icon={<FileText />}
                title={t('emptyTitle')}
                description={t('emptyDescription')}
              />
            )
            : items.map((p) => <ProblemCard key={p.id} problem={p} />)}
      </div>

      {!isLoading && items.length > 0 && (
        <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} />
      )}
    </div>
  );
}
