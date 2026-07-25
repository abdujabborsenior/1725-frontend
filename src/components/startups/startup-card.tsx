'use client';

import Link from 'next/link';
import { Eye, StarFill } from '@/components/icons';
import { PLATFORM_ORDER } from '@/lib/constants';
import { PlatformIcon } from './platform';
import { LikeCount, BookmarkButton } from './engagement';
import { CoverMedia } from './cover-media';
import { StartupLogo } from './startup-logo';
import { RatingValue } from './rating';
import type { Startup } from '@/types';

/* Kategoriya → iOS system rangi. Har karta o'z sohasining rangini oladi:
   chip, muqova ostidagi imzo chizig'i va rasm bo'lmaganda muqova sirti.
   Palitra Apple system ranglaridan — dekor emas, tasnif belgisi. */
const TINTS = [
  { chip: 'bg-accent-50 text-accent-700', bar: 'bg-accent-500', cover: 'bg-gradient-to-br from-accent-400 to-accent-600' },
  { chip: 'bg-iris-50 text-iris-700', bar: 'bg-iris-500', cover: 'bg-gradient-to-br from-iris-400 to-iris-600' },
  { chip: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-400', cover: 'bg-gradient-to-br from-emerald-400 to-emerald-600' },
  { chip: 'bg-amber-50 text-amber-700', bar: 'bg-amber-500', cover: 'bg-gradient-to-br from-amber-400 to-amber-600' },
  { chip: 'bg-pink-50 text-pink-700', bar: 'bg-pink-500', cover: 'bg-gradient-to-br from-pink-400 to-pink-600' },
  { chip: 'bg-violet-50 text-violet-700', bar: 'bg-violet-500', cover: 'bg-gradient-to-br from-violet-400 to-violet-600' },
  { chip: 'bg-sky-50 text-sky-700', bar: 'bg-sky-500', cover: 'bg-gradient-to-br from-sky-400 to-sky-600' },
  { chip: 'bg-teal-50 text-teal-700', bar: 'bg-teal-500', cover: 'bg-gradient-to-br from-teal-400 to-teal-600' },
] as const;

/* Ma'noga bog'langan kategoriyalar (bazadagi real nomlar + variantlari).
   Ro'yxatda yo'q kategoriya ham RANGSIZ qolmaydi — nomi bo'yicha barqaror
   hash bilan shu palitradan rang oladi (yangi kategoriya qo'shilsa ham). */
const CATEGORY_SLOT: Record<string, number> = {
  Texnologiya: 0, Tech: 0, FinTech: 0, Fintex: 0, Fintech: 0,
  AI: 1, 'AI / ML': 1, 'AI/ML': 1, ML: 1,
  AgroTech: 2, GreenTech: 2, Agro: 2, Ekologiya: 2,
  'E-commerce': 3, Ecommerce: 3, Savdo: 3, Marketplace: 3,
  HealthTech: 4, "Sog'liq": 4, MedTech: 4,
  EdTech: 5, "Ta'lim": 5, "O'yinlar": 5, Games: 5,
  Ijtimoiy: 6, Media: 6, Social: 6, Sayohat: 6,
  Logistika: 7, Transport: 7, Delivery: 7,
};

function slotFor(category: string): number {
  const known = CATEGORY_SLOT[category];
  if (known !== undefined) return known;
  let h = 0;
  for (let i = 0; i < category.length; i++) h = (h * 31 + category.charCodeAt(i)) | 0;
  return Math.abs(h) % TINTS.length;
}

const NEUTRAL_TINT = {
  chip: 'bg-fill-tertiary text-slate-600',
  bar: 'bg-slate-300',
  cover: 'bg-gradient-to-br from-slate-300 to-slate-400',
};

export function categoryTint(category?: string | null): { chip: string; bar: string; cover: string } {
  const key = category?.trim();
  return key ? TINTS[slotFor(key)] : NEUTRAL_TINT;
}

/**
 * Startap kartasi — App Store mahsulot kartasi ritmida, "Today" interaksiyasi
 * bilan: hover'da butun karta yumshoq ko'tariladi (soya + 1.5% kattarish),
 * muqova ichida rasm sekin kattaradi, bosilganda karta ichkariga "cho'kadi".
 *
 * `priority` — fold ichidagi birinchi kartalar uchun: cover LCP nomzodi bo'lgani
 * sababli u eager + fetchpriority=high yuklanadi; qolganlari lazy.
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
  const tint = categoryTint(startup.category);

  return (
    <Link href={`/startups/${startup.slug}`} className="group block h-full">
      <article className="card-today flex h-full flex-col overflow-hidden rounded-ios-2xl bg-white shadow-card">
        {/* Muqova — kattaroq (h-40); rasm hover'da sekin kattaradi */}
        <div className="relative h-40 overflow-hidden bg-slate-100">
          <div className="cover-zoom h-full w-full">
            <CoverMedia
              coverUrl={startup.coverUrl}
              videoUrl={startup.videoUrl}
              title={startup.title}
              priority={priority}
              tintClass={tint.cover}
            />
          </div>
          {startup.isFeatured && (
            <span className="material-dark absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption-2 font-semibold text-white">
              <StarFill className="h-2.5 w-2.5 text-amber-400" /> TOP
            </span>
          )}
          <div className="absolute left-3 top-3">
            <BookmarkButton startup={startup} variant="card" />
          </div>
          {/* Kategoriya rang chizig'i — muqova pastida, kartaning imzosi */}
          <span className={`absolute inset-x-0 bottom-0 h-[3px] ${tint.bar}`} aria-hidden />
        </div>

        {/* Tana */}
        <div className="flex-1 px-5 pb-5">
          {/* Ikonka muqova ustiga chiqadi — `relative z-10` shart */}
          <div className="relative z-10 -mt-9 mb-3 flex items-end justify-between gap-3">
            <StartupLogo
              src={startup.logoUrl}
              title={startup.title}
              size={68}
              className="!rounded-[15px] shadow-card ring-1 ring-black/[0.06]"
            />
            {startup.category && (
              <span
                className={`mb-1 truncate rounded-full px-2.5 py-1 text-caption-1 font-medium ${tint.chip}`}
              >
                {startup.category}
              </span>
            )}
          </div>

          <h3 className="truncate text-title-3 font-semibold text-brand-900">{startup.title}</h3>
          <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-subhead leading-snug text-slate-500">
            {startup.tagline || startup.description}
          </p>
          {startup.ratingCount > 0 && (
            <div className="mt-2.5">
              <RatingValue value={startup.ratingAvg} count={startup.ratingCount} size="sm" />
            </div>
          )}
        </div>

        {/* Meta qatori */}
        <div className="hairline-t flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5 text-slate-400">
            {platformTypes.length > 0 ? (
              platformTypes.map((t) => <PlatformIcon key={t} type={t} className="h-[18px] w-[18px]" />)
            ) : (
              <span className="text-footnote text-slate-400">G&apos;oya bosqichida</span>
            )}
          </div>
          <div className="flex items-center gap-3.5">
            {/* Ro'yxatda faqat son — yoqtirish amali detal sahifada */}
            <LikeCount count={startup.likeCount ?? 0} />
            <span className="flex items-center gap-1 text-footnote tabular-nums text-slate-500">
              <Eye className="h-4 w-4" /> {startup.viewCount}
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
      <div className="skeleton h-40" />
      <div className="px-5 pb-5">
        <div className="skeleton -mt-9 mb-3 h-[68px] w-[68px] rounded-[15px]" />
        <div className="skeleton mb-2 h-5 w-2/3 rounded-md" />
        <div className="skeleton h-4 w-full rounded-md" />
      </div>
      <div className="hairline-t flex justify-between px-5 py-3">
        <div className="skeleton h-4 w-16 rounded-md" />
        <div className="skeleton h-4 w-10 rounded-md" />
      </div>
    </div>
  );
}
