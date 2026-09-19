import type { MetadataRoute } from 'next';

/**
 * PWA manifesti. Til NEYTRAL: manifest bitta bo'ladi va uni brauzer
 * o'rnatishda o'qiydi — shuning uchun bu yerda faqat brend nomi va
 * ikonkalar turadi, tarjima qilinadigan shior emas.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MYMarkaz',
    short_name: 'MYMarkaz',
    description: "MYMarkaz — g'oyadan biznes loyihagacha",
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0A192F',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
