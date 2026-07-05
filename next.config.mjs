/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker deploy uchun minimal, mustaqil server chiqishi (.next/standalone).
  // Eslatma: lokal `npm run start` odatdagidek ishlayveradi (dev oqimiga ta'sir yo'q).
  output: 'standalone',
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
