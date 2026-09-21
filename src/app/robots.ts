import type { MetadataRoute } from 'next';

import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';

/**
 * `robots.txt`.
 *
 * Yopiladigan joylar — SHAXSIY yoki indeksga qiymat qo'shmaydigan sahifalar
 * (sozlamalar, suhbatlar, bildirishnomalar, to'lov, investor kabineti).
 * Ularning har biri metadata'da ham `noindex` (ikki qatlam: robots.txt
 * kraulni to'sadi, meta esa boshqa yo'l bilan topilganini indeksdan chiqaradi).
 *
 * ⚠️ Yo'llar til prefiksi bilan ham keladi (`/ru/settings`) — shuning uchun
 * har biri uchun prefikssiz va prefiksli naqsh yoziladi.
 */
const PRIVATE = [
  '/settings',
  '/profile',
  '/messages',
  '/notifications',
  '/billing',
  '/investor',
  '/startups/create',
  '/problems/create',
  '/verify-email',
  '/reset-password',
  '/forgot-password',
];

export default function robots(): MetadataRoute.Robots {
  // Barcha prefiksli tillar (ru/en/ar/zh) — `routing.locales` dan: til
  // qo'shilganda ro'yxat o'zi kengayadi (ilgari ar/zh unutilib qolgan edi)
  const prefixes = routing.locales.filter((l) => l !== routing.defaultLocale);
  const disallow = PRIVATE.flatMap((p) => [p, ...prefixes.map((l) => `/${l}${p}`)]);
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Qidiruv/filtr parametrlari — bir xil kontentning cheksiz nusxalari
        disallow: [...disallow, '/*?page=', '/*?sort=', '/*?category=', '/*?q='],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
