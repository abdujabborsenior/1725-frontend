'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Eye, Calendar, Users, Rocket, Tag, ExternalLink, Share2, Check, Flag,
  PencilLine,
} from 'lucide-react';
import { startupsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { PLATFORM_ORDER } from '@/lib/constants';
import { StoreButton } from '@/components/startups/platform';
import { StartupCard } from '@/components/startups/startup-card';
import { LikeButton, BookmarkButton } from '@/components/startups/engagement';
import { Reviews } from '@/components/startups/reviews';
import { StarRating } from '@/components/startups/rating';
import { ReportDialog } from '@/components/reports/report-dialog';
import toast from 'react-hot-toast';

export default function StartupDetailPage() {
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
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-48 rounded-2xl bg-slate-100" />
        <div className="h-8 w-1/2 rounded bg-slate-100" />
        <div className="h-24 rounded bg-slate-100" />
      </div>
    );
  }

  if (isError || !startup) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Rocket className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-brand-900 font-semibold">Startap topilmadi</p>
        <button
          onClick={() => router.push('/startups')}
          className="mt-4 text-sm font-semibold text-accent-700 hover:underline"
        >
          Startaplarga qaytish
        </button>
      </div>
    );
  }

  const orderedPlatforms = [...startup.platforms].sort(
    (a, b) => PLATFORM_ORDER.indexOf(a.type) - PLATFORM_ORDER.indexOf(b.type),
  );

  // Egasi (yoki admin) — o'z startapini tahrirlashi mumkin
  const isOwner =
    !!user &&
    (startup.createdById === user.id ||
      user.role === 'superadmin' || user.role === 'analyzer');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-900 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Orqaga
      </button>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Cover banner */}
        <div className="relative h-44 md:h-56 bg-gradient-brand">
          {startup.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={startup.coverUrl} alt="" className="h-full w-full object-cover opacity-90" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="relative z-10 px-5 md:px-8 pb-6">
          {/* Logo — faqat shu element cover ustiga chiqadi */}
          <div className="relative z-10 -mt-12 mb-3 inline-flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
            {startup.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={startup.logoUrl} alt={startup.title} className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-brand-900">
                {startup.title.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {/* Sarlavha + shior — oq maydonda, to'liq ko'rinadi */}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-900">{startup.title}</h1>
          {startup.tagline && (
            <p className="mt-1 text-sm text-slate-600">{startup.tagline}</p>
          )}

          {/* Meta row */}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            {startup.category && (
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
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
              <span className="inline-flex items-center gap-1.5">
                <StarRating value={startup.ratingAvg} size={14} />
                <span className="font-semibold text-brand-900">{startup.ratingAvg.toFixed(1)}</span>
                <span className="text-slate-400">({startup.ratingCount})</span>
              </span>
            )}
          </div>

          {/* Actions: like / bookmark / share */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <LikeButton startup={startup} />
            <BookmarkButton startup={startup} />
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold hover:text-brand-900 hover:border-slate-300 transition-all btn-lift"
            >
              {copied ? <Check className="h-4 w-4 text-accent-600" /> : <Share2 className="h-4 w-4" />}
              {copied ? 'Nusxalandi' : 'Ulashish'}
            </button>
            <button
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-500 font-semibold hover:text-rose-600 hover:border-rose-200 transition-all btn-lift"
            >
              <Flag className="h-4 w-4" /> Shikoyat
            </button>
            {isOwner && (
              <Link
                href={`/startups/${startup.id}/edit`}
                className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold hover:text-brand-900 hover:border-slate-300 transition-all btn-lift"
              >
                <PencilLine className="h-4 w-4" /> Tahrirlash
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
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
              <Rocket className="h-4 w-4" /> Bu startap hozircha g&apos;oya/ishlanma bosqichida
            </div>
          )}
        </div>
      </div>

      {/* Promo video */}
      {startup.videoUrl && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-brand-900">Tanishtiruv video</h2>
          <video
            src={startup.videoUrl}
            controls
            playsInline
            className="w-full max-h-[28rem] rounded-2xl border border-slate-200 bg-black"
          />
        </section>
      )}

      {/* Screenshots */}
      {startup.screenshots.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-brand-900">Skrinshotlar</h2>
          <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x">
            {startup.screenshots.map((url, i) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 snap-start rounded-xl overflow-hidden border border-slate-200 bg-surface-soft hover:border-accent-300 transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${startup.title} skrinshot ${i + 1}`}
                  className="h-72 w-auto object-cover"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Description */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-brand-900">Startap haqida</h2>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
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
              className="px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200"
            >
              #{t}
            </span>
          ))}
        </section>
      )}

      {/* All links list (compact) */}
      {orderedPlatforms.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-brand-900">Barcha havolalar</h2>
          <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {orderedPlatforms.map((p, i) => (
              <a
                key={`link-${i}`}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handlePlatformClick}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
              >
                {p.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.iconUrl} alt="" className="h-8 w-8 rounded-lg object-cover border border-slate-200" />
                ) : (
                  <span className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                    {(p.label || p.url).charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-brand-900 truncate">
                    {p.label || p.url}
                  </span>
                  <span className="block text-xs text-slate-400 truncate">{p.url}</span>
                </span>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-accent-600 transition-colors" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related && related.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-brand-900">O&apos;xshash startaplar</h2>
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
