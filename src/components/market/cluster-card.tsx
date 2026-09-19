'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Sprout } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useFormatNumber } from '@/lib/format';
import type { MarketCluster } from '@/types';

/**
 * Bozor yo'nalishi kartasi.
 *
 * Asosiy raqam — **imkoniyat bali** (talab yuqori, qoplash past). Aynan
 * shu ko'rsatkich ro'yxatni "statistika" dan "startap g'oyalari backlog'i"
 * ga aylantiradi, shuning uchun u eng ko'zga tashlanadigan joyda turadi.
 */
export function ClusterCard({ cluster }: { cluster: MarketCluster }) {
  const t = useTranslations('clusterCard');
  const fmt = useFormatNumber();
  const tone = opportunityTone(cluster.opportunityScore);

  return (
    <Link
      href={`/market/${cluster.slug}`}
      className="card-today group block overflow-hidden rounded-ios-lg bg-white p-4"
    >
      <div className="flex items-start gap-3.5">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-ios-md',
            tone.bg,
          )}
        >
          <Sprout className={cn('h-5 w-5', tone.icon)} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="card-title min-w-0 text-title-3 font-semibold text-brand-900">
              {cluster.label}
            </h3>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-accent-600" />
          </div>

          {cluster.summary && (
            <p className="mt-1 line-clamp-2 text-subhead text-slate-600">
              {cluster.summary}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <Metric
              label={t('opportunity')}
              value={cluster.opportunityScore}
              tone={tone.text}
              emphasis
            />
            <Metric label={t('demand')} value={cluster.demandScore} />
            <span className="text-caption-1 text-slate-500">
              {t('requests', { count: cluster.size, n: fmt(cluster.size) })}
            </span>
            <span className="text-caption-1 text-slate-500">
              {cluster.coverageCount === 0
                ? t('noSolution')
                : t('projects', { count: cluster.coverageCount, n: fmt(cluster.coverageCount) })}
            </span>
          </div>

          {cluster.keywords.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {cluster.keywords.slice(0, 4).map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-fill-tertiary px-2.5 py-0.5 text-caption-1 text-slate-600"
                >
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function Metric({
  label,
  value,
  tone,
  emphasis,
}: {
  label: string;
  value: number;
  tone?: string;
  emphasis?: boolean;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-caption-1 text-slate-500">{label}</span>
      <span
        className={cn(
          'tabular-nums',
          emphasis ? 'text-subhead font-semibold' : 'text-caption-1 font-medium',
          tone ?? 'text-brand-900',
        )}
      >
        {value}
      </span>
    </span>
  );
}

export type OpportunityLevel = 'high' | 'medium' | 'saturated';

/**
 * Imkoniyat bali darajasi — butun bo'lim bo'ylab izchil ranglar.
 * Yorliq lug'atda: `clusterCard.level.<level>`.
 */
export function opportunityTone(score: number): {
  bg: string;
  icon: string;
  text: string;
  level: OpportunityLevel;
} {
  if (score >= 60) {
    return {
      bg: 'bg-accent-50',
      icon: 'text-accent-600',
      text: 'text-accent-700',
      level: 'high',
    };
  }
  if (score >= 35) {
    return {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      text: 'text-amber-700',
      level: 'medium',
    };
  }
  return {
    bg: 'bg-fill-tertiary',
    icon: 'text-slate-500',
    text: 'text-slate-600',
    level: 'saturated',
  };
}
