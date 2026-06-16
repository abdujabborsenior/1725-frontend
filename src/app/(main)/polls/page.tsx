'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3, Loader2, Vote } from 'lucide-react';
import { pollsApi } from '@/lib/api';
import { PollCard } from '@/components/polls/poll-card';

export default function PollsPage() {
  const { data: polls, isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: () => pollsApi.list(),
    staleTime: 30_000,
  });

  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="pointer-events-none absolute inset-0 bg-mesh opacity-70" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-emerald-iris text-white shadow-glow-accent">
            <BarChart3 className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-brand-900">Ovoz berish</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Hamjamiyat tanlovi — yoqqan startaplaringizga ovoz bering 🗳️
            </p>
          </div>
        </div>
      </div>

      {/* Polls */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
        </div>
      ) : polls && polls.length > 0 ? (
        <div className="space-y-5">
          {polls.map((p) => <PollCard key={p.id} poll={p} />)}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-surface-soft py-16 text-center">
          <Vote className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-semibold text-brand-900">Hozircha ovoz berishlar yo‘q</p>
          <p className="mt-1 text-sm text-slate-500">Superadmin tez orada startaplar tanlovini boshlaydi.</p>
        </div>
      )}
    </div>
  );
}
