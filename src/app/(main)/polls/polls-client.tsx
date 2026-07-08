'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, Vote } from 'lucide-react';
import { pollsApi } from '@/lib/api';
import type { Poll } from '@/types';
import { PollCard } from '@/components/polls/poll-card';
import { BackButton } from '@/components/ui/back-button';

export function PollsClient({ initialPolls }: { initialPolls: Poll[] | null }) {
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
      <BackButton label="Ortga" fallbackHref="/" />

      {/* Hero */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft">
        <div className="h-1 w-full bg-accent-500" />
        <div className="px-6 py-6 md:px-8 md:py-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-700">Hamjamiyat tanlovi</p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-brand-900">Ovoz berish</h1>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-500">
            Eng kuchli startaplarni hamjamiyat tanlaydi. Yoqqan loyihangizga ovoz bering — natijalar jonli yangilanadi.
          </p>
          {hasPolls && (
            <div className="mt-5 flex items-center gap-6 border-t border-slate-100 pt-4">
              <div>
                <p className="text-xl font-black tabular-nums text-brand-900">{activeCount}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Faol tanlov</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <p className="text-xl font-black tabular-nums text-brand-900">{totalVotes.toLocaleString('uz')}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Umumiy ovoz</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Polls */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
      ) : hasPolls ? (
        <div className="space-y-5">
          <h2 className="sr-only">Tanlovlar ro&apos;yxati</h2>
          {polls.map((p) => <PollCard key={p.id} poll={p} />)}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-surface-soft py-16 text-center">
          <Vote className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-semibold text-brand-900">Hozircha tanlovlar yo‘q</p>
          <p className="mt-1 text-sm text-slate-500">Superadmin tez orada startaplar tanlovini boshlaydi.</p>
        </div>
      )}
    </div>
  );
}
