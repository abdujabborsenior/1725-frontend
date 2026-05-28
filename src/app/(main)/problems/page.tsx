'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Eye, MessageSquare, Clock,
  ChevronLeft, ChevronRight, Plus, Filter,
} from 'lucide-react';
import { problemsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { PaginatedResponse, Problem, ProblemStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const STATUS_TABS: { value: ProblemStatus | ''; label: string; color: string }[] = [
  { value: '',             label: 'Barchasi',         color: 'text-slate-300' },
  { value: 'open',        label: 'Ochiq',             color: 'text-neon-green' },
  { value: 'under_review',label: "Ko'rib chiqilmoqda",color: 'text-brand-400' },
  { value: 'resolved',    label: 'Hal qilindi',       color: 'text-violet-400' },
];

const STATUS_BADGE: Record<string, string> = {
  pending:      'bg-amber-500/15 text-amber-400 border-amber-500/30',
  open:         'bg-neon-green/10 text-neon-green border-neon-green/30',
  under_review: 'bg-brand-500/15 text-brand-400 border-brand-400/30',
  resolved:     'bg-violet-500/15 text-violet-400 border-violet-500/30',
  rejected:     'bg-red-500/15 text-red-400 border-red-500/30',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Kutilmoqda', open: 'Ochiq',
  under_review: "Ko'rib chiqilmoqda", resolved: 'Hal qilindi', rejected: 'Rad etildi',
};

function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <Link href={`/problems/${problem.id}`}>
      <article className="glass border border-white/[0.07] rounded-2xl p-5 hover:border-brand-400/30 hover:shadow-card transition-all duration-300 group cursor-pointer">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border flex-shrink-0',
            STATUS_BADGE[problem.status],
          )}>
            {STATUS_LABEL[problem.status]}
          </span>
          {problem.category && (
            <span className="text-[11px] text-slate-500 truncate">{problem.category}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors line-clamp-2 mb-2">
          {problem.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {problem.description}
        </p>

        {/* Bottom */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {problem.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {problem.comments?.length ?? 0}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {problem.submittedBy && (
              <span className="text-slate-600 truncate max-w-[80px]">
                {problem.submittedBy.fullName}
              </span>
            )}
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(problem.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Image preview */}
        {problem.imageUrls.length > 0 && (
          <div className="mt-3 flex gap-2">
            {problem.imageUrls.slice(0, 3).map((url, i) => (
              <div key={i} className="h-16 w-20 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                <img src={url} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="glass border border-white/[0.07] rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded-lg bg-white/5" />
        <div className="h-5 w-16 rounded-lg bg-white/5" />
      </div>
      <div className="h-5 w-3/4 rounded-lg bg-white/5" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-white/5" />
        <div className="h-4 w-5/6 rounded bg-white/5" />
      </div>
      <div className="flex justify-between">
        <div className="h-4 w-24 rounded bg-white/5" />
        <div className="h-4 w-28 rounded bg-white/5" />
      </div>
    </div>
  );
}

export default function ProblemsPage() {
  const { token } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<ProblemStatus | ''>('');

  const { data, isLoading } = useQuery<PaginatedResponse<Problem>>({
    queryKey: ['problems', { page, search: debouncedSearch, status }],
    queryFn: async () => {
      const res = await problemsApi.list({
        page, limit: 9,
        status: status || undefined,
        search: debouncedSearch || undefined,
      });
      return (res.data as { data: PaginatedResponse<Problem> }).data;
    },
  });

  function handleSearch(val: string) {
    setSearch(val);
    clearTimeout((window as { _st?: ReturnType<typeof setTimeout> })._st);
    (window as { _st?: ReturnType<typeof setTimeout> })._st = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  }

  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Muammolar</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Jami {data?.meta.total ?? '—'} ta muammo
          </p>
        </div>
        {token && (
          <Link href="/problems/create">
            <Button variant="neon" size="md">
              <Plus className="h-4 w-4" /> Muammo yuborish
            </Button>
          </Link>
        )}
      </div>

      {/* Search + status tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Muammo qidirish..."
            className="w-full h-11 pl-11 pr-4 rounded-2xl glass border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none input-glow transition-all"
          />
        </div>
        <div className="flex items-center gap-1 p-1 glass border border-white/10 rounded-2xl">
          <Filter className="h-3.5 w-3.5 text-slate-500 ml-2 flex-shrink-0" />
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatus(tab.value); setPage(1); }}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap',
                status === tab.value
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
          : (data?.data ?? []).length === 0
            ? (
              <div className="col-span-3 py-24 text-center">
                <div className="h-16 w-16 rounded-2xl glass border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-slate-600" />
                </div>
                <p className="text-slate-400 font-medium">Muammolar topilmadi</p>
                <p className="text-sm text-slate-600 mt-1">Boshqa kalit so&apos;z bilan qidiring</p>
              </div>
            )
            : (data?.data ?? []).map((p) => <ProblemCard key={p.id} problem={p} />)}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-10 w-10 flex items-center justify-center rounded-xl glass border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i;
            if (p > totalPages) return null;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'h-10 w-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all',
                  p === page
                    ? 'bg-gradient-brand text-white shadow-glow-brand'
                    : 'glass border border-white/10 text-slate-400 hover:text-white hover:border-white/20',
                )}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-10 w-10 flex items-center justify-center rounded-xl glass border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
