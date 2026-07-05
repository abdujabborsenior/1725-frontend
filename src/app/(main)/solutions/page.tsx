'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Clock, Lightbulb, FileText, Video } from 'lucide-react';
import { solutionsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { Solution } from '@/types';
import { Pagination } from '@/components/ui/pagination';
import { StartupMiniCard } from '@/components/startups/startup-mini-card';
import { formatDistanceToNow } from 'date-fns';

function SolutionCard({ solution }: { solution: Solution }) {
  return (
    <article className="bg-white border border-slate-200 rounded-xl p-5 hover:border-accent-300 hover:shadow-card-hover transition-all duration-200 flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* "Foydali" hisobi — yechim qadri (moderatsiya o'rniga hamjamiyat bahosi) */}
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent-200 bg-accent-50 px-2 py-1 text-[11px] font-semibold text-accent-700">
          <Lightbulb className="h-3 w-3" />
          {(solution.helpfulCount ?? 0).toLocaleString('uz')} foydali
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

      {/* Yechim sifatida biriktirilgan startap — card */}
      {solution.startup && (
        <div className="mb-4">
          <StartupMiniCard startup={solution.startup} />
        </div>
      )}

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

  const { data, isLoading } = useQuery({
    queryKey: ['my-solutions', { page }],
    queryFn: () => solutionsApi.my({ page, limit: 9 }),
    enabled: !!token,
  });

  const items = data?.data ?? [];

  if (!token) {
    return (
      <div className="py-24 text-center animate-fade-in">
        <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-brand-900 font-semibold">Yechimlaringizni kuzating</p>
        <p className="text-sm text-slate-500 mt-1 mb-5">
          Yuborgan yechimlaringizni ko&apos;rish uchun tizimga kiring
        </p>
        <Link
          href="/login?next=%2Fsolutions"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 transition-colors"
        >
          Tizimga kirish
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Yechimlarim</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Siz yuborgan {data?.meta.total ?? '—'} ta yechim — barchasi joylangan
            zahoti hammaga ko&apos;rinadi
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200">
          <Lightbulb className="h-4 w-4 text-accent-600" />
          <span className="text-xs text-slate-600 font-medium">
            Shaxsiy yechimlar
          </span>
        </div>
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
                <p className="text-brand-900 font-semibold">Yechim topilmadi</p>
                <p className="text-sm text-slate-500 mt-1">
                  Siz hali yechim yubormagansiz
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
