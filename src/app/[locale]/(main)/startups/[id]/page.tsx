import type { Metadata } from 'next';
import { cache } from 'react';
import { preload } from 'react-dom';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Startup } from '@/types';
import type { AppLocale } from '@/i18n/routing';
import { fetchInitial } from '@/lib/server-api';
import { breadcrumbJsonLd, pageMetadata, startupJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { StartupDetailClient } from './startup-detail-client';
import { Scope } from '@/i18n/scope';

/** SSR: startap kartasi (cover LCP) HTML bilan keladi — client flaglarni yangilaydi. */
export const revalidate = 30;

type Params = { locale: AppLocale; id: string };

/**
 * Metadata va sahifa BITTA so'rovdan foydalanadi. `fetchInitial` o'z `signal`i
 * (timeout) bilan ketgani uchun Next/React fetch memoizatsiyasi uni birlashtirmaydi
 * — shuning uchun so'rov doirasida React `cache` bilan eslab qolinadi.
 */
const loadStartup = cache((id: string) =>
  fetchInitial<Startup>(`/startups/${encodeURIComponent(id)}`),
);

/** Ulashish rasmi faqat absolyut URL bo'lsa (muqova, bo'lmasa logo) — aks holda standart OG. */
function shareImage(startup: Startup): string | null {
  return (
    [startup.coverUrl, startup.logoUrl].find((u): u is string => !!u && /^https?:\/\//i.test(u)) ??
    null
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = params;
  // `fetchInitial` tilni `getLocale()` dan oladi — statik render uchun oldindan beriladi
  setRequestLocale(locale);
  const [t, startup] = await Promise.all([
    getTranslations({ locale, namespace: 'meta.startups' }),
    loadStartup(id),
  ]);

  if (!startup) {
    return pageMetadata({
      locale,
      path: `/startups/${id}`,
      title: t('detail.notFoundTitle'),
      description: t('list.description'),
      noindex: true,
    });
  }

  // Tavsif: shior + to'liq matn (pageMetadata ~160 belgida so'z chegarasidan kesadi)
  const lead = startup.tagline?.trim().replace(/[.\s]+$/, '');
  const body = startup.description?.trim() ?? '';
  const description = lead ? (body ? `${lead} — ${body}` : lead) : body || t('list.description');

  return pageMetadata({
    locale,
    // Kanonik manzil — slug (kartalar shu manzilga olib boradi): id bilan ochilsa ham bitta URL
    path: `/startups/${startup.slug || id}`,
    title: startup.title,
    description,
    image: shareImage(startup),
  });
}

export default async function StartupDetailPage({ params }: { params: Params }) {
  setRequestLocale(params.locale);
  const initialStartup = await loadStartup(params.id);
  // LCP — cover: head'dan preload (brauzer uni CSS bilan parallel, yuqori
  // ustuvorlikda oladi; HTML ichidan kech topilmaydi)
  if (initialStartup?.coverUrl) {
    preload(initialStartup.coverUrl, { as: 'image', fetchPriority: 'high' });
  }
  const t = await getTranslations({ locale: params.locale, namespace: 'nav.links' });
  return (
    <Scope name="startupDetail">
      {initialStartup && (
        <JsonLd
          data={[
            startupJsonLd(params.locale, {
              title: initialStartup.title,
              slug: initialStartup.slug,
              tagline: initialStartup.tagline,
              description: initialStartup.description,
              coverUrl: initialStartup.coverUrl,
              logoUrl: initialStartup.logoUrl,
              category: initialStartup.category,
              createdAt: initialStartup.createdAt,
              updatedAt: initialStartup.updatedAt,
              ratingAvg: initialStartup.ratingAvg,
              ratingCount: initialStartup.ratingCount,
              platforms: initialStartup.platforms,
            }),
            breadcrumbJsonLd(params.locale, [
              { name: t('startups'), path: '/startups' },
              { name: initialStartup.title, path: `/startups/${initialStartup.slug}` },
            ]),
          ]}
        />
      )}
      <StartupDetailClient initialStartup={initialStartup} />
    </Scope>
  );
}
