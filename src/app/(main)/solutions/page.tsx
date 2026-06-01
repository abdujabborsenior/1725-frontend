'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Clock, CheckCircle2, XCircle, Hourglass, Lightbulb, FileText, Video,
} from 'lucide-react';
import { solutionsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { Solution, SolutionStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { SolutionStatusBadge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const STATUS_TABS: { value: SolutionStatus | ''; label: string }[] = [
  { value: '', label: 'Barchasi' },
  { value: 'accepted', label: 'Qabul qilingan' },
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'rejected', label: 'Rad etilgan' },
];

const STATUS_ICON: Record<SolutionStatus, React.ReactNode> = {
  accepted: <CheckCircle2 className="h-3.5 w-3.5 text-accent-600" />,
  pending: <Hourglass className="h-3.5 w-3.5 text-amber-600" />,
  rejected: <XCircle className="h-3.5 w-3.5 text-rose-600" />,
};

function SolutionCard({ solution }: { solution: Solution }) {
  return (
    <article className="bg-white border border-slate-200 rounded-xl p-5 hover:border-accent-300 hover:shadow-card-hover transition-all duration-200 flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="inline-flex items-center gap-1.5">
          {STATUS_ICON[solution.status]}
          <SolutionStatusBadge status={solution.status} />
        </span>
        {solution.problem && (
          <Link
            href={`/problems/${solution.problem.id}`}
            className="text-[11px] text-slate-500 hover:text-accent-700 truncate transition-colors max-w-[160px]"
          >
            {solution.problem.title}
          </Link>
        )}
      </div>

      <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed mb-4 flex-1">
        {solution.content}
      </p>

      {(solution.presentationUrl || solution.videoUrl) && (
        <div className="flex gap-2 mb-4">
          {solution.presentationUrl && (
            <a href={solution.presentationUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-accent-50 text-accent-700 border border-accent-200 hover:bg-accent-100 transition-colors">
              <FileText className="h-3 w-3" /> Taqdimot
            </a>
          )}
          {solution.videoUrl && (
            <a href={solution.videoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors">
              <Video className="h-3 w-3" /> Video
            </a>
          )}
        </div>
      )}

      {solution.analyzerNote && (
        <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 italic">
          &ldquo;{solution.analyzerNote}&rdquo;
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
        <span className="font-medium text-slate-700 truncate max-w-[140px]">
          {solution.submittedBy?.fullName ?? solution.fullName}
        </span>
        <span className="flex items-center gap-1 flex-shrink-0">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(solution.createdAt), { addSuffix: true })}
        </span>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 animate-pulse">
      <div className="flex gap-2">
        <div className="h-5 w-28 rounded bg-slate-100" />
        <div className="h-5 w-20 rounded bg-slate-100 ml-auto" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-5/6 rounded bg-slate-100" />
        <div className="h-4 w-4/6 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export default function SolutionsPage() {
  const { token } = useAuthStore();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<SolutionStatus | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['solutions', { page, status }],
    queryFn: () => solutionsApi.list({ page, limit: 9, status: status || undefined }),
  });

  const visibleTabs = token
    ? STATUS_TABS
    : STATUS_TABS.filter((t) => t.value === '' || t.value === 'accepted');

  const items = data?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Yechimlar</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Jami {data?.meta.total ?? '—'} ta yechim
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <span className="text-xs text-slate-600 font-medium">
            {token ? 'Hamjamiyat yechimlari' : 'Qabul qilingan yechimlar'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl w-fit max-w-full overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap',
              status === tab.value ? 'bg-brand-900 text-white' : 'text-slate-600 hover:text-brand-900 hover:bg-slate-50',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
          : items.length === 0
            ? (
              <div className="col-span-full py-24 text-center">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-brand-900 font-semibold">Yechimlar topilmadi</p>
                <p className="text-sm text-slate-500 mt-1">
                  {token ? 'Hozircha yechim mavjud emas' : "Hozircha qabul qilingan yechimlar yo'q"}
                </p>
              </div>
            )
            : items.map((s) => <SolutionCard key={s.id} solution={s} />)}
      </div>

      {!isLoading && (
        <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} />
      )}
    </div>
  );
}
