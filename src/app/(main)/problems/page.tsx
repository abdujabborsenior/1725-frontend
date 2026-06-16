'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye, Clock, Plus, Filter } from 'lucide-react';
import { problemsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { Problem, ProblemStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { ProblemStatusBadge } from '@/components/ui/badge';
import { ProblemLikeButton } from '@/components/problems/like-button';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/lib/use-debounce';
import { formatDistanceToNow } from 'date-fns';

const STATUS_TABS: { value: ProblemStatus | ''; label: string }[] = [
  { value: '', label: 'Barchasi' },
  { value: 'open', label: 'Ochiq' },
  { value: 'under_review', label: "Ko'rib chiqilmoqda" },
  { value: 'resolved', label: 'Hal qilindi' },
];

function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <Link href={`/problems/${problem.id}`}>
      <article className="bg-white border border-slate-200 rounded-xl p-5 hover:border-accent-300 hover:shadow-card-hover transition-all duration-200 group cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-3">
          <ProblemStatusBadge status={problem.status} />
          {problem.category && (
            <span className="text-[11px] text-slate-500 truncate">{problem.category}</span>
          )}
        </div>

        <h3 className="text-base font-semibold text-brand-900 group-hover:text-accent-700 transition-colors line-clamp-2 mb-2">
          {problem.title}
        </h3>

        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4 flex-1">
          {problem.description}
        </p>

        {problem.imageUrls.length > 0 && (
          <div className="mb-4 flex gap-2">
            {problem.imageUrls.slice(0, 3).map((url, i) => (
              <div key={i} className="h-16 w-20 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mt-auto">
          <div className="flex items-center gap-2">
            <ProblemLikeButton
              problemId={problem.id}
              initialLiked={problem.likedByMe ?? false}
              initialCount={problem.likeCount}
              size="sm"
            />
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {problem.viewCount}
            </span>
          </div>
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(problem.createdAt), { addSuffix: true })}
          </span>
        </div>
      </article>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 animate-pulse">
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded bg-slate-100" />
        <div className="h-5 w-16 rounded bg-slate-100" />
      </div>
      <div className="h-5 w-3/4 rounded bg-slate-100" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-5/6 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export default function ProblemsPage() {
  const { token } = useAuthStore();
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Muammolar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Jami {data?.meta.total ?? '—'} ta muammo</p>
        </div>
        {token && (
          <Link href="/problems/create">
            <Button variant="accent" size="md">
              <Plus className="h-4 w-4" /> Muammo yuborish
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Muammo qidirish..."
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus transition-all"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400 ml-2 flex-shrink-0" />
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatus(tab.value); setPage(1); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap',
                status === tab.value
                  ? 'bg-brand-900 text-white'
                  : 'text-slate-600 hover:text-brand-900 hover:bg-slate-50',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
          : items.length === 0
            ? (
              <div className="col-span-full py-24 text-center">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-brand-900 font-semibold">Muammolar topilmadi</p>
                <p className="text-sm text-slate-500 mt-1">Boshqa kalit so&apos;z bilan qidiring</p>
              </div>
            )
            : items.map((p) => <ProblemCard key={p.id} problem={p} />)}
      </div>

      {!isLoading && (
        <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} />
      )}
    </div>
  );
}
