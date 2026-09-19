import { SITE_URL } from '@/lib/seo';

/**
 * Sitemap INDEKSI (`/sitemap.xml`).
 *
 * `sitemap.ts` dagi `generateSitemaps` bo'limlarni `/sitemap/<id>.xml` qilib
 * beradi, lekin Next 14 ularning INDEKSINI yasamaydi — `robots.txt` esa
 * `/sitemap.xml` ni ko'rsatadi. Busiz Search Console "sitemap topilmadi"
 * deb qaytarardi.
 *
 * Indeksda `lastmod` ATAYLAB yo'q: bo'limlar ichidagi yozuvlarning o'z
 * `lastmod` i bor, indeksdagi taxminiy sana esa botga yolg'on signal berardi.
 */
export const revalidate = 3600;

const SECTIONS = [0, 1, 2, 3, 4];

export function GET() {
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    SECTIONS.map((id) => `  <sitemap><loc>${SITE_URL}/sitemap/${id}.xml</loc></sitemap>\n`).join('') +
    `</sitemapindex>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
