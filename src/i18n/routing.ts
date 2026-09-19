import { defineRouting } from 'next-intl/routing';

/**
 * Tillar va URL siyosati — YAGONA manba.
 *
 * `as-needed`: o'zbekcha (asosiy til) PREFIKSSIZ qoladi — Google allaqachon
 * indekslagan barcha URL'lar (`/startups/...`) o'zgarmaydi; ruscha va inglizcha
 * versiyalar `/ru/...`, `/en/...` da. Har til — alohida, barqaror URL
 * (Google'ning ko'p tilli sayt tavsiyasi: til cookie/sarlavhaga qarab emas,
 * URL'ga qarab aniqlanadi — aks holda qidiruv tizimi faqat bitta tilni ko'radi).
 *
 * `localeDetection: false`: `Accept-Language` bo'yicha AVTOMATIK redirect yo'q.
 * O'zbekistonda telefonlarning katta qismi ruscha sozlangan — ular o'zbekcha
 * havolani ochganda boshqa tilga otib yuborilmasligi kerak. O'rniga brauzer
 * tili farq qilsa, nozik taklif bandi chiqadi (`LanguageSuggest`).
 *
 * `localeCookie: false`: foydalanuvchining ANIQ tanlovi o'zimizning cookie'da
 * (`LOCALE_COOKIE`) — uni faqat til almashtirgich yozadi, middleware esa
 * faqat bosh sahifada (`/`) hurmat qiladi. `alternateLinks: false`: hreflang
 * har sahifaning `<head>` metadata'sida (kanonik URL bilan birga) — `Link`
 * javob sarlavhasida takrorlanmaydi.
 */
export const routing = defineRouting({
  locales: ['uz', 'ru', 'en'],
  defaultLocale: 'uz',
  localePrefix: 'as-needed',
  localeDetection: false,
  localeCookie: false,
  alternateLinks: false,
});

export type AppLocale = (typeof routing.locales)[number];
