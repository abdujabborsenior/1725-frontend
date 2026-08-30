'use client';

import Link from 'next/link';
import { ArrowUpRight, Sprout } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { MarketCluster } from '@/types';

/**
 * Bozor yo'nalishi kartasi.
 *
 * Asosiy raqam — **imkoniyat bali** (talab yuqori, qoplash past). Aynan
 * shu ko'rsatkich ro'yxatni "statistika" dan "startap g'oyalari backlog'i"
 * ga aylantiradi, shuning uchun u eng ko'zga tashlanadigan joyda turadi.
 */
export function ClusterCard({ cluster }: { cluster: MarketCluster }) {
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
              label="Imkoniyat"
              value={cluster.opportunityScore}
              tone={tone.text}
              emphasis
            />
            <Metric label="Talab" value={cluster.demandScore} />
            <span className="text-caption-1 text-slate-500">
              {cluster.size} ta so&apos;rov
            </span>
            <span className="text-caption-1 text-slate-500">
              {cluster.coverageCount === 0
                ? 'Yechim yo‘q'
                : `${cluster.coverageCount} ta loyiha`}
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

/** Imkoniyat bali darajasi — butun bo'lim bo'ylab izchil ranglar. */
export function opportunityTone(score: number): {
  bg: string;
  icon: string;
  text: string;
  label: string;
} {
  if (score >= 60) {
    return {
      bg: 'bg-accent-50',
      icon: 'text-accent-600',
      text: 'text-accent-700',
      label: 'Katta imkoniyat',
    };
  }
  if (score >= 35) {
    return {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      text: 'text-amber-700',
      label: 'O‘rtacha imkoniyat',
    };
  }
  return {
    bg: 'bg-fill-tertiary',
    icon: 'text-slate-500',
    text: 'text-slate-600',
    label: 'Bozor to‘yingan',
  };
}
