import type { AbstractIntlMessages, Messages } from 'next-intl';

/**
 * Brauzerga yuboriladigan xabarlar — NOMLAR MAYDONI (namespace) bo'yicha.
 *
 * Nega butun lug'at emas: har bir to'liq sahifa yuklanishida xabarlar RSC
 * payload ichida HTML bilan keladi. Butun lug'at (uch mingga yaqin satr)
 * mobil tarmoqda LCP'ni sekinlashtirardi. Shuning uchun:
 *  · `GLOBAL_CLIENT_NAMESPACES` — HAR sahifada kerak bo'ladigan client
 *    matnlar (navbar, umumiy tugmalar, vaqt...) — ildiz layout'da bir marta;
 *  · `SCOPES` — bo'limga xos client matnlar, o'sha bo'lim layout'ida.
 *
 * Server komponentlar (`getTranslations`) to'liq lug'atni serverda o'qiydi —
 * ularning matni brauzerga umuman yuborilmaydi (faqat tayyor HTML).
 *
 * ⚠️ Yangi client komponentda `useTranslations('x')` ishlatilsa, `x` shu
 * yerda uni render qiladigan bo'lim(lar)ga qo'shilishi SHART —
 * `npm run i18n:check` buni statik tekshiradi (marshrut → import grafigi).
 */
type Namespace = keyof Messages;

export const GLOBAL_CLIENT_NAMESPACES = [
  'common',
  'lang',
  'ui',
  'time',
  'nav',
  'search',
  'notifications',
  'labels',
  'social',
  'report',
  'media',
  'validation',
] as const satisfies readonly Namespace[];

/**
 * Bo'limga xos client xabarlari. Kalit — `<Scope name="...">` nomi, qiymat —
 * o'sha bo'lim client komponentlari so'raydigan nomlar maydonlari.
 *
 * Qoida: namespace bir nechta scope'da takrorlanishi mumkin (masalan
 * `regions`) — har sahifaga faqat O'Z scope'i yuboriladi, ya'ni takror
 * payloadni oshirmaydi, lekin har bo'lim mustaqil qoladi.
 */
export const SCOPES = {
  // (main) qobig'i — kartalarning umumiy bo'laklari (jami ~20 kalit):
  // startap/muammo kartasi deyarli har ro'yxatda uchraydi.
  cards: ['startupCard', 'engagement', 'coverMedia', 'rating', 'problemLike'],

  // Guruh qobiqlari
  auth: ['auth', 'regions'],
  chat: ['chat'],
  ai: ['ai'],

  // Sahifalar
  home: ['home', 'aiLauncher', 'landing', 'leaderboard', 'groupCard', 'polls'],
  startupsPage: ['startupsPage'],
  startupDetail: ['startupDetail', 'readiness', 'reviews', 'venture'],
  startupForm: ['startupForm', 'regions', 'investorFields', 'venture'],
  problemsPage: ['problemsPage'],
  problemDetail: ['problemDetail', 'helpful', 'share'],
  problemCreate: ['problemCreate'],
  solutionsPage: ['solutionsPage'],
  polls: ['polls'],
  leaderboard: ['leaderboard'],
  discover: ['discover', 'groupCard'],
  market: ['market', 'clusterCard'],
  notificationsPage: ['notificationsPage'],
  profile: ['profile', 'regions'],
  publicProfile: ['publicProfile', 'regions'],
  settings: ['settings', 'regions'],
  investor: ['investor', 'investorForm', 'regions', 'venture'],
  dealflow: ['dealflow', 'matchCard', 'introDialog', 'regions', 'venture'],
  investorRequests: ['investorRequests', 'venture'],
  introRequests: ['introRequests', 'venture'],
  billing: ['billingPage', 'billing', 'planCard'],
  pricing: ['pricing', 'billing', 'planCard', 'paymentSheet'],
} as const satisfies Record<string, readonly Namespace[]>;

export type ScopeName = keyof typeof SCOPES;

/** Faqat berilgan nomlar maydonini qoldiradi (yo'q bo'lsa — jim o'tkazadi). */
export function pickMessages(
  messages: AbstractIntlMessages,
  namespaces: readonly string[],
): AbstractIntlMessages {
  const picked: AbstractIntlMessages = {};
  for (const ns of namespaces) {
    const value = messages[ns];
    if (value !== undefined) picked[ns] = value;
  }
  return picked;
}
