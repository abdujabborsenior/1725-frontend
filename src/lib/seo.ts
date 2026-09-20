import type { Metadata } from 'next';
import { routing, type AppLocale } from '@/i18n/routing';
import { LOCALE_META, localizePath } from '@/i18n/locales';
import { SITE } from '@/lib/site';

/**
 * SEO yordamchilari — YAGONA manba.
 *
 * Qoidalar (Google Search Central, ko'p tilli saytlar):
 *  · har til versiyasi O'ZINI kanonik ko'rsatadi (ruscha sahifa o'zbekchaga
 *    kanoniklashtirilmaydi — aks holda Google ruscha versiyani indekslamaydi);
 *  · hreflang to'plami har versiyada TO'LIQ va o'zaro (uz ↔ ru ↔ en) +
 *    `x-default` → asosiy til;
 *  · URL'lar absolyut (`metadataBase` orqali), so'rov parametrlarisiz.
 */
export const SITE_URL = SITE.url.replace(/\/$/, '');

/** Absolyut URL: `/startups` → `https://mymarkaz.uz/ru/startups`. */
export function absoluteUrl(locale: AppLocale, path: string): string {
  const localized = localizePath(locale, path);
  return localized === '/' ? SITE_URL : `${SITE_URL}${localized}`;
}

/** Kanonik + hreflang (uz, ru, en, x-default) — sahifa yo'li bo'yicha. */
export function alternatesFor(locale: AppLocale, path: string): Metadata['alternates'] {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = localizePath(l, path);
  languages['x-default'] = localizePath(routing.defaultLocale, path);
  return { canonical: localizePath(locale, path), languages };
}

/** Standart ulashish rasmi (1200×630) — har til o'z shiori bilan. */
/**
 * Tilning OG kodi — noma'lum qiymatda ham YIQILMAYDI (asosiy tilga tushadi).
 * `LOCALE_META[locale]` ni to'g'ridan o'qish prod'da 500 bergan edi.
 */
function ogLocale(locale: AppLocale): string {
  return (LOCALE_META[locale] ?? LOCALE_META[routing.defaultLocale]).og;
}

export function defaultOgImage(locale: AppLocale) {
  return { url: `/og/og-${locale}.png`, width: 1200, height: 630, alt: 'MYMarkaz' };
}

interface PageMetaInput {
  locale: AppLocale;
  /** Prefikssiz ichki yo'l: `/startups/123` */
  path: string;
  title: string;
  description: string;
  /** Kontentning o'z rasmi (muqova/avatar); bo'lmasa — standart OG rasm */
  image?: string | null;
  /** Shaxsiy/texnik sahifalar: indekslanmaydi, lekin havolalar kuzatiladi */
  noindex?: boolean;
  /** `title.template` ni chetlab o'tish (bosh sahifa — brend nomi bilan to'liq) */
  absoluteTitle?: boolean;
  type?: 'website' | 'article' | 'profile';
}

/**
 * Sahifa metadata'si: sarlavha, tavsif, kanonik+hreflang, Open Graph,
 * Twitter va robots — bitta chaqiriqda, hamma sahifada bir xil qoida bilan.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
  noindex,
  absoluteTitle,
  type = 'website',
}: PageMetaInput): Metadata {
  const images = image
    ? [{ url: image, alt: title }]
    : [defaultOgImage(locale)];
  const desc = clampDescription(description);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    alternates: alternatesFor(locale, path),
    openGraph: {
      type,
      siteName: 'MYMarkaz',
      title,
      description: desc,
      url: localizePath(locale, path),
      locale: ogLocale(locale),
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => ogLocale(l)),
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: images.map((i) => i.url),
    },
    robots: noindex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  };
}

/**
 * Meta tavsif ~160 belgidan oshmasin (Google snippet'ni kesadi) — so'z
 * o'rtasidan emas, oxirgi to'liq so'zdan kesiladi. Foydalanuvchi matnidagi
 * ortiqcha bo'shliq/qator tashlashlar bitta bo'shliqqa yig'iladi.
 */
export function clampDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:—–-]+$/, '')}…`;
}

/* ── Structured data (JSON-LD) ─────────────────────────────────── */

export function organizationJsonLd(locale: AppLocale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'MYMarkaz',
    url: absoluteUrl(locale, '/'),
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/icons/icon-512.png`,
      width: 512,
      height: 512,
    },
    email: SITE.contact.email,
    telephone: SITE.contact.phoneE164,
    sameAs: [SITE.contact.telegram],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      telephone: SITE.contact.phoneE164,
      email: SITE.contact.email,
      areaServed: 'UZ',
      availableLanguage: ['uz', 'ru', 'en'],
    },
    address: { '@type': 'PostalAddress', addressLocality: 'Tashkent', addressCountry: 'UZ' },
  };
}

export function websiteJsonLd(locale: AppLocale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'MYMarkaz',
    url: absoluteUrl(locale, '/'),
    inLanguage: locale,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

/** Non-empty elementlar bilan BreadcrumbList. */
export function breadcrumbJsonLd(
  locale: AppLocale,
  items: { name: string; path: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(locale, item.path),
    })),
  };
}

/* ── Sahifaga xos strukturali ma'lumot ─────────────────────────────
   Qoida: FAQAT haqiqatni belgilaymiz. Har startapni `Product` deb yozish
   (reyting yulduzchalari uchun) — Google "spammy structured markup"
   siyosatiga zid. Shuning uchun `SoftwareApplication` faqat loyihaning
   HAQIQIY do'kon/ilova havolasi bo'lganda ishlatiladi; qolganida — tinch
   `WebPage` + `BreadcrumbList`. */

interface StartupLd {
  title: string;
  slug: string;
  tagline: string | null;
  description: string;
  coverUrl: string | null;
  logoUrl: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  ratingAvg: number;
  ratingCount: number;
  platforms: { type: string; url: string }[];
}

const APP_STORES = new Set(['appstore', 'playstore', 'app_store', 'google_play']);

export function startupJsonLd(locale: AppLocale, s: StartupLd) {
  const url = absoluteUrl(locale, `/startups/${s.slug}`);
  const image = s.coverUrl ?? s.logoUrl ?? undefined;
  const isApp = s.platforms.some((p) => APP_STORES.has(String(p.type).toLowerCase()));

  const main: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': isApp ? 'SoftwareApplication' : 'WebPage',
    '@id': `${url}#item`,
    url,
    name: s.title,
    description: clampDescription(s.tagline || s.description, 300),
    inLanguage: locale,
    ...(image ? { image } : {}),
    ...(s.category ? { applicationCategory: s.category } : {}),
    datePublished: s.createdAt,
    dateModified: s.updatedAt,
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };
  if (isApp) {
    main.operatingSystem = s.platforms
      .filter((p) => APP_STORES.has(String(p.type).toLowerCase()))
      .map((p) => (String(p.type).toLowerCase().includes('app') ? 'iOS' : 'Android'))
      .join(', ');
    // Bepul emasligini bilmaymiz — narx BELGILANMAYDI (yolg'on ma'lumot bo'lardi)
    if (s.ratingCount > 0) {
      main.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: Number(s.ratingAvg.toFixed(1)),
        ratingCount: s.ratingCount,
        bestRating: 10,
        worstRating: 1,
      };
    }
  }
  return main;
}

interface ProblemLd {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
  imageUrls: string[];
  author: { fullName: string; username: string | null } | null;
  solutionCount: number;
}

/** Muammo — hamjamiyat muhokamasi: Google `DiscussionForumPosting` ni qo'llaydi. */
export function problemJsonLd(locale: AppLocale, p: ProblemLd) {
  const url = absoluteUrl(locale, `/problems/${p.id}`);
  const image = p.imageUrls.find((u) => /^https?:\/\//i.test(u));
  return {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    '@id': `${url}#post`,
    url,
    headline: p.title,
    articleBody: clampDescription(p.description, 500),
    inLanguage: locale,
    datePublished: p.createdAt,
    dateModified: p.updatedAt,
    ...(image ? { image } : {}),
    ...(p.author
      ? {
          author: {
            '@type': 'Person',
            name: p.author.fullName,
            ...(p.author.username ? { url: absoluteUrl(locale, `/u/${p.author.username}`) } : {}),
          },
        }
      : {}),
    interactionStatistic: [
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: p.likeCount },
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/CommentAction', userInteractionCount: p.solutionCount },
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/ViewAction', userInteractionCount: p.viewCount },
    ],
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };
}

interface ProfileLd {
  username: string;
  fullName: string;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  followerCount: number;
}

export function profileJsonLd(locale: AppLocale, u: ProfileLd) {
  const url = absoluteUrl(locale, `/u/${u.username}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${url}#profile`,
    url,
    inLanguage: locale,
    dateCreated: u.createdAt,
    mainEntity: {
      '@type': 'Person',
      '@id': `${url}#person`,
      name: u.fullName,
      alternateName: u.username,
      url,
      ...(u.headline ? { jobTitle: u.headline } : {}),
      ...(u.bio ? { description: clampDescription(u.bio, 300) } : {}),
      ...(u.avatarUrl ? { image: u.avatarUrl } : {}),
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/FollowAction',
        userInteractionCount: u.followerCount,
      },
    },
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };
}
