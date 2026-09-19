import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * Har so'rov uchun til konfiguratsiyasi (server).
 *
 * Xabarlar build vaqtida OLDINDAN KOMPILYATSIYA qilinadi (`next.config.mjs` →
 * `precompile`): brauzerga ICU parser yuborilmaydi va formatlash tezroq.
 * `import()` shabloni tufayli har til alohida chunk — sahifa faqat o'z tilini
 * yuklaydi.
 *
 * Vaqt mintaqasi qat'iy `Asia/Tashkent`: server (UTC) va brauzer bir xil
 * matn chiqaradi — hidratsiya farqi bo'lmaydi.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Asia/Tashkent',
  };
});
