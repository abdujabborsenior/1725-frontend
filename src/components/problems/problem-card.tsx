'use client';

import Link from 'next/link';
import { ChevronRight, Eye } from '@/components/icons';
import { timeAgo } from '@/lib/date';
import { ProblemStatusPill } from '@/components/ui/badge';
import { ProblemLikeButton } from '@/components/problems/like-button';
import { cn } from '@/lib/utils';
import type { Problem } from '@/types';

/**
 * Yagona muammo kartochkasi — ro'yxat sahifasi va bosh sahifa uchun.
 * iOS uslubi: tinch oq sirt, chegarasiz, holat faqat pill orqali bildiriladi
 * (rangli chiziq/rels kabi dekor YO'Q).
 *
 * `compact` — bosh sahifadagi kichik variant (like tugmasiz, zichroq).
 */
export function ProblemCard({ problem, compact = false }: { problem: Problem; compact?: boolean }) {
  return (
    /* "Stretched link": havola sarlavhada, qoplama esa butun kartani bosiladigan
       qiladi — "Foydali" tugmasi endi <a> ichida emas (yaroqli nesting). */
    <article
      className={cn(
        'card-today relative flex h-full flex-col rounded-ios-2xl bg-white shadow-card',
        compact ? 'p-5' : 'p-5 sm:p-6',
      )}
    >
      {/* Sarlavha qatori: status + kategoriya */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <ProblemStatusPill status={problem.status} />
        {problem.category && (
          <span className="truncate rounded-full bg-fill-tertiary px-2.5 py-1 text-caption-1 font-medium text-slate-500">
            {problem.category}
          </span>
        )}
      </div>

      <h3
        className={cn(
          'mb-1.5 line-clamp-2 font-semibold leading-snug text-brand-900',
          compact ? 'text-callout' : 'text-title-3',
        )}
      >
        <Link
          href={`/problems/${problem.id}`}
          className="after:absolute after:inset-0 after:z-0 after:content-['']"
        >
          {problem.title}
        </Link>
      </h3>

      <p
        className={cn(
          'mb-4 line-clamp-2 flex-1 leading-relaxed text-slate-500',
          compact ? 'text-footnote' : 'text-subhead',
        )}
      >
        {problem.description}
      </p>

      {/* Rasm eskizlari */}
      {!compact && problem.imageUrls.length > 0 && (
        <div className="mb-4 flex gap-2">
          {problem.imageUrls.slice(0, 3).map((url, i) => (
            <div key={i} className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-ios bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Meta qatori */}
      <div className="mt-auto flex items-center justify-between gap-2">
        {compact ? (
          <span className="flex items-center gap-1.5 text-footnote tabular-nums text-slate-500">
            <Eye className="h-3.5 w-3.5" /> {problem.viewCount.toLocaleString('uz')}
          </span>
        ) : (
          <ProblemLikeButton
            problemId={problem.id}
            initialLiked={problem.likedByMe ?? false}
            initialCount={problem.likeCount}
            size="sm"
            className="relative z-10"
          />
        )}

        <div className="flex items-center gap-2 text-caption-1 text-slate-500">
          {!compact && (
            <span className="flex items-center gap-1 tabular-nums">
              <Eye className="h-3.5 w-3.5" /> {problem.viewCount.toLocaleString('uz')}
            </span>
          )}
          <span className="whitespace-nowrap">
            {timeAgo(problem.createdAt)}
          </span>
          <ChevronRight className="h-3 w-3 text-slate-300" strokeWidth={3} />
        </div>
      </div>
    </article>
  );
}

export function ProblemCardSkeleton() {
  return (
    <div className="rounded-ios-2xl bg-white p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton mb-2 h-5 w-3/4 rounded-md" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-full rounded-md" />
        <div className="skeleton h-4 w-5/6 rounded-md" />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="skeleton h-8 w-20 rounded-full" />
        <div className="skeleton h-4 w-24 rounded-md" />
      </div>
    </div>
  );
}
