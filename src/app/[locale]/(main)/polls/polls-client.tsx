'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Vote } from '@/components/icons';
import { pollsApi } from '@/lib/api';
import type { Poll } from '@/types';
import { useFormatNumber } from '@/lib/format';
import { PollCard, PollCardSkeleton } from '@/components/polls/poll-card';
import { BackButton } from '@/components/ui/back-button';
import { EmptyState, PageHeader } from '@/components/ui/page-header';

export function PollsClient({ initialPolls }: { initialPolls: Poll[] | null }) {
  const t = useTranslations('polls');
  const fmt = useFormatNumber();
  const { data: polls, isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: () => pollsApi.list(),
    staleTime: 30_000,
    // SSR ro'yxati darhol ko'rinadi; updatedAt=0 → shaxsiy maydonlar
    // (myVotedOptionId) background refetch'da keladi
    initialData: initialPolls ?? undefined,
    initialDataUpdatedAt: 0,
  });

  const activeCount = polls?.filter((p) => !p.isClosed).length ?? 0;
  const totalVotes = polls?.reduce((s, p) => s + p.totalVotes, 0) ?? 0;
  const hasPolls = !!polls && polls.length > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackButton label={t('back')} fallbackHref="/" />

      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        subtitle={t('subtitle')}
      />

      {hasPolls && (
        <div className="grid grid-cols-2 overflow-hidden rounded-ios-xl bg-white [&>*:nth-child(2)]:border-l [&>*]:border-slate-200">
          <div className="px-5 py-4">
            <p className="text-title-2 font-semibold tabular-nums text-brand-900">{fmt(activeCount)}</p>
            <p className="text-footnote text-slate-500">{t('stats.active')}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-title-2 font-semibold tabular-nums text-brand-900">
              {fmt(totalVotes)}
            </p>
            <p className="text-footnote text-slate-500">{t('stats.votes')}</p>
          </div>
        </div>
      )}

      {/* Polls */}
      {isLoading ? (
        <div className="space-y-5">
          {[0, 1, 2].map((i) => <PollCardSkeleton key={i} />)}
        </div>
      ) : hasPolls ? (
        <div className="space-y-5">
          <h2 className="sr-only">{t('listHeading')}</h2>
          {polls.map((p) => <PollCard key={p.id} poll={p} />)}
        </div>
      ) : (
        <EmptyState
          icon={<Vote />}
          title={t('empty.title')}
          description={t('empty.description')}
        />
      )}
    </div>
  );
}
