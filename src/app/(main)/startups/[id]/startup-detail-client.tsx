'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type { Startup } from '@/types';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft, ChevronRight, Eye, Calendar, Users, Rocket, Tag, Share2, Check, Flag,
  PencilLine,
} from '@/components/icons';
import { startupsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { PLATFORM_ORDER } from '@/lib/constants';
import { StoreButton } from '@/components/startups/platform';
import { StartupCard } from '@/components/startups/startup-card';
import { LikeButton, BookmarkButton } from '@/components/startups/engagement';
import { Reviews } from '@/components/startups/reviews';
import { RatingValue } from '@/components/startups/rating';
import { CoverMedia, isPlayableVideo } from '@/components/startups/cover-media';
import { StartupLogo } from '@/components/startups/startup-logo';
import { cn } from '@/lib/utils';
import { ReportDialog } from '@/components/reports/report-dialog';
import { EmptyState } from '@/components/ui/page-header';
import toast from 'react-hot-toast';

export function StartupDetailClient({ initialStartup }: { initialStartup: Startup | null }) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const slug = params.id;

  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const { data: startup, isLoading, isError } = useQuery({
    queryKey: ['startup', slug],
    queryFn: () => startupsApi.findOne(slug),
    enabled: !!slug,
    // SSR'dan kelgan boshlang'ich kontent; shaxsiy flaglar background'da yangilanadi
    initialData: initialStartup ?? undefined,
    initialDataUpdatedAt: 0,
  });

  const { data: related } = useQuery({
    queryKey: ['startup-related', slug],
    queryFn: () => startupsApi.related(slug),
    enabled: !!slug,
    staleTime: 60_000,
  });

  function handlePlatformClick() {
    if (startup) void startupsApi.registerClick(startup.id).catch(() => undefined);
  }

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: startup?.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Havola nusxalandi');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* foydalanuvchi bekor qildi */
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="skeleton h-48 rounded-ios-2xl" />
        <div className="skeleton h-8 w-1/2 rounded-md" />
        <div className="skeleton h-24 rounded-ios-lg" />
      </div>
    );
  }

  if (isError || !startup) {
    return (
      <div className="mx-auto max-w-4xl">
        <EmptyState
          icon={<Rocket />}
          title="Startap topilmadi"
          action={
            <button
              onClick={() => router.push('/startups')}
              className="tappable text-body font-medium text-accent-700"
            >
              Startaplarga qaytish
            </button>
          }
        />
      </div>
    );
  }

  const orderedPlatforms = [...startup.platforms].sort(
    (a, b) => PLATFORM_ORDER.indexOf(a.type) - PLATFORM_ORDER.indexOf(b.type),
  );

  const hasCoverVideo = isPlayableVideo(startup.videoUrl);

  // Egasi (yoki admin) — o'z startapini tahrirlashi mumkin
  const isOwner =
    !!user &&
    (startup.createdById === user.id ||
      user.role === 'superadmin' || user.role === 'analyzer');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => router.back()}
        className="tappable -ml-1 flex items-center gap-0.5 text-body text-accent-700"
      >
        <ChevronLeft className="h-[19px] w-[19px]" strokeWidth={3} />
        Orqaga
      </button>

      {/* Hero */}
      <div className="overflow-hidden rounded-ios-2xl bg-white">
        {/* Cover banner — rasm yoki video (bosilganda ijro boshlanadi) */}
        <div className="relative h-44 md:h-56">
          <CoverMedia
            coverUrl={startup.coverUrl}
            videoUrl={startup.videoUrl}
            title={startup.title}
            priority
            size="lg"
          />
          {/* Gradient faqat rasm ustida — video boshqaruvlarini to'smasin */}
          {!hasCoverVideo && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          )}
        </div>

        <div className="relative z-10 px-5 md:px-8 pb-6">
          {/* Logo — faqat shu element cover ustiga chiqadi */}
          {/* Video muqovada logo ustiga chiqmaydi — player boshqaruvlarini to'sardi */}
          <StartupLogo
            src={startup.logoUrl}
            title={startup.title}
            size={96}
            className={cn(
              'relative z-10 mb-3 !rounded-[22px] shadow-card ring-1 ring-black/[0.06]',
              hasCoverVideo ? 'mt-4' : '-mt-12',
            )}
          />
          {/* Sarlavha + shior — oq maydonda, to'liq ko'rinadi */}
          <h1 className="text-title-1 font-bold tracking-tight text-brand-900 md:text-large-title">
            {startup.title}
          </h1>
          {startup.tagline && <p className="mt-1 text-callout text-slate-500">{startup.tagline}</p>}

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-footnote text-slate-500">
            {startup.category && (
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <Tag className="h-3.5 w-3.5 text-accent-600" /> {startup.category}
              </span>
            )}
            {startup.teamName && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> {startup.teamName}
              </span>
            )}
            {startup.foundedYear && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> {startup.foundedYear}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" /> {startup.viewCount} ko&apos;rishlar
            </span>
            {startup.ratingCount > 0 && (
              <RatingValue value={startup.ratingAvg} count={startup.ratingCount} size="sm" />
            )}
          </div>

          {/* Actions: like / bookmark / share */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <LikeButton startup={startup} />
            <BookmarkButton startup={startup} />
            <button
              onClick={handleShare}
              className="tappable inline-flex h-9 items-center gap-1.5 rounded-full bg-fill-tertiary px-3.5 text-subhead font-medium text-slate-600"
            >
              {copied ? (
                <Check className="h-[17px] w-[17px] text-accent-600" strokeWidth={2.6} />
              ) : (
                <Share2 className="h-[17px] w-[17px]" />
              )}
              {copied ? 'Nusxalandi' : 'Ulashish'}
            </button>
            <button
              onClick={() => setReportOpen(true)}
              className="tappable inline-flex h-9 items-center gap-1.5 rounded-full bg-fill-tertiary px-3.5 text-subhead font-medium text-slate-600"
            >
              <Flag className="h-[17px] w-[17px]" /> Shikoyat
            </button>
            {isOwner && (
              <Link
                href={`/startups/${startup.id}/edit`}
                className="tappable inline-flex h-9 items-center gap-1.5 rounded-full bg-fill-tertiary px-3.5 text-subhead font-medium text-slate-600"
              >
                <PencilLine className="h-[17px] w-[17px]" /> Tahrirlash
              </Link>
            )}
          </div>
          <ReportDialog
            open={reportOpen}
            onClose={() => setReportOpen(false)}
            targetType="startup"
            targetId={startup.id}
          />

          {/* Store buttons */}
          {orderedPlatforms.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {orderedPlatforms.map((p, i) => (
                <StoreButton
                  key={`${p.type}-${i}`}
                  platform={p}
                  onClickCapture={handlePlatformClick}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 inline-flex items-center gap-2 rounded-ios-md bg-amber-50 px-4 py-2.5 text-subhead text-amber-700">
              <Rocket className="h-[17px] w-[17px]" /> Bu startap hozircha g&apos;oya/ishlanma
              bosqichida
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <section className="space-y-3">
        <h2 className="text-title-2 font-semibold text-brand-900">Startap haqida</h2>
        <div className="rounded-ios-2xl bg-white p-5 md:p-6">
          <p className="whitespace-pre-line text-body leading-relaxed text-slate-600">
            {startup.description}
          </p>
        </div>
      </section>

      {/* Reviews */}
      <Reviews startup={startup} />

      {/* Tags */}
      {startup.tags.length > 0 && (
        <section className="flex flex-wrap gap-2">
          {startup.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-fill-tertiary px-3 py-1 text-footnote font-medium text-slate-600"
            >
              #{t}
            </span>
          ))}
        </section>
      )}

      {/* All links list (compact) */}
      {orderedPlatforms.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-title-2 font-semibold text-brand-900">Barcha havolalar</h2>
          <div className="ios-list" style={{ ['--row-inset' as string]: '3.75rem' }}>
            {orderedPlatforms.map((p, i) => (
              <a
                key={`link-${i}`}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handlePlatformClick}
                className="ios-row"
              >
                {p.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.iconUrl} alt="" className="h-8 w-8 rounded-[8px] object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-fill-tertiary text-footnote font-semibold text-slate-500">
                    {(p.label || p.url).charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body text-brand-900">
                    {p.label || p.url}
                  </span>
                  <span className="block truncate text-footnote text-slate-500">{p.url}</span>
                </span>
                <ChevronRight className="h-[15px] w-[15px] shrink-0 text-slate-300" strokeWidth={3} />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related && related.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-title-2 font-semibold text-brand-900">O&apos;xshash startaplar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.slice(0, 4).map((s) => (
              <StartupCard key={s.id} startup={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
