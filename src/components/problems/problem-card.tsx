'use client';

import Link from 'next/link';
import { Eye, ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PROBLEM_STATUS_META } from '@/lib/constants';
import { ProblemStatusPill } from '@/components/ui/badge';
import { ProblemLikeButton } from '@/components/problems/like-button';
import { cn } from '@/lib/utils';
import type { Problem } from '@/types';

/**
 * Hamma joyda ishlatiladigan yagona muammo kartochkasi — ro'yxat sahifasi
 * va bosh sahifa. Status rangi nozik urg'u sifatida (yuqori chiziq + chap rels
 * + hover border) ishlatiladi; asosiy palitra navy/slate — viqorli, skromniy.
 *
 * `compact` — bosh sahifadagi kichik variant (like tugmasiz, zichroq).
 */
export function ProblemCard({ problem, compact = false }: { problem: Problem; compact?: boolean }) {
  const m = PROBLEM_STATUS_META[problem.status];

  return (
    <Link href={`/problems/${problem.id}`} className="group block h-full">
      <article
        className={cn(
          'relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300',
          'hover:-translate-y-0.5 hover:shadow-card-hover',
          m.border,
          compact ? 'p-5' : 'p-5 sm:p-6',
        )}
      >
        {/* yuqori status chizig'i — hoverda chapdan o'ngga ochiladi */}
        <span
          className={cn(
            'absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100',
            m.bar,
          )}
        />
        {/* nozik chap rels — status rangi, doim ko'rinadigan ingichka urg'u */}
        <span className={cn('absolute inset-y-5 left-0 w-0.5 rounded-full opacity-50 transition-opacity duration-300 group-hover:opacity-100', m.bar)} />

        {/* Header: status + kategoriya */}
        <div className="mb-3.5 flex items-center justify-between gap-3 pl-2.5">
          <ProblemStatusPill status={problem.status} />
          {problem.category && (
            <span className="truncate rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-inset ring-slate-200/70">
              {problem.category}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className={cn(
            'mb-2 pl-2.5 font-bold leading-snug tracking-tight text-brand-900 transition-colors line-clamp-2 group-hover:text-accent-700',
            compact ? 'text-[15px]' : 'text-base sm:text-[17px]',
          )}
        >
          {problem.title}
        </h3>

        {/* Description */}
        <p className={cn('mb-4 pl-2.5 leading-relaxed text-slate-500 line-clamp-2', compact ? 'text-xs flex-1' : 'text-sm flex-1')}>
          {problem.description}
        </p>

        {/* Thumbnails */}
        {!compact && problem.imageUrls.length > 0 && (
          <div className="mb-4 flex gap-2 pl-2.5">
            {problem.imageUrls.slice(0, 3).map((url, i) => (
              <div key={i} className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/70">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" loading="lazy" decoding="async"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2 pl-2.5">
          {compact ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Eye className="h-3.5 w-3.5" /> {problem.viewCount.toLocaleString('uz')}
            </span>
          ) : (
            <ProblemLikeButton
              problemId={problem.id}
              initialLiked={problem.likedByMe ?? false}
              initialCount={problem.likeCount}
              size="sm"
            />
          )}

          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-500">
            {!compact && (
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> {problem.viewCount.toLocaleString('uz')}
              </span>
            )}
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="whitespace-nowrap">
              {formatDistanceToNow(new Date(problem.createdAt), { addSuffix: true })}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 text-slate-300 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-accent-500 group-hover:opacity-100" />
          </div>
        </div>
      </article>
    </Link>
  );
}

export function ProblemCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
        <div className="h-5 w-16 animate-pulse rounded-md bg-slate-100" />
      </div>
      <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-slate-100" />
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="h-8 w-20 animate-pulse rounded-full bg-slate-100" />
        <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
