'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  CheckCircleFill,
  Info,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Warning,
} from '@/components/icons';
import { assessmentApi, founderApi, getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { GRADE_TONE } from '@/lib/venture';
import { useFormatNumber } from '@/lib/format';
import type { AssessmentFinding } from '@/types';

/**
 * **Loyiha tayyorligi** — faqat EGASIGA ko'rinadigan panel.
 *
 * Ommaviy emas: panel zaif tomonlarni ochiq aytadi va u asoschining ichki
 * ish quroli. Investor uning yengil shaklini (ball + daraja) o'z lentasida
 * ko'radi.
 *
 * Ball va tekshiruvlar — DETERMINSTIK (server rubrikasi), AI esa faqat
 * matnli tahlil yozadi va talab bo'yicha ishga tushadi.
 */
export function ReadinessPanel({ startupId }: { startupId: string }) {
  const t = useTranslations('readiness');
  const tv = useTranslations('venture');
  const fmt = useFormatNumber();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['assessment', startupId],
    queryFn: () => assessmentApi.get(startupId),
    staleTime: 60_000,
  });

  const { data: interest } = useQuery({
    queryKey: ['startup-interest', startupId],
    queryFn: () => founderApi.startupInterest(startupId),
    staleTime: 60_000,
  });

  const { mutate: refresh, isPending: refreshing } = useMutation({
    mutationFn: () => assessmentApi.refresh(startupId),
    onSuccess: (res) => {
      qc.setQueryData(['assessment', startupId], res);
      toast.success(t('refreshed'));
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const { mutate: runAi, isPending: aiPending } = useMutation({
    mutationFn: () => assessmentApi.generateAi(startupId),
    onSuccess: (res) => {
      qc.setQueryData(['assessment', startupId], res);
      toast.success(t('aiReady'));
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading || !data) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-title-3 font-semibold text-brand-900">
          {t('title')}
        </h2>
        <button
          type="button"
          onClick={() => refresh()}
          disabled={refreshing}
          className="tappable inline-flex items-center gap-1.5 text-footnote text-accent-700 disabled:opacity-50"
        >
          <RefreshCw
            className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')}
          />
          {t('refresh')}
        </button>
      </div>

      {/* Ball + daraja */}
      <div className="rounded-ios-lg bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <svg width={64} height={64} className="-rotate-90">
              <circle cx={32} cy={32} r={29} fill="none" strokeWidth={5} className="stroke-slate-200" />
              <circle
                cx={32}
                cy={32}
                r={29}
                fill="none"
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={`${(data.readinessScore / 100) * 2 * Math.PI * 29} ${2 * Math.PI * 29}`}
                className={cn(
                  'transition-[stroke-dasharray] duration-500 ease-ios',
                  data.readinessScore >= 60 ? 'stroke-accent-500' : 'stroke-amber-500',
                )}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-title-3 font-semibold tabular-nums text-brand-900">
              {data.readinessScore}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn('text-body font-semibold', GRADE_TONE[data.grade])}>
              {tv(`grade.${data.grade}`)}
            </p>
            <p className="mt-0.5 text-footnote text-slate-500">
              {t('scoreNote')}
            </p>
          </div>
        </div>

        {/* O'lchovlar */}
        <ul className="mt-4 space-y-3">
          {data.dimensions.map((d) => (
            <li key={d.key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-subhead text-brand-900">
                  {tv(`dimension.${d.key}`)}
                </span>
                <span className="text-caption-1 tabular-nums text-slate-500" translate="no">
                  {d.score}/100
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={cn(
                    'h-full rounded-full transition-[width] duration-500 ease-ios',
                    d.score >= 70
                      ? 'bg-accent-500'
                      : d.score >= 40
                        ? 'bg-amber-500'
                        : 'bg-slate-400',
                  )}
                  style={{ width: `${d.score}%` }}
                />
              </div>
              {d.score < 50 && (
                <p className="mt-1 text-caption-1 text-slate-500">
                  {tv(`dimensionHint.${d.key}`)}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Qiziqish signali */}
      {interest && (
        <div className="rounded-ios-lg bg-white p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ios-sm bg-indigo-50">
              <TrendingUp className="h-[18px] w-[18px] text-indigo-600" />
            </span>
            <div className="min-w-0 flex-1">
              {interest.inDealflow ? (
                <>
                  <p className="text-body text-brand-900">
                    {t.rich('matched', {
                      count: interest.matchCount,
                      n: fmt(interest.matchCount),
                      b: (chunks) => <span className="font-semibold">{chunks}</span>,
                    })}
                  </p>
                  <p className="mt-0.5 text-footnote text-slate-500">
                    {t('matchedNote')}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-body text-brand-900">
                    {t('notInFeed')}
                  </p>
                  <p className="mt-0.5 text-footnote text-slate-500">
                    {t('notInFeedHint')}
                  </p>
                </>
              )}
              {interest.pendingIntros > 0 && (
                <Link
                  href="/profile/intro-requests"
                  className="tappable mt-2.5 inline-flex h-9 items-center rounded-ios-md bg-accent-600 px-3.5 text-footnote font-semibold text-white"
                >
                  {t('reply', { count: interest.pendingIntros, n: fmt(interest.pendingIntros) })}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bozor mosligi */}
      {data.market?.label && (
        <Link
          href={`/market/${data.market.slug}`}
          className="tappable block rounded-ios-lg bg-white p-4"
        >
          <p className="text-footnote text-slate-500">{t('market')}</p>
          <p className="mt-0.5 text-body font-medium text-brand-900">
            {data.market.label}
          </p>
          {data.market.demandScore !== null && (
            <p className="mt-0.5 text-footnote text-slate-500">
              {t('demand', { score: String(data.market.demandScore) })}
            </p>
          )}
        </Link>
      )}

      {/* Tekshiruvlar */}
      {data.findings.length > 0 && (
        <div className="rounded-ios-lg bg-white p-4">
          <h3 className="text-footnote font-semibold uppercase tracking-wide text-slate-500">
            {t('checks')}
          </h3>
          <ul className="mt-3 space-y-2.5">
            {data.findings.map((f, i) => (
              <FindingRow key={`${f.code}-${i}`} finding={f} />
            ))}
          </ul>
        </div>
      )}

      {/* AI tahlili */}
      <div className="rounded-ios-lg bg-white p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ios-sm bg-indigo-50">
            <Sparkles className="h-[18px] w-[18px] text-indigo-600" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-body font-medium text-brand-900">{t('aiTitle')}</p>
            <p className="mt-0.5 text-footnote text-slate-500">
              {t('aiNote')}
            </p>
          </div>
        </div>

        {data.ai ? (
          <div className="mt-4 space-y-4">
            {data.ai.summary && (
              <p className="text-subhead text-slate-700">{data.ai.summary}</p>
            )}
            <AiList title={t('strengths')} items={data.ai.strengths} tone="accent" />
            <AiList title={t('weaknesses')} items={data.ai.weaknesses} tone="amber" />
            <AiList title={t('opportunities')} items={data.ai.opportunities} tone="slate" />
            <AiList title={t('risks')} items={data.ai.risks} tone="rose" />
            <AiList title={t('recommendations')} items={data.ai.recommendations} tone="accent" />
            <button
              type="button"
              onClick={() => runAi()}
              disabled={aiPending || !data.aiAvailable}
              className="tappable text-footnote text-accent-700 disabled:opacity-40"
            >
              {aiPending ? t('updating') : t('rerun')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => runAi()}
            disabled={aiPending || !data.aiAvailable}
            className="tappable mt-3.5 inline-flex h-10 items-center rounded-ios-md bg-indigo-600 px-4 text-subhead font-semibold text-white disabled:opacity-40"
          >
            {aiPending
              ? t('preparing')
              : data.aiAvailable
                ? t('getAi')
                : t('aiUnavailable')}
          </button>
        )}
      </div>
    </section>
  );
}

function FindingRow({ finding }: { finding: AssessmentFinding }) {
  const meta = {
    error: { Icon: AlertCircle, tone: 'text-rose-500' },
    warning: { Icon: Warning, tone: 'text-amber-500' },
    info: { Icon: Info, tone: 'text-slate-400' },
  }[finding.severity];

  return (
    <li className="flex items-start gap-2.5">
      <meta.Icon className={cn('mt-0.5 h-4 w-4 shrink-0', meta.tone)} />
      <span className="text-subhead text-slate-700">{finding.message}</span>
    </li>
  );
}

function AiList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'accent' | 'amber' | 'rose' | 'slate';
}) {
  if (items.length === 0) return null;
  const dot = {
    accent: 'bg-accent-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-400',
  }[tone];
  return (
    <div>
      <h4 className="text-footnote font-semibold text-slate-500">{title}</h4>
      <ul className="mt-1.5 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className={cn('mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full', dot)} />
            <span className="text-subhead text-slate-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
