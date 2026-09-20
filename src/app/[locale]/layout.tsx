import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import '../globals.css';
import { Providers } from '@/components/layout/providers';
import { TrafficBeacon } from '@/components/analytics/traffic-beacon';
import { LanguageSuggest } from '@/components/i18n/language-suggest';
import { JsonLd } from '@/components/seo/json-ld';
import { CategoryLabelsProvider } from '@/lib/category-labels';
import { fetchInitial } from '@/lib/server-api';
import type { Category } from '@/types';
import { API_URL } from '@/lib/constants';
import { dirOf, routing, type AppLocale } from '@/i18n/routing';
import { LOCALE_META } from '@/i18n/locales';
import { GLOBAL_CLIENT_NAMESPACES, pickMessages } from '@/i18n/scopes';
import { SITE_URL, organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import { DOM_MUTATION_GUARD } from '@/lib/dom-mutation-guard';

// API alohida origin (portda) — birinchi fetch'gacha ulanish tayyor tursin
const API_ORIGIN = new URL(API_URL).origin;

/** Har til — build vaqtida statik (o'z HTML'i bilan, SSG/ISR saqlanadi). */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  // ⚠️ `locale` — URL segmenti, ya'ni ISTALGAN matn bo'lishi mumkin
  // (`/favicon.ico`, noto'g'ri havola, proxy normallashtirgan yo'l).
  // Tekshirmasdan `LOCALE_META[locale]` o'qilsa TypeError bo'lib, sahifa
  // 500 bilan yiqilardi — prod'da butun sayt shu sababdan ochilmagan.
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'meta.site' });
  const verification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return {
    metadataBase: new URL(SITE_URL),
    // ⚠️ `alternates` (canonical/hreflang) bu yerda ATAYLAB yo'q: layout'dagi
    // qiymat o'zi metadata bermagan HAR sahifaga meros bo'lib, barchasini bosh
    // sahifaga kanoniklashtirib qo'yardi. Har sahifa o'zinikini beradi.
    title: { default: t('title'), template: '%s | MYMarkaz' },
    description: t('description'),
    applicationName: 'MYMarkaz',
    keywords: t('keywords'),
    creator: 'MYMarkaz',
    publisher: 'MYMarkaz',
    formatDetection: { telephone: false, email: false, address: false },
    openGraph: {
      type: 'website',
      siteName: 'MYMarkaz',
      locale: LOCALE_META[locale].og,
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => LOCALE_META[l].og),
    },
    twitter: { card: 'summary_large_image' },
    appleWebApp: { title: 'MYMarkaz', capable: true, statusBarStyle: 'default' },
    // ⚠️ `appleWebApp.capable` faqat ESKIRGAN `apple-mobile-web-app-capable`
    // metasini yozadi va Chrome buni konsolda ogohlantiradi. Standart nomi —
    // `mobile-web-app-capable`; Next uni o'zi qo'shmaydi. Ikkalasi birga
    // turadi: eski iOS versiyalari hamon apple-variantini o'qiydi.
    other: { 'mobile-web-app-capable': 'yes' },
    ...(verification ? { verification: { google: verification } } : {}),
  };
}

// interactiveWidget: mobil klaviatura ochilganda layout viewport QISQARADI —
// chat composer klaviatura USTIDA qoladi (Telegram xulqi), sahifa sakramaydi
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content',
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!hasLocale(routing.locales, locale)) notFound();
  // Statik render: til so'rov sarlavhasidan emas, URL segmentidan olinadi
  setRequestLocale(locale);

  const [messages, startupCats, problemCats] = await Promise.all([
    getMessages(),
    // Kategoriya yorliqlari — Next data-keshi (5 daq), har til alohida
    fetchInitial<Category[]>('/categories?type=startup', 300),
    fetchInitial<Category[]>('/categories?type=problem', 300),
  ]);
  const categoryLabels: Record<string, string> = {};
  for (const c of [...(startupCats ?? []), ...(problemCats ?? [])]) {
    if (c.label && c.label !== c.name) categoryLabels[c.name] = c.label;
  }

  return (
    /* `dir` — SERVERDA, birinchi HTML bilan: klientda qo'yilsa arabcha sahifa
       bir zum LTR bo'lib chizilib, keyin ko'zgulanardi (ko'rinadigan sakrash). */
    <html lang={locale} dir={dirOf(locale)} suppressHydrationWarning>
      <head>
        {/* Tashqi DOM o'zgarishlaridan (brauzer tarjimasi, kengaytmalar)
            himoya — HYDRATSIYADAN OLDIN ishlashi shart, shuning uchun inline.
            Batafsil sabab: `lib/dom-mutation-guard.ts`. */}
        <script dangerouslySetInnerHTML={{ __html: DOM_MUTATION_GUARD }} />
        {/* Inter — SELF-HOST: lotin subset globals.css ichida inline (base64),
            qolgan subset'lar (latin-ext/cyrillic) public/fonts'dan kerak bo'lganda.
            Google Fonts'ga tashqi so'rov umuman yo'q. */}
        <link rel="preconnect" href={API_ORIGIN} crossOrigin="anonymous" />
        {/* Ruscha sahifada kirill subset'i DARHOL kerak — `font-display: optional`
            bilan u vaqtida kelmasa sahifa zaxira shriftda qoladi. Boshqa
            tillarda bu fayl yuklanmaydi (unicode-range). */}
        {locale === 'ru' && (
          <link
            rel="preload"
            href="/fonts/inter-var-cyrillic.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="font-sans">
        <NextIntlClientProvider messages={pickMessages(messages, GLOBAL_CLIENT_NAMESPACES)}>
          <CategoryLabelsProvider labels={categoryLabels}>
            <Providers>{children}</Providers>
          </CategoryLabelsProvider>
          {/* Tashrif signali — tashqi skriptsiz, o'z serverimizga (analytics) */}
          <TrafficBeacon />
          {/* Brauzer/tanlangan til sahifa tilidan farq qilsa — nozik taklif */}
          <LanguageSuggest />
        </NextIntlClientProvider>
        <JsonLd data={[organizationJsonLd(locale), websiteJsonLd(locale)]} />
      </body>
    </html>
  );
}
