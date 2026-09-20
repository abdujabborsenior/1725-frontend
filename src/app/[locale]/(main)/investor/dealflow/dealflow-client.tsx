'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Compass } from '@/components/icons';
import { investorsApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { PageHeader, EmptyState, FilterChip } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { CardSkeleton } from '@/components/ui/skeleton';
import { MatchCard } from '@/components/investor/match-card';
import type { AxiosError } from 'axios';

/** Lentaga kirish uchun tasdiq shart — 403 tinch tushuntiriladi. */
function isForbidden(err: unknown): boolean {
  return (err as AxiosError)?.response?.status === 403;
}

/** Investor lentasi — kriteriyaga mos loyihalar (server `page.tsx` Suspense ichida render qiladi). */
export function DealflowClient() {
  const t = useTranslations('dealflow');
  const router = useRouter();
  const params = useSearchParams();
  const { token, hasHydrated } = useAuthStore();

  const [page, setPage] = useState(1);
  const [onlyNew, setOnlyNew] = useState(false);
  const [saved, setSaved] = useState(params.get('saved') === '1');

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace(`/login?next=${encodeURIComponent('/investor/dealflow')}`);
    }
  }, [hasHydrated, token, router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dealflow', page, onlyNew, saved],
    queryFn: () =>
      investorsApi.dealflow({ page, limit: 12, onlyNew, saved }),
    enabled: !!token,
  });

  if (hasHydrated && !token) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/investor"
        className="tappable -ms-1 flex items-center gap-0.5 text-body text-accent-700"
      >
        <ChevronLeft className="h-[19px] w-[19px]" strokeWidth={3} />
        {t('back')}
      </Link>

      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={!onlyNew && !saved}
          onClick={() => {
            setOnlyNew(false);
            setSaved(false);
            setPage(1);
          }}
        >
          {t('filters.all')}
        </FilterChip>
        <FilterChip
          active={onlyNew}
          onClick={() => {
            setOnlyNew(true);
            setSaved(false);
            setPage(1);
          }}
        >
          {t('filters.new')}
        </FilterChip>
        <FilterChip
          active={saved}
          onClick={() => {
            setSaved(true);
            setOnlyNew(false);
            setPage(1);
          }}
        >
          {t('filters.saved')}
        </FilterChip>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {error && (
        <EmptyState
          icon={<Compass />}
          title={isForbidden(error) ? t('error.forbiddenTitle') : t('error.title')}
          description={getErrorMessage(error)}
          action={
            isForbidden(error) ? (
              <Link
                href="/investor"
                className="tappable inline-flex h-10 items-center rounded-ios-md bg-accent-600 px-4 text-subhead font-semibold text-white"
              >
                {t('error.toCabinet')}
              </Link>
            ) : undefined
          }
        />
      )}

      {!isLoading && !error && (data?.data.length ?? 0) === 0 && (
        <EmptyState
          icon={<Compass />}
          title={
            saved
              ? t('empty.savedTitle')
              : onlyNew
                ? t('empty.newTitle')
                : t('empty.noneTitle')
          }
          description={saved ? t('empty.savedText') : t('empty.noneText')}
        />
      )}

      {!isLoading && !error && (data?.data.length ?? 0) > 0 && (
        <>
          <div className="space-y-4">
            {data!.data.map((item) => (
              <MatchCard key={item.startup.id} item={item} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={data!.meta.totalPages}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
