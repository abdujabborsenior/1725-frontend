import type { MetadataRoute } from 'next';

import { routing } from '@/i18n/routing';
import { localizePath } from '@/i18n/locales';
import { SITE_URL } from '@/lib/seo';
import { fetchInitial } from '@/lib/server-api';

/**
 * `sitemap.xml` — BARCHA tillar, har URL uchun o'zaro `hreflang`
 * (`xhtml:link`) bilan. Google ko'p tilli saytda aynan shu juftlikni kutadi:
 * har til versiyasi mustaqil URL, lekin bir-birini ko'rsatadi.
 *
 * Bo'limlarga BO'LINGAN (`generateSitemaps`): bitta fayl 50 000 URL / 50 MB
 * chegarasidan oshmasligi kerak, ko'p tilli alternates bilan esa bu chegara
 * tez yaqinlashadi. Next o'zi sitemap indeksini yasaydi.
 *
 * Ma'lumot backend'dan (`GET /seo/sitemap`, 1 soat server keshi) — faqat
 * OMMAVIY kontent. Backend javob bermasa bo'lim bo'sh qaytadi (fail-open):
 * statik bo'lim baribir chiqadi va bot xato olmaydi.
 */
export const revalidate = 3600;

interface Entry {
  key: string;
  updatedAt: string;
}
interface SeoFeed {
  startups: Entry[];
  problems: Entry[];
  users: Entry[];
  clusters: Entry[];
}

/** 0 — statik sahifalar, 1 — startaplar, 2 — muammolar, 3 — profillar, 4 — bozor. */
export function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
}

/** Bitta ichki yo'l → ko'p tilli yozuv (kanonik uz, qolgan tillar alternates). */
function entry(
  path: string,
  opts: { lastModified?: string | Date; changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency']; priority?: number } = {},
): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = SITE_URL + localizePath(l, path);
  languages['x-default'] = SITE_URL + localizePath(routing.defaultLocale, path);
  return {
    url: SITE_URL + localizePath(routing.defaultLocale, path),
    ...opts,
    alternates: { languages },
  };
}

const STATIC: Array<[string, number, MetadataRoute.Sitemap[number]['changeFrequency']]> = [
  ['/', 1, 'daily'],
  ['/startups', 0.9, 'daily'],
  ['/problems', 0.9, 'daily'],
  ['/solutions', 0.7, 'daily'],
  ['/leaderboard', 0.7, 'daily'],
  ['/market', 0.7, 'weekly'],
  ['/discover', 0.6, 'weekly'],
  ['/polls', 0.5, 'weekly'],
  ['/ai', 0.8, 'weekly'],
  ['/login', 0.3, 'yearly'],
  ['/register', 0.4, 'yearly'],
];

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  if (id === 0) {
    const now = new Date();
    return STATIC.map(([path, priority, changeFrequency]) =>
      entry(path, { lastModified: now, changeFrequency, priority }),
    );
  }

  const feed = await fetchInitial<SeoFeed>('/seo/sitemap', 3600);
  if (!feed) return [];

  const map = (
    items: Entry[] | undefined,
    prefix: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  ) =>
    (items ?? []).map((it) =>
      entry(`${prefix}/${encodeURIComponent(it.key)}`, {
        lastModified: it.updatedAt,
        changeFrequency,
        priority,
      }),
    );

  if (id === 1) return map(feed.startups, '/startups', 0.8, 'weekly');
  if (id === 2) return map(feed.problems, '/problems', 0.7, 'weekly');
  if (id === 3) return map(feed.users, '/u', 0.5, 'weekly');
  if (id === 4) return map(feed.clusters, '/market', 0.6, 'weekly');
  return [];
}
