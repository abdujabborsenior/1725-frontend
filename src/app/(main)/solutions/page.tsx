'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Clock, Lightbulb, FileText, Video } from '@/components/icons';
import { solutionsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { Solution } from '@/types';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState, PageHeader } from '@/components/ui/page-header';
import { VerifiedBadge } from '@/components/social/verified-badge';
import { StartupMiniCard } from '@/components/startups/startup-mini-card';
import { timeAgo } from '@/lib/date';

function SolutionCard({ solution }: { solution: Solution }) {
  return (
    <article className="card-today flex h-full flex-col rounded-ios-2xl bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* "Foydali" hisobi — yechim qadri (moderatsiya o'rniga hamjamiyat bahosi) */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-2.5 py-1 text-caption-1 font-medium text-accent-700">
          <Lightbulb className="h-3 w-3" />
          {(solution.helpfulCount ?? 0).toLocaleString('uz')} foydali
        </span>
        {solution.problem && (
          <Link
            href={`/problems/${solution.problem.id}`}
            className="max-w-[160px] truncate text-caption-1 text-slate-500 transition-colors hover:text-accent-700"
          >
            {solution.problem.title}
          </Link>
        )}
      </div>

      {/* Startap yechim sifatida yuborilganda matn bo'sh bo'lishi mumkin */}
      {solution.content?.trim() ? (
        <p className="mb-4 line-clamp-3 flex-1 text-subhead leading-relaxed text-slate-600">
          {solution.content}
        </p>
      ) : (
        <div className="flex-1" />
      )}

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
              className="tappable flex items-center gap-1 rounded-full bg-accent-50 px-2.5 py-1 text-caption-1 font-medium text-accent-700">
              <FileText className="h-3 w-3" /> Taqdimot
            </a>
          )}
          {solution.videoUrl && (
            <a href={solution.videoUrl} target="_blank" rel="noopener noreferrer"
              className="tappable flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-caption-1 font-medium text-violet-700">
              <Video className="h-3 w-3" /> Video
            </a>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between text-footnote text-slate-500">
        <span className="flex min-w-0 items-center gap-1 text-slate-600">
          <span className="max-w-[140px] truncate">
            {solution.submittedBy?.fullName ?? solution.fullName}
          </span>
          {solution.submittedBy?.isVerified && <VerifiedBadge size={13} />}
        </span>
        <span className="flex items-center gap-1 flex-shrink-0">
          <Clock className="h-3 w-3" />
          {timeAgo(solution.createdAt)}
        </span>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-ios-2xl bg-white p-5">
      <div className="flex gap-2">
        <div className="skeleton h-5 w-28 rounded-full" />
        <div className="skeleton ml-auto h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-4 w-full rounded-md" />
        <div className="skeleton h-4 w-5/6 rounded-md" />
        <div className="skeleton h-4 w-4/6 rounded-md" />
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
      <EmptyState
        icon={<Lightbulb />}
        title="Yechimlaringizni kuzating"
        description="Yuborgan yechimlaringizni ko'rish uchun tizimga kiring"
        action={
          <Link
            href="/login?next=%2Fsolutions"
            className="tappable flex h-11 items-center rounded-full bg-accent-600 px-6 text-body font-medium text-white active:bg-accent-700"
          >
            Tizimga kirish
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yechimlarim"
        subtitle={`Siz yuborgan ${data?.meta.total ?? '—'} ta yechim — barchasi joylangan zahoti hammaga ko'rinadi`}
      />

      <div className="grid-rise grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
          : items.length === 0
            ? (
              <EmptyState
                className="col-span-full"
                icon={<Lightbulb />}
                title="Yechim topilmadi"
                description="Siz hali yechim yubormagansiz"
              />
            )
            : items.map((s) => <SolutionCard key={s.id} solution={s} />)}
      </div>

      {!isLoading && (
        <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} />
      )}
    </div>
  );
}
