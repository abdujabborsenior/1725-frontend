import type { AppLocale } from '@/i18n/routing';
import type {
  BillingPlan,
  PaymentProvider,
  PlanTier,
} from '@/types';

/**
 * **To'lov tizimi (obuna) — VAQTINCHA O'CHIQ.**
 *
 * Bitta yoqish nuqtasi: `.env` da `NEXT_PUBLIC_BILLING_ENABLED=true`.
 * Flag `false` bo'lganda:
 *   · `/pricing`, `/billing`, `/billing/status` marshrutlari `notFound()` beradi
 *     (sahifa umuman render bo'lmaydi — SEO'ga ham tushmaydi),
 *   · navbar/profil'dagi kirish nuqtalari massivga QO'SHILMAYDI,
 *   · hech bir joyda `/billing` API'siga so'rov ketmaydi.
 *
 * Ya'ni kod bazada tayyor turadi, lekin mahsulotda mavjud emas. Backendda ham
 * xuddi shu tamoyil: `BILLING_ENABLED=false` bo'lsa `BillingModule` umuman
 * yuklanmaydi (`app.module.ts` dagi shartli import) — endpoint yo'q, cron yo'q,
 * startap joylashga limit yo'q. Ikki tomon MUSTAQIL yoqiladi, lekin odatda
 * birga yoqiladi.
 *
 * ⚠️ Bu build-time flag (`NEXT_PUBLIC_*`) — o'zgargach frontend qayta
 * build/deploy qilinadi.
 */
export const BILLING_ENABLED = process.env.NEXT_PUBLIC_BILLING_ENABLED === 'true';

/* ── Narx / muddat formatlash ─────────────────────────────────── */

/**
 * Minglar ajratkichi — **atayin qo'lda** (`toLocaleString` EMAS).
 *
 * Sabab: `Intl` natijasi muhitga bog'liq — Node (SSR) `uz` uchun "1 000",
 * ba'zi brauzer ICU qurilmalari esa "1,000" beradi. Bu SSR va hidratsiya
 * matnini farqlantirib, React ogohlantirishiga va raqamning "sakrashiga"
 * olib keladi. Narx — foydalanuvchi ishonadigan raqam, u har joyda BIR XIL
 * ko'rinishi shart.
 */
const GROUP: Record<AppLocale, string> = { uz: '\u00A0', ru: '\u00A0', en: ',' };
/** Valyuta nomi har tilda (so'm · сум · UZS) — kichik jadval, lug'at emas. */
const CURRENCY: Record<AppLocale, string> = { uz: "so'm", ru: 'сум', en: 'UZS' };

function group(n: number, locale: AppLocale): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, GROUP[locale]);
}

/**
 * Backend narxni **tiyin**da qaytaradi (butun son — yaxlitlash xatosi yo'q,
 * Payme ham tiyin bilan ishlaydi). Ekranga chiqarishda so'mga o'giriladi.
 */
export function formatSum(tiyin: number, locale: AppLocale): string {
  return `${group(Math.round(tiyin / 100), locale)} ${CURRENCY[locale]}`;
}

/** "1 000" — valyutasiz (yirik ko'rsatiladigan raqam uchun). */
export function formatSumShort(tiyin: number, locale: AppLocale): string {
  return group(Math.round(tiyin / 100), locale);
}

/** Valyuta nomi — yirik narx yonida alohida ko'rsatish uchun. */
export function currencyLabel(locale: AppLocale): string {
  return CURRENCY[locale];
}

/* Muddat yorliqlari lug'atda: `billing.interval.<monthly|yearly>` ("Oylik"),
   `billing.intervalSuffix.<monthly|yearly>` ("/oy"). */

/* ── Tarif darajalari ─────────────────────────────────────────── */

/**
 * Daraja uchun VIZUAL meta (rang) — narx va limit BACKENDDAN keladi, shior
 * lug'atda (`billing.tier.<tier>.tagline`). Narxni frontendda hech qachon
 * qattiq yozmaymiz: u serverda o'zgarganda ekranda darhol yangilanishi kerak
 * (va to'lov summasi doim server hisobi).
 */
export const TIER_META: Record<PlanTier, { accentClass: string; badgeClass: string }> = {
  starter: {
    accentClass: 'bg-slate-500',
    badgeClass: 'bg-fill-tertiary text-slate-600',
  },
  pro: {
    accentClass: 'bg-accent-600',
    badgeClass: 'bg-accent-50 text-accent-700',
  },
  business: {
    accentClass: 'bg-indigo-600',
    badgeClass: 'bg-indigo-50 text-indigo-700',
  },
};

export type PlanFeatureKey =
  | 'projects'
  | 'page'
  | 'solutions'
  | 'edit'
  | 'priority'
  | 'yearTerm'
  | 'monthTerm';

/**
 * Tarifning asosiy imkoniyatlari — lug'at KALITLARI (`billing.features.<key>`).
 * Loyiha limiti serverdan (`startupLimit`) olinadi va `count` sifatida
 * uzatiladi (ICU plural: "1 ta loyiha" / "5 tagacha loyiha").
 */
export function planFeatures(plan: BillingPlan): { key: PlanFeatureKey; count?: number }[] {
  const base: { key: PlanFeatureKey; count?: number }[] = [
    { key: 'projects', count: plan.startupLimit },
    { key: 'page' },
    { key: 'solutions' },
  ];
  if (plan.tier !== 'starter') base.push({ key: 'edit' });
  if (plan.tier === 'business') base.push({ key: 'priority' });
  base.push({ key: plan.interval === 'yearly' ? 'yearTerm' : 'monthTerm' });
  return base;
}

/**
 * Yillik tarif oylikka nisbatan necha foiz tejashini hisoblaydi.
 * Ikkala tarif ham bo'lmasa `null` — hech narsa ko'rsatilmaydi (soxta
 * "chegirma" yozuvi bo'lmasin).
 */
export function yearlySavingPercent(
  plans: BillingPlan[],
  tier: PlanTier,
): number | null {
  const monthly = plans.find((p) => p.tier === tier && p.interval === 'monthly');
  const yearly = plans.find((p) => p.tier === tier && p.interval === 'yearly');
  if (!monthly || !yearly || monthly.price <= 0) return null;
  const full = monthly.price * 12;
  if (yearly.price >= full) return null;
  return Math.round(((full - yearly.price) / full) * 100);
}

/** Ro'yxatdagi eng katta tejash foizi — "Yillik" tugmasi yonidagi tamg'a uchun. */
export function bestYearlySaving(plans: BillingPlan[]): number | null {
  const values = (['starter', 'pro', 'business'] as PlanTier[])
    .map((t) => yearlySavingPercent(plans, t))
    .filter((v): v is number => v !== null);
  return values.length ? Math.max(...values) : null;
}

/* ── Limit xatosi ─────────────────────────────────────────────── */

/**
 * Backend loyiha limiti tugaganda `403` + shu kod bilan javob beradi.
 * Frontend uni oddiy xatodan ajratib, foydalanuvchini tarif tanlashga
 * yo'naltiradi (xato emas — bu SOTUV nuqtasi).
 */
export const STARTUP_LIMIT_ERROR_CODE = 'STARTUP_LIMIT_REACHED';

export function isStartupLimitError(err: unknown): boolean {
  const data = (err as { response?: { data?: { error?: { code?: string } } } })
    ?.response?.data;
  return data?.error?.code === STARTUP_LIMIT_ERROR_CODE;
}

/* ── To'lov usullari ──────────────────────────────────────────── */

/**
 * Provayder meta-ma'lumoti. Ranglar — brendlarning RASMIY ranglari
 * (`components/brand/payment-marks.tsx` bilan bir xil manba).
 *
 * ⚠️ Bu ranglar FAQAT tanlangan usulning belgisi atrofidagi nozik nurda
 * ishlatiladi. Tugmalar, matnlar va boshqa sirtlar loyihaning o'z accent
 * rangida qoladi: begona brend rangini interfeysga yoyish "kamalak" effekti
 * beradi va Charter §2 (premium = restraint) ga zid. Qolaversa, Payme cyan
 * (#25E8FF) ustidagi oq matn kontrast bo'yicha AA dan o'tmaydi.
 */
export const PROVIDER_META: Record<
  PaymentProvider,
  { label: string; cards: string; brand: string }
> = {
  payme: {
    label: 'Payme',
    cards: 'Uzcard · Humo · Visa',
    brand: '#25E8FF',
  },
  click: {
    label: 'Click',
    cards: 'Uzcard · Humo · Visa',
    brand: '#0065FF',
  },
};

/** Ekrandagi tartib — sozlanganlari orasidan shu ketma-ketlikda. */
export const PROVIDER_ORDER: PaymentProvider[] = ['payme', 'click'];

/**
 * Sozlangan usullar nomlari (tartib bilan). Matnga aylantirish lug'atda:
 * `billing.providers` — "{a} yoki {b}" / "{a} или {b}" / "{a} or {b}".
 */
export function providerNames(providers: PaymentProvider[]): string[] {
  return PROVIDER_ORDER.filter((p) => providers.includes(p)).map(
    (p) => PROVIDER_META[p].label,
  );
}
