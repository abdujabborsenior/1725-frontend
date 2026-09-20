import type { AppLocale } from '@/i18n/routing';
import type {
  IntroStatus,
  BusinessModel,
  InvestorKind,
  MatchDetailKey,
  ReadinessGrade,
  StartupStage,
  VentureNeed,
} from '@/types';

/**
 * Venture bo'limining KALITLARI, tartibi va ranglari — yagona manba.
 *
 * Backend kalit qaytaradi (`stage: 'mvp'`, `detail: 'exact'`), MATN esa
 * lug'atda (`messages/*.json` → `venture.*`): `t(`stage.${stageMessageKey(key)}`)`,
 * `t(`stageHint.${key}`)`, `t(`need.${key}`)`, `t(`needHint.${key}`)`,
 * `t(`offer.${key}`)`, `t(`investorKind.${key}`)`, `t(`investorKindHint.${key}`)`,
 * `t(`factor.${key}`)`, `t(`detail.${key}`)`, `t(`dimension.${key}`)`,
 * `t(`dimensionHint.${key}`)`, `t(`grade.${key}`)`, `t(`introStatus.${key}`)`,
 * `t(`score.${level}`)`, `t(`businessModel.${key}`)`.
 */

/**
 * Bosqich kaliti → LUG'AT kaliti.
 *
 * ⚠️ `prototype` — next-intl'da TAQIQLANGAN segment (prototip ifloslanishidan
 * himoya: `Object.prototype` nomlari kalit bo'la olmaydi; build "Invalid
 * message id segment" bilan yiqiladi). Backend enumi o'zgarmaydi, faqat
 * lug'atda `prototyping` deb yoziladi va matn shu yerdan olinadi.
 */
export type StageMessageKey = Exclude<StartupStage, 'prototype'> | 'prototyping';

export function stageMessageKey(stage: StartupStage): StageMessageKey {
  return stage === 'prototype' ? 'prototyping' : stage;
}

export const STAGE_ORDER: StartupStage[] = [
  'idea', 'prototype', 'mvp', 'early_revenue', 'growth',
];

export const BUSINESS_MODEL_ORDER: BusinessModel[] = [
  'b2c', 'b2b', 'b2b2c', 'marketplace', 'subscription', 'ads', 'hardware', 'service', 'nonprofit', 'other',
];

export const NEED_ORDER: VentureNeed[] = [
  'investment', 'grant', 'mentor', 'team', 'customers', 'partner',
];

export const INVESTOR_KIND_ORDER: InvestorKind[] = [
  'angel', 'fund', 'accelerator', 'grant', 'corporate',
];

export const DETAIL_TONE: Record<MatchDetailKey, string> = {
  exact: 'text-accent-600',
  partial: 'text-amber-600',
  open: 'text-slate-500',
  none: 'text-rose-500',
  unknown: 'text-slate-500',
};

export const GRADE_TONE: Record<ReadinessGrade, string> = {
  strong: 'text-accent-600',
  good: 'text-accent-600',
  basic: 'text-amber-600',
  early: 'text-slate-500',
};

/* ── Pul formatlash ───────────────────────────────────────────── */

/**
 * Pul birliklari har tilda — kichik jadval, lug'at emas: formatlash sof
 * funksiya (render, SSR, hook'siz joylarda ham ishlaydi) va `Record<AppLocale>`
 * tipi har tilning to'liqligini KOMPILYATOR darajasida kafolatlaydi.
 */
const MONEY: Record<
  AppLocale,
  { bn: string; mn: string; k: string; one: string; decimal: string; group: string; from: (s: string) => string; upTo: (s: string) => string; unset: string }
> = {
  uz: {
    bn: "mlrd so'm", mn: "mln so'm", k: "ming so'm", one: "so'm", decimal: '.', group: ' ',
    from: (x) => `${x} dan`, upTo: (x) => `${x} gacha`, unset: 'Ko‘rsatilmagan',
  },
  ru: {
    bn: 'млрд сум', mn: 'млн сум', k: 'тыс. сум', one: 'сум', decimal: ',', group: ' ',
    from: (x) => `от ${x}`, upTo: (x) => `до ${x}`, unset: 'Не указано',
  },
  en: {
    bn: 'bn UZS', mn: 'mln UZS', k: 'thousand UZS', one: 'UZS', decimal: '.', group: ',',
    from: (x) => `from ${x}`, upTo: (x) => `up to ${x}`, unset: 'Not specified',
  },
  ar: {
    bn: 'مليار سوم', mn: 'مليون سوم', k: 'ألف سوم', one: 'سوم', decimal: '.', group: ',',
    from: (x) => `من ${x}`, upTo: (x) => `حتى ${x}`, unset: 'غير محدّد',
  },
  zh: {
    bn: '十亿苏姆', mn: '百万苏姆', k: '千苏姆', one: '苏姆', decimal: '.', group: ',',
    from: (x) => `${x} 起`, upTo: (x) => `最高 ${x}`, unset: '未填写',
  },
};

/**
 * Summani odam o'qiydigan shaklga keltiradi ("120 mln so'm" · "120 млн сум" ·
 * "120 mln UZS").
 *
 * ⚠️ `toLocaleString` ATAYLAB ishlatilmaydi: SSR (Node ICU) va brauzer
 * turlicha ajratgich qo'yib, hidratsiya mos kelmasligini keltirib chiqaradi
 * (billing bo'limida aynan shu tuzoqqa tushilgan). Guruhlash qo'lda.
 */
export function formatSum(value: number | null | undefined, locale: AppLocale): string {
  if (value === null || value === undefined) return '—';
  const m = MONEY[locale];
  const unit = unitOf(value, m);
  return unit.size === 1
    ? `${group(value, m.group)} ${m.one}`
    : `${trimZero(value / unit.size, m.decimal)} ${unit.label}`;
}

/** Summa oralig'i ("50–200 mln so'm"). Bitta chegara bo'lsa moslashadi. */
export function formatRange(
  min: number | null | undefined,
  max: number | null | undefined,
  locale: AppLocale,
): string {
  const m = MONEY[locale];
  if (!min && !max) return m.unset;
  if (min && max) {
    // Bir xil birlikda bo'lsa birlikni bir marta yozamiz: "50–200 mln so'm".
    const unit = unitOf(max, m);
    if (unit.size > 1 && unitOf(min, m).size === unit.size) {
      return `${trimZero(min / unit.size, m.decimal)}–${trimZero(max / unit.size, m.decimal)} ${unit.label}`;
    }
    return `${formatSum(min, locale)} – ${formatSum(max, locale)}`;
  }
  return min ? m.from(formatSum(min, locale)) : m.upTo(formatSum(max, locale));
}

function unitOf(value: number, m: (typeof MONEY)[AppLocale]): { size: number; label: string } {
  if (value >= 1_000_000_000) return { size: 1_000_000_000, label: m.bn };
  if (value >= 1_000_000) return { size: 1_000_000, label: m.mn };
  if (value >= 1_000) return { size: 1_000, label: m.k };
  return { size: 1, label: m.one };
}

function trimZero(n: number, decimal: string): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace('.', decimal);
}

function group(n: number, sep: string): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

/* ── Match Score ranglari ─────────────────────────────────────── */

export type ScoreLevel = 'veryHigh' | 'high' | 'partial' | 'weak';

/** Ball darajasi — bitta joyda, butun mahsulot bo'ylab izchil. Yorliq: `t(`score.${level}`)`. */
export function scoreTone(score: number): {
  text: string;
  ring: string;
  bg: string;
  level: ScoreLevel;
} {
  if (score >= 85) {
    return { text: 'text-accent-700', ring: 'stroke-accent-500', bg: 'bg-accent-50', level: 'veryHigh' };
  }
  if (score >= 70) {
    return { text: 'text-accent-700', ring: 'stroke-accent-500', bg: 'bg-accent-50', level: 'high' };
  }
  if (score >= 55) {
    return { text: 'text-amber-700', ring: 'stroke-amber-500', bg: 'bg-amber-50', level: 'partial' };
  }
  return { text: 'text-slate-600', ring: 'stroke-slate-400', bg: 'bg-fill-tertiary', level: 'weak' };
}

/* ── Bog'lanish so'rovi holati (yorliq: `t(`introStatus.${status}`)`) ── */

export const INTRO_STATUS_TONE: Record<IntroStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-accent-50 text-accent-700',
  declined: 'bg-rose-50 text-rose-700',
  withdrawn: 'bg-slate-100 text-slate-600',
};
