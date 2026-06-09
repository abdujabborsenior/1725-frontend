'use client';

import Link from 'next/link';
import { Eye, Sparkles, Rocket } from 'lucide-react';
import { PLATFORM_ORDER } from '@/lib/constants';
import { PlatformIcon } from './platform';
import { LikeButton, BookmarkButton } from './engagement';
import { StarRating } from './rating';
import type { Startup } from '@/types';

export function StartupCard({ startup }: { startup: Startup }) {
  const platformTypes = Array.from(
    new Set(startup.platforms.map((p) => p.type)),
  ).sort((a, b) => PLATFORM_ORDER.indexOf(a) - PLATFORM_ORDER.indexOf(b));

  return (
    <Link href={`/startups/${startup.slug}`} className="group block h-full">
      <article className="relative h-full flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-accent-300 hover:shadow-card-hover transition-all duration-200">
        {/* Cover */}
        <div className="relative h-28 bg-gradient-brand overflow-hidden">
          {startup.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={startup.coverUrl}
              alt=""
              className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Rocket className="h-8 w-8 text-white/20" />
            </div>
          )}
          {startup.isFeatured && (
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-500 text-white text-[10px] font-bold shadow-glow-accent">
              <Sparkles className="h-3 w-3" /> TOP
            </span>
          )}
          <div className="absolute top-2.5 left-2.5">
            <BookmarkButton startup={startup} variant="card" />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 pt-0">
          {/* Logo overlaps cover */}
          <div className="flex items-end gap-3 -mt-7 mb-3">
            <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 shadow-card flex items-center justify-center overflow-hidden shrink-0">
              {startup.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={startup.logoUrl} alt={startup.title} className="h-full w-full object-cover" />
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

          <h3 className="text-sm font-bold text-brand-900 group-hover:text-accent-700 transition-colors line-clamp-1">
            {startup.title}
          </h3>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-2 min-h-[2rem]">
            {startup.tagline || startup.description}
          </p>
          {startup.ratingCount > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <StarRating value={startup.ratingAvg} size={12} />
              <span className="text-[11px] font-semibold text-slate-600">{startup.ratingAvg.toFixed(1)}</span>
              <span className="text-[11px] text-slate-400">({startup.ratingCount})</span>
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
              <span className="text-[11px] text-slate-400 italic">G&apos;oya bosqichida</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <LikeButton startup={startup} variant="card" />
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
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
