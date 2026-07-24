'use client';

import Link from 'next/link';
import { Eye, Star } from 'lucide-react';
import { PLATFORM_ORDER } from '@/lib/constants';
import { PlatformIcon } from './platform';
import { LikeCount, BookmarkButton } from './engagement';
import { CoverMedia } from './cover-media';
import { RatingValue } from './rating';
import type { Startup } from '@/types';

/**
 * `priority` — fold ichidagi birinchi kartalar uchun: cover LCP nomzodi bo'lgani
 * sababli u eager + fetchpriority=high yuklanadi; qolganlari lazy (tarmoqni
 * LCP bilan talashmaydi).
 */
export function StartupCard({ startup, priority = false }: { startup: Startup; priority?: boolean }) {
  const platformTypes = Array.from(
    new Set(startup.platforms.map((p) => p.type)),
  ).sort((a, b) => PLATFORM_ORDER.indexOf(a) - PLATFORM_ORDER.indexOf(b));

  return (
    <Link href={`/startups/${startup.slug}`} className="group block h-full">
      <article className="relative h-full flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-accent-300 hover:shadow-card-hover transition-all duration-200">
        {/* Cover — rasm yoki video (video bosilganda ijro boshlanadi) */}
        <div className="relative h-28 overflow-hidden">
          <CoverMedia
            coverUrl={startup.coverUrl}
            videoUrl={startup.videoUrl}
            title={startup.title}
            priority={priority}
          />
          {startup.isFeatured && (
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-700 text-white text-[10px] font-bold shadow-sm">
              <Star className="h-3 w-3 fill-current" /> TOP
            </span>
          )}
          <div className="absolute top-2.5 left-2.5">
            <BookmarkButton startup={startup} variant="card" />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 pt-0">
          {/* Logo overlaps cover — `relative z-10` shart, aks holda positioned cover ustidan chiziladi */}
          <div className="relative z-10 flex items-end gap-3 -mt-7 mb-3">
            <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 shadow-card flex items-center justify-center overflow-hidden shrink-0">
              {startup.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={startup.logoUrl}
                  alt={startup.title}
                  loading={priority ? 'eager' : 'lazy'}
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-black text-brand-900">
                  {startup.title.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {startup.category && (
              <span className="mb-1 text-[11px] font-medium text-slate-500 truncate">
                {startup.category}
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-brand-900 group-hover:text-accent-700 transition-colors truncate">
            {startup.title}
          </h3>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-2 min-h-[2rem]">
            {startup.tagline || startup.description}
          </p>
          {startup.ratingCount > 0 && (
            <div className="mt-2">
              <RatingValue value={startup.ratingAvg} count={startup.ratingCount} size="xs" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {platformTypes.length > 0 ? (
              platformTypes.map((t) => (
                <span
                  key={t}
                  className="h-6 w-6 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500"
                >
                  <PlatformIcon type={t} className="h-3.5 w-3.5" />
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-500 italic">G&apos;oya bosqichida</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Ro'yxatda faqat son — yoqtirish amali detal sahifada */}
            <LikeCount count={startup.likeCount ?? 0} />
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Eye className="h-3 w-3" /> {startup.viewCount}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function StartupCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-28 bg-slate-100" />
      <div className="p-4 pt-0">
        <div className="h-14 w-14 rounded-2xl bg-slate-200 -mt-7 mb-3" />
        <div className="h-4 w-2/3 bg-slate-100 rounded mb-2" />
        <div className="h-3 w-full bg-slate-100 rounded" />
      </div>
      <div className="px-4 py-3 border-t border-slate-100 flex justify-between">
        <div className="h-6 w-16 bg-slate-100 rounded" />
        <div className="h-3 w-8 bg-slate-100 rounded" />
      </div>
    </div>
  );
}
