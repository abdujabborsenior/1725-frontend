/**
 * Butun sayt uchun xavfsizlik javob-sarlavhalari. Funksiyani buzmaydigan,
 * standart himoya to'plami:
 *  - X-Frame-Options + CSP frame-ancestors — clickjacking (iframe'ga solishning oldi).
 *  - X-Content-Type-Options nosniff — brauzer content-type'ni "taxmin" qilmasin
 *    (polyglot/soxta rasm skript sifatida bajarilmaydi).
 *  - Referrer-Policy — boshqa saytga to'liq URL (token bo'lishi mumkin) sizmasin.
 *  - Permissions-Policy — geolokatsiya o'chiq; kamera va mikrofon faqat o'zi
 *    (chat ovozli/video xabar va rasm olish uchun) ruxsat.
 *  - HSTS — HTTPS majburiy (brauzer faqat HTTPS'da qo'llaydi; http'da e'tiborsiz).
 *  - object-src 'none' / base-uri 'self' — plagin va base-teg in'yeksiyasini to'sadi.
 */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), geolocation=(), browsing-topics=(), microphone=(self)',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker deploy uchun minimal, mustaqil server chiqishi (.next/standalone).
  // Eslatma: lokal `npm run start` odatdagidek ishlayveradi (dev oqimiga ta'sir yo'q).
  output: 'standalone',
  // Server texnologiyasini oshkor qilmaymiz (X-Powered-By: Next.js olib tashlanadi).
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  // iOS ikonka to'plami — barrel importni to'g'ridan-to'g'ri faylga aylantiradi
  // (`import { Bell } from '@/components/icons'` → `.../icons/bell`), shunda
  // bundle'ga faqat ishlatilgan ikonkalar tushadi.
  modularizeImports: {
    '@/components/icons': {
      transform: '@/components/icons/{{ member }}',
      skipDefaultConversion: true,
    },
  },
  // Production'da console.* (error/warn'dan tashqari) olib tashlanadi.
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },
  images: {
    // Zamonaviy formatlar — kichikroq hajm, tezroq yuklash.
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      // Bunny.net Pull Zone (CDN) — yuklangan barcha rasmlar shu yerdan.
      { protocol: 'https', hostname: '**.b-cdn.net' },
      // Lokal disk fallback (dev) — backend static.
      { protocol: 'http', hostname: 'localhost' },
      // Prod backend (lokal driver ishlatilsa) — domeningizni qo'shing:
      // { protocol: 'https', hostname: 'api.mymarkaz.uz' },
    ],
  },
};

export default nextConfig;
