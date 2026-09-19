'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Compass, Lightbulb, Sprout } from '@/components/icons';
import { marketApi } from '@/lib/api';
import { useFormatNumber } from '@/lib/format';
import { EmptyState, PageHeader } from '@/components/ui/page-header';
import { CardSkeleton } from '@/components/ui/skeleton';
import { StartupCard } from '@/components/startups/startup-card';
import { opportunityTone } from '@/components/market/cluster-card';
import { cn } from '@/lib/utils';
import type { MarketClusterDetail, Startup } from '@/types';

/** Bitta bozor yo'nalishi: talab, qoplash va shu yerdagi loyihalar. */
export function ClusterClient({
  slug,
  initial,
}: {
  slug: string;
  initial: MarketClusterDetail | null;
}) {
  const t = useTranslations('market');
  const tc = useTranslations('clusterCard');
  const fmt = useFormatNumber();
  const { data, isLoading, error } = useQuery({
    queryKey: ['market-cluster', slug],
    queryFn: () => marketApi.cluster(slug),
    initialData: initial ?? undefined,
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60_000,
  });

  if (isLoading && !data) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<Compass />}
          title={t('cluster.notFoundTitle')}
          description={t('cluster.notFoundText')}
          action={
            <Link
              href="/market"
              className="tappable inline-flex h-10 items-center rounded-ios-md bg-accent-600 px-4 text-subhead font-semibold text-white"
            >
              {t('cluster.backToMap')}
            </Link>
          }
        />
      </div>
    );
  }

  const tone = opportunityTone(data.opportunityScore);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/market"
        className="tappable -ml-1 flex items-center gap-0.5 text-body text-accent-700"
      >
        <ChevronLeft className="h-[19px] w-[19px]" strokeWidth={3} />
        {t('cluster.backToMap')}
      </Link>

      <PageHeader title={data.label} subtitle={data.summary ?? undefined} />

      {/* O'lchovlar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label={t('metrics.opportunity')} value={data.opportunityScore} tone={tone.text} />
        <Metric label={t('metrics.demand')} value={data.demandScore} />
        <Metric label={t('metrics.signals', { count: data.size })} value={data.size} />
        <Metric
          label={t('metrics.projects', { count: data.coverageCount })}
          value={data.coverageCount}
        />
      </div>

      <div className={cn('rounded-ios-lg p-4', tone.bg)}>
        <div className="flex items-start gap-3">
          <Sprout className={cn('mt-0.5 h-5 w-5 shrink-0', tone.icon)} />
          <p className="text-subhead text-slate-700">
            <span className={cn('font-semibold', tone.text)}>{tc(`level.${tone.level}`)}.</span>{' '}
            {data.coverageCount === 0
              ? t('cluster.noCoverage')
              : t('cluster.coverage', {
                  count: data.coverageCount,
                  n: fmt(data.coverageCount),
                  pct: String(Math.round(data.unmetRatio * 100)),
                })}
          </p>
        </div>
      </div>

      {/* Namuna so'rovlar */}
      {data.samples.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-title-3 font-semibold text-brand-900">
            {t('cluster.samplesTitle')}
          </h2>
          <ul className="overflow-hidden rounded-ios-lg bg-white">
            {data.samples.map((sample, i) => (
              <li
                key={i}
                className={cn(
                  'flex items-start gap-3 px-4 py-3.5',
                  i > 0 && 'hairline-t',
                )}
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span className="text-subhead text-slate-700">{sample}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Shu yo'nalishdagi loyihalar */}
      <section className="space-y-3">
        <h2 className="text-title-3 font-semibold text-brand-900">
          {t('cluster.projectsTitle')}
        </h2>
        {data.startups.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.startups.map((s) => (
              <StartupCard key={s.id} startup={s as Startup} />
            ))}
          </div>
        ) : (
          <div className="rounded-ios-lg bg-white p-4">
            <p className="text-subhead text-slate-600">
              {t('cluster.noProjects')}
            </p>
            <Link
              href="/startups/create"
              className="tappable mt-3 inline-flex h-10 items-center rounded-ios-md bg-accent-600 px-4 text-subhead font-semibold text-white"
            >
              {t('cluster.firstProject')}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  const fmt = useFormatNumber();
  return (
    <div className="rounded-ios-md bg-white px-4 py-3">
      <p
        className={cn(
          'text-title-2 font-semibold tabular-nums',
          tone ?? 'text-brand-900',
        )}
      >
        {fmt(value)}
      </p>
      <p className="mt-0.5 text-caption-1 text-slate-500">{label}</p>
    </div>
  );
}
