'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Compass, Sprout } from '@/components/icons';
import { marketApi } from '@/lib/api';
import { useFormatNumber } from '@/lib/format';
import { EmptyState, PageHeader } from '@/components/ui/page-header';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ClusterCard } from '@/components/market/cluster-card';
import type { MarketCluster } from '@/types';

/**
 * **Bozor xaritasi** — ommaviy sahifa (mehmonlar uchun ham ochiq).
 *
 * Bu sahifa platformaning eng kuchli dalili: odamlar nimani so'rayapti va
 * qaysi yo'nalishda hali yechim yo'q. Ro'yxatdan o'tishga eng tabiiy sabab
 * aynan shu yerda tug'iladi, shuning uchun u login ortiga yashirilmagan.
 */
export function MarketClient({
  initialClusters,
}: {
  initialClusters: MarketCluster[] | null;
}) {
  const t = useTranslations('market');
  const { data, isLoading } = useQuery({
    queryKey: ['market-clusters'],
    queryFn: () => marketApi.clusters(24),
    initialData: initialClusters ?? undefined,
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60_000,
  });

  const clusters = data ?? [];
  const unmet = clusters.filter((c) => c.coverageCount === 0).length;
  const signals = clusters.reduce((sum, c) => sum + c.size, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        subtitle={t('subtitle')}
      />

      {clusters.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat
            label={t('metrics.areas', { count: clusters.length })}
            value={clusters.length}
          />
          <Stat label={t('metrics.signals', { count: signals })} value={signals} />
          <Stat label={t('metrics.unsolved')} value={unmet} accent />
        </div>
      )}

      {isLoading && clusters.length === 0 && (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {!isLoading && clusters.length === 0 && (
        <EmptyState
          icon={<Compass />}
          title={t('empty.title')}
          description={t('empty.text')}
          action={
            <Link
              href="/ai"
              className="tappable inline-flex h-10 items-center rounded-ios-md bg-accent-600 px-4 text-subhead font-semibold text-white"
            >
              {t('empty.askAi')}
            </Link>
          }
        />
      )}

      {clusters.length > 0 && (
        <div className="space-y-3">
          {clusters.map((c) => (
            <ClusterCard key={c.id} cluster={c} />
          ))}
        </div>
      )}

      {clusters.length > 0 && (
        <section className="rounded-ios-lg bg-white p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ios-sm bg-accent-50">
              <Sprout className="h-[18px] w-[18px] text-accent-600" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body font-medium text-brand-900">
                {t('backlog.title')}
              </p>
              <p className="mt-0.5 text-footnote text-slate-500">
                {t('backlog.text')}
              </p>
              <Link
                href="/startups/create"
                className="tappable mt-2.5 inline-flex h-10 items-center rounded-ios-md bg-accent-600 px-4 text-subhead font-semibold text-white"
              >
                {t('backlog.cta')}
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  const fmt = useFormatNumber();
  return (
    <div className="rounded-ios-md bg-white px-4 py-3">
      <p
        className={
          accent
            ? 'text-title-2 font-semibold tabular-nums text-accent-700'
            : 'text-title-2 font-semibold tabular-nums text-brand-900'
        }
      >
        {fmt(value)}
      </p>
      <p className="mt-0.5 text-caption-1 text-slate-500">{label}</p>
    </div>
  );
}
