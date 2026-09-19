import { routing, type AppLocale } from './routing';

/**
 * Til metama'lumotlari — mijoz va serverda bir xil ishlatiladi (import'i yengil,
 * `next-intl` runtime'isiz).
 *
 * Nega bayroq YO'Q: bayroq — davlat, til emas (rus tilida o'nlab davlat
 * gaplashadi, ingliz tili uchun "qaysi bayroq?" savoli javobsiz). Til o'z
 * yozuvida — endonim bilan ko'rsatiladi: foydalanuvchi o'z tilini boshqa
 * tilga tarjima qilinmagan holda taniydi. Qo'shimcha: Windows emoji-bayroqni
 * umuman chizmaydi (o'rniga "UZ" harflari chiqadi).
 */
export const LOCALES = routing.locales;
export const DEFAULT_LOCALE = routing.defaultLocale;

/** Foydalanuvchining aniq til tanlovi (faqat til almashtirgich yozadi). */
export const LOCALE_COOKIE = 'NEXT_LOCALE';
/** Til taklifi bandi yopilganini eslab qolish (sessiya emas — doimiy). */
export const LOCALE_SUGGEST_DISMISSED = 'mm_lang_hint';

export interface LocaleMeta {
  /** Endonim — til o'z yozuvida */
  name: string;
  /** Qisqa kod (almashtirgich tugmasida) */
  short: string;
  /** Open Graph `og:locale` */
  og: string;
  /** "Til" so'zi shu tilda — menyu sarlavhasi uch tilda: "Til · Язык · Language" */
  word: string;
  /**
   * Mahsulot shiori shu tilda — almashtirgich menyusida har til yonida
   * ko'rinadi: foydalanuvchi tanlashdan OLDIN sayt o'sha tilda qanday
   * "ovoz berishini" ko'radi.
   */
  tagline: string;
  /**
   * Til taklifi bandi — O'SHA tilda yoziladi (u faqat shu tilni biladigan,
   * lekin boshqa tildagi sahifaga tushib qolgan odamga ko'rsatiladi).
   * Shuning uchun lug'atda emas, shu yerda: joriy sahifaning lug'ati
   * boshqa tilda bo'ladi.
   */
  suggest: { text: string; action: string; dismiss: string };
}

export const LOCALE_META: Record<AppLocale, LocaleMeta> = {
  uz: {
    name: 'Oʻzbekcha',
    short: 'UZ',
    og: 'uz_UZ',
    word: 'Til',
    tagline: 'Gʻoyadan biznes loyihagacha',
    suggest: {
      text: 'Bu sahifani oʻzbek tilida ochasizmi?',
      action: 'Oʻzbekchada ochish',
      dismiss: 'Yopish',
    },
  },
  ru: {
    name: 'Русский',
    short: 'RU',
    og: 'ru_RU',
    word: 'Язык',
    tagline: 'От идеи до бизнес-проекта',
    suggest: {
      text: 'Открыть эту страницу на русском?',
      action: 'Открыть на русском',
      dismiss: 'Закрыть',
    },
  },
  en: {
    name: 'English',
    short: 'EN',
    og: 'en_US',
    word: 'Language',
    tagline: 'From idea to business',
    suggest: {
      text: 'View this page in English?',
      action: 'Switch to English',
      dismiss: 'Close',
    },
  },
};

/** Menyu sarlavhasi — "Til · Язык · Language": har kim o'z so'zini topadi. */
export const LANGUAGE_WORDS = (['uz', 'ru', 'en'] as const)
  .map((l) => LOCALE_META[l].word)
  .join(' · ');

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Ichki yo'lni (`/startups/1`) berilgan til uchun tashqi yo'lga aylantiradi:
 * uz → `/startups/1`, ru → `/ru/startups/1`. Bosh sahifa: `/`, `/ru`, `/en`.
 */
export function localizePath(locale: AppLocale, path: string): string {
  // ⚠️ `//evil.com` va `/\evil.com` — PROTOKOLGA NISBIY manzil: brauzer uni
  // tashqi sayt deb o'qiydi. Yo'l foydalanuvchi turgan manzildan kelishi
  // mumkin (`usePathname()`), shuning uchun boshidagi ortiqcha ajratgichlar
  // bitta `/` ga keltiriladi — ochiq redirect yo'li yopiladi.
  const normalized = path.replace(/^[/\\]+/, '/');
  const clean = normalized.startsWith('/') ? normalized : `/${normalized}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
}

/**
 * Tashqi yo'ldan til prefiksini ajratadi: `/ru/startups` → { ru, /startups }.
 * Prefiks bo'lmasa — asosiy til. `/uz/...` ham tanilib (redirect uchun) ajratiladi.
 */
export function splitLocale(pathname: string): { locale: AppLocale; path: string; prefixed: boolean } {
  const segment = pathname.split('/')[1] ?? '';
  if (isAppLocale(segment)) {
    const rest = pathname.slice(segment.length + 1);
    return { locale: segment, path: rest === '' ? '/' : rest, prefixed: true };
  }
  return { locale: DEFAULT_LOCALE, path: pathname || '/', prefixed: false };
}
