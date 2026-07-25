'use client';

import Link from 'next/link';
import { Eye, StarFill } from '@/components/icons';
import { PLATFORM_ORDER } from '@/lib/constants';
import { PlatformIcon } from './platform';
import { LikeCount, BookmarkButton } from './engagement';
import { CoverMedia } from './cover-media';
import { RatingValue } from './rating';
import type { Startup } from '@/types';

/**
 * Startap kartasi — App Store mahsulot kartasi ritmida: muqova, ustiga
 * chiquvchi ilova ikonkasi (squircle), qisqa yorliq va tinch meta qatori.
 *
 * `priority` — fold ichidagi birinchi kartalar uchun: cover LCP nomzodi bo'lgani
 * sababli u eager + fetchpriority=high yuklanadi; qolganlari lazy (tarmoqni
 * LCP bilan talashmaydi).
 */
export function StartupCard({
  startup,
  priority = false,
}: {
  startup: Startup;
  priority?: boolean;
}) {
  const platformTypes = Array.from(new Set(startup.platforms.map((p) => p.type))).sort(
    (a, b) => PLATFORM_ORDER.indexOf(a) - PLATFORM_ORDER.indexOf(b),
  );

  return (
    <Link href={`/startups/${startup.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-ios-2xl bg-white transition-shadow duration-200 ease-ios hover:shadow-card-hover">
        {/* Muqova — rasm yoki video (video bosilganda ijro boshlanadi) */}
        <div className="relative h-28 overflow-hidden bg-slate-100">
          <CoverMedia
            coverUrl={startup.coverUrl}
            videoUrl={startup.videoUrl}
            title={startup.title}
            priority={priority}
          />
          {startup.isFeatured && (
            <span className="material-dark absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full px-2 py-1 text-caption-2 font-semibold text-white">
              <StarFill className="h-2.5 w-2.5" /> TOP
            </span>
          )}
          <div className="absolute left-2.5 top-2.5">
            <BookmarkButton startup={startup} variant="card" />
          </div>
        </div>

        {/* Tana */}
        <div className="flex-1 px-4 pb-4">
          {/* Ikonka muqova ustiga chiqadi — `relative z-10` shart */}
          <div className="relative z-10 -mt-7 mb-3 flex items-end gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-white shadow-card ring-1 ring-black/[0.06]">
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
                <span className="text-title-2 font-semibold text-brand-900">
                  {startup.title.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {startup.category && (
              <span className="mb-1 truncate text-caption-1 text-slate-500">{startup.category}</span>
            )}
          </div>

          <h3 className="truncate text-callout font-semibold text-brand-900">{startup.title}</h3>
          <p className="mt-0.5 line-clamp-2 min-h-[2.25rem] text-footnote leading-relaxed text-slate-500">
            {startup.tagline || startup.description}
          </p>
          {startup.ratingCount > 0 && (
            <div className="mt-2">
              <RatingValue value={startup.ratingAvg} count={startup.ratingCount} size="xs" />
            </div>
          )}
        </div>

        {/* Meta qatori */}
        <div className="hairline-t flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2 text-slate-400">
            {platformTypes.length > 0 ? (
              platformTypes.map((t) => <PlatformIcon key={t} type={t} className="h-4 w-4" />)
            ) : (
              <span className="text-caption-1 text-slate-400">G&apos;oya bosqichida</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Ro'yxatda faqat son — yoqtirish amali detal sahifada */}
            <LikeCount count={startup.likeCount ?? 0} />
            <span className="flex items-center gap-1 text-caption-1 tabular-nums text-slate-500">
              <Eye className="h-3.5 w-3.5" /> {startup.viewCount}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function StartupCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-ios-2xl bg-white">
      <div className="skeleton h-28" />
      <div className="px-4 pb-4">
        <div className="skeleton -mt-7 mb-3 h-14 w-14 rounded-[13px]" />
        <div className="skeleton mb-2 h-4 w-2/3 rounded-md" />
        <div className="skeleton h-3 w-full rounded-md" />
      </div>
      <div className="hairline-t flex justify-between px-4 py-2.5">
        <div className="skeleton h-4 w-16 rounded-md" />
        <div className="skeleton h-3 w-8 rounded-md" />
      </div>
    </div>
  );
}
