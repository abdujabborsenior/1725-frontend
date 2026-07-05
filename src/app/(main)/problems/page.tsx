'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, FileQuestion } from 'lucide-react';
import { problemsApi } from '@/lib/api';
import type { ProblemStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { ProblemCard, ProblemCardSkeleton } from '@/components/problems/problem-card';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/lib/use-debounce';

const STATUS_TABS: { value: ProblemStatus | ''; label: string }[] = [
  { value: '', label: 'Barchasi' },
  { value: 'open', label: 'Ochiq' },
  { value: 'under_review', label: "Ko'rib chiqilmoqda" },
  { value: 'resolved', label: 'Hal qilindi' },
];

export default function ProblemsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [status, setStatus] = useState<ProblemStatus | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['problems', { page, search: debouncedSearch, status }],
    queryFn: () =>
      problemsApi.list({
        page,
        limit: 9,
        status: status || undefined,
        search: debouncedSearch || undefined,
      }),
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-7 animate-fade-in">
      {/* ── Hero header ──────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[26px] border border-slate-200/70 bg-white p-6 shadow-soft sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent-500/[0.08] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-iris-500/[0.07] blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-emerald-iris text-white shadow-glow-iris">
                <FileQuestion className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              Jamoaviy aql
            </span>
            <h1 className="mt-3 text-[1.75rem] font-bold tracking-tight text-brand-900 sm:text-[2rem]">Muammolar</h1>
            <p className="mt-1 text-sm text-slate-500">
              Jami <span className="font-bold text-brand-900">{data?.meta.total ?? '—'}</span> ta muammo · yechim kutmoqda
            </p>
          </div>
          {/* Guest ham ko'radi — bosganда register orqali aynan shu yerga qaytadi */}
          <Link href="/problems/create">
            <Button variant="accent" size="md">
              <Plus className="h-4 w-4" /> Muammo yuborish
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Controls: search + filter ────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Muammo qidirish..."
            className="input-focus h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-brand-900 transition-all placeholder:text-slate-400 hover:border-slate-300 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatus(tab.value); setPage(1); }}
              className={cn(
                'whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-bold transition-all duration-200',
                status === tab.value
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-brand-900',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => <ProblemCardSkeleton key={i} />)
          : items.length === 0
            ? (
              <div className="col-span-full flex flex-col items-center py-24 text-center">
                <div className="mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 ring-1 ring-slate-200/70">
                  <Search className="h-9 w-9 text-slate-300" />
                </div>
                <p className="text-lg font-bold text-brand-900">Muammolar topilmadi</p>
                <p className="mt-1 text-sm text-slate-500">Boshqa kalit so&apos;z yoki filtr bilan urinib ko&apos;ring</p>
              </div>
            )
            : items.map((p) => <ProblemCard key={p.id} problem={p} />)}
      </div>

      {!isLoading && items.length > 0 && (
        <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} />
      )}
    </div>
  );
}
