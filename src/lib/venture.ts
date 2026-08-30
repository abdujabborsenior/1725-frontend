import type {
  AssessmentDimensionKey,
  IntroStatus,
  BusinessModel,
  InvestorKind,
  MatchDetailKey,
  MatchFactorKey,
  ReadinessGrade,
  StartupStage,
  VentureNeed,
} from '@/types';

/**
 * Venture bo'limining barcha YORLIQLARI — yagona manba.
 *
 * Backend kalit qaytaradi (`stage: 'mvp'`, `detail: 'exact'`), matn esa
 * shu yerda. Sabab §9 (i18n siyosati): server foydalanuvchi tiliga bog'liq
 * matnni qotirmaydi, va yangi til qo'shilganda bitta fayl tarjima qilinadi.
 */

/* ── Loyiha bosqichi ──────────────────────────────────────────── */

export const STAGE_LABEL: Record<StartupStage, string> = {
  idea: "G'oya",
  prototype: 'Prototip',
  mvp: 'MVP ishlayapti',
  early_revenue: 'Daromad boshlangan',
  growth: "Barqaror o'sish",
};

/** Tanlash ro'yxatida ko'rinadigan qisqa izoh — foydalanuvchi adashmasin. */
export const STAGE_HINT: Record<StartupStage, string> = {
  idea: 'Hali qurilmagan, faqat reja',
  prototype: 'Dizayn yoki prototip bor',
  mvp: 'Birinchi foydalanuvchilar bor',
  early_revenue: 'Birinchi pul kelmoqda',
  growth: 'Foydalanuvchi va daromad barqaror',
};

export const STAGE_ORDER: StartupStage[] = [
  'idea', 'prototype', 'mvp', 'early_revenue', 'growth',
];

/* ── Biznes modeli ────────────────────────────────────────────── */

export const BUSINESS_MODEL_LABEL: Record<BusinessModel, string> = {
  b2c: 'Bevosita iste’molchiga (B2C)',
  b2b: 'Bizneslarga (B2B)',
  b2b2c: 'Biznes orqali iste’molchiga (B2B2C)',
  marketplace: 'Marketplace (ikki tomonli bozor)',
  subscription: 'Obuna',
  ads: 'Reklama',
  hardware: 'Qurilma / apparat',
  service: 'Xizmat ko‘rsatish',
  nonprofit: 'Notijorat',
  other: 'Boshqa',
};

/* ── Loyiha nimaga muhtoj ─────────────────────────────────────── */

export const NEED_LABEL: Record<VentureNeed, string> = {
  investment: 'Investitsiya',
  grant: 'Grant',
  mentor: 'Mentor',
  team: 'Jamoaga hamkasb',
  customers: 'Birinchi mijozlar',
  partner: 'Biznes hamkor',
};

export const NEED_HINT: Record<VentureNeed, string> = {
  investment: 'Ulush evaziga sarmoya',
  grant: 'Qaytarilmaydigan moliyalashtirish',
  mentor: 'Tajribali maslahatchi',
  team: 'Dasturchi, dizayner, marketolog',
  customers: 'Pilot mijoz yoki sinov maydoni',
  partner: 'Distribyutor yoki sheriklik',
};

export const NEED_ORDER: VentureNeed[] = [
  'investment', 'grant', 'mentor', 'team', 'customers', 'partner',
];

/** Investor tomonida bir xil kalitlar "nima taklif qilaman" ma'nosida. */
export const OFFER_LABEL: Record<VentureNeed, string> = {
  investment: 'Investitsiya',
  grant: 'Grant',
  mentor: 'Mentorlik',
  team: 'Jamoa topishda yordam',
  customers: 'Mijoz / pilot',
  partner: 'Hamkorlik',
};

/* ── Investor turi ────────────────────────────────────────────── */

export const INVESTOR_KIND_LABEL: Record<InvestorKind, string> = {
  angel: 'Biznes farishta',
  fund: 'Investitsiya fondi',
  accelerator: 'Akselerator',
  grant: 'Grant tashkiloti',
  corporate: 'Korxona',
};

export const INVESTOR_KIND_HINT: Record<InvestorKind, string> = {
  angel: 'Shaxsan sarmoya kiritaman',
  fund: 'Fond nomidan sarmoya kiritamiz',
  accelerator: 'Dastur va mentorlik beramiz',
  grant: 'Qaytarilmaydigan mablag‘ ajratamiz',
  corporate: 'Yechim yoki hamkor izlaymiz',
};

/* ── Moslik omillari ──────────────────────────────────────────── */

export const FACTOR_LABEL: Record<MatchFactorKey, string> = {
  category: 'Soha',
  stage: 'Bosqich',
  check: 'Summa oralig‘i',
  needs: 'Ehtiyoj va taklif',
  region: 'Hudud',
  traction: 'Traksiya',
  semantic: 'Mazmuniy yaqinlik',
};

/**
 * Omil qanday hal bo'lgani.
 *
 * Bu matnlar Match Score ostidagi ISHONCHNI ta'minlaydi: raqamning ortida
 * nima turganini investor bir qarashda ko'rishi kerak, aks holda foizga
 * ishonmaydi va qaytmaydi.
 */
export const DETAIL_LABEL: Record<MatchDetailKey, string> = {
  exact: 'Aniq mos',
  partial: 'Qisman mos',
  open: 'Cheklov qo‘yilmagan',
  none: 'Mos emas',
  unknown: 'Baholanmadi',
};

export const DETAIL_TONE: Record<MatchDetailKey, string> = {
  exact: 'text-accent-600',
  partial: 'text-amber-600',
  open: 'text-slate-500',
  none: 'text-rose-500',
  unknown: 'text-slate-500',
};

/* ── Tayyorlik tahlili ────────────────────────────────────────── */

export const DIMENSION_LABEL: Record<AssessmentDimensionKey, string> = {
  clarity: 'Aniqlik',
  market: 'Bozor',
  product: 'Mahsulot',
  traction: 'Traksiya',
  team: 'Jamoa',
  ask: 'So‘rov aniqligi',
};

export const DIMENSION_HINT: Record<AssessmentDimensionKey, string> = {
  clarity: 'Loyiha nima qilishi begona odamga tushunarlimi',
  market: 'Kim uchun, qaysi sohada, qayerda',
  product: 'Nimadir qurilganmi va ko‘rsa bo‘ladimi',
  traction: 'Raqamlar bilan isbot bormi',
  team: 'Loyiha ortida kim turibdi',
  ask: 'Nimaga muhtojligingiz aniq yozilganmi',
};

export const GRADE_LABEL: Record<ReadinessGrade, string> = {
  strong: 'Investorga tayyor',
  good: 'Yaxshi holatda',
  basic: 'Asosiy ma’lumot bor',
  early: 'Boshlang‘ich',
};

export const GRADE_TONE: Record<ReadinessGrade, string> = {
  strong: 'text-accent-600',
  good: 'text-accent-600',
  basic: 'text-amber-600',
  early: 'text-slate-500',
};

/* ── Pul formatlash ───────────────────────────────────────────── */

/**
 * Summani odam o'qiydigan shaklga keltiradi ("120 mln so'm").
 *
 * ⚠️ `toLocaleString` ATAYLAB ishlatilmaydi: SSR (Node ICU) va brauzer
 * turlicha ajratgich qo'yib, hidratsiya mos kelmasligini keltirib chiqaradi
 * (billing bo'limida aynan shu tuzoqqa tushilgan). Guruhlash qo'lda.
 */
export function formatSum(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  if (value >= 1_000_000_000) {
    return `${trimZero(value / 1_000_000_000)} mlrd so'm`;
  }
  if (value >= 1_000_000) return `${trimZero(value / 1_000_000)} mln so'm`;
  if (value >= 1_000) return `${trimZero(value / 1_000)} ming so'm`;
  return `${group(value)} so'm`;
}

/** Summa oralig'i ("50–200 mln so'm"). Bitta chegara bo'lsa moslashadi. */
export function formatRange(
  min: number | null | undefined,
  max: number | null | undefined,
): string {
  if (!min && !max) return 'Ko‘rsatilmagan';
  if (min && max) {
    // Bir xil birlikda bo'lsa birlikni bir marta yozamiz: "50–200 mln so'm".
    const unit = unitOf(max);
    if (unitOf(min) === unit) {
      return `${trimZero(min / unit.size)}–${trimZero(max / unit.size)} ${unit.label}`;
    }
    return `${formatSum(min)} – ${formatSum(max)}`;
  }
  return min ? `${formatSum(min)} dan` : `${formatSum(max)} gacha`;
}

function unitOf(value: number): { size: number; label: string } {
  if (value >= 1_000_000_000) return { size: 1_000_000_000, label: "mlrd so'm" };
  if (value >= 1_000_000) return { size: 1_000_000, label: "mln so'm" };
  if (value >= 1_000) return { size: 1_000, label: "ming so'm" };
  return { size: 1, label: "so'm" };
}

function trimZero(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function group(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/* ── Match Score ranglari ─────────────────────────────────────── */

/** Ball darajasi — bitta joyda, butun mahsulot bo'ylab izchil. */
export function scoreTone(score: number): {
  text: string;
  ring: string;
  bg: string;
  label: string;
} {
  if (score >= 85) {
    return { text: 'text-accent-700', ring: 'stroke-accent-500', bg: 'bg-accent-50', label: 'Juda mos' };
  }
  if (score >= 70) {
    return { text: 'text-accent-700', ring: 'stroke-accent-500', bg: 'bg-accent-50', label: 'Mos' };
  }
  if (score >= 55) {
    return { text: 'text-amber-700', ring: 'stroke-amber-500', bg: 'bg-amber-50', label: 'Qisman mos' };
  }
  return { text: 'text-slate-600', ring: 'stroke-slate-400', bg: 'bg-fill-tertiary', label: 'Zaif moslik' };
}

/* ── Bog'lanish so'rovi holati ────────────────────────────────── */

export const INTRO_STATUS_LABEL: Record<IntroStatus, string> = {
  pending: 'Javob kutilmoqda',
  accepted: 'Qabul qilingan',
  declined: 'Rad etilgan',
  withdrawn: 'Qaytarib olingan',
};

export const INTRO_STATUS_TONE: Record<IntroStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-accent-50 text-accent-700',
  declined: 'bg-rose-50 text-rose-700',
  withdrawn: 'bg-slate-100 text-slate-600',
};
