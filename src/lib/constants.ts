import type {
  LeaderboardPeriod,
  PlatformType,
  ProblemStatus,
  ReportReason,
  ReportTargetType,
  SolutionStatus,
  StartupSort,
  StartupStatus,
  UserRole,
} from '@/types';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3331/api';

/* ── Storage keys ─────────────────────────────────────────────── */
export const STORAGE = {
  token: 'sh_token',
  refresh: 'sh_refresh',
  user: 'sh_user',
  pendingEmail: 'sh_pending_email',
} as const;

/*
 * O'qilmagan hisoblagichlar (suhbat / bildirishnoma) davriy so'rovi.
 * Har KIRGAN foydalanuvchining ochiq (ko'rinib turgan) oynasi shu oraliqda
 * so'raydi: 1M bir vaqtdagi foydalanuvchida 20–30 s = sekundiga ~83 000
 * so'rov faqat badge'lar uchun edi, 60 s da ~33 000. Yangiligi baribir
 * saqlanadi: oynaga qaytilganda darhol yangilanadi (`refetchOnWindowFocus`),
 * yashirin oynada umuman so'ralmaydi (React Query standarti), suhbat
 * sahifasining o'zida esa socket jonli yangilaydi.
 */
export const UNREAD_POLL_MS = 60_000;

/*
 * ⚠️ Yorliq MATNLARI bu faylda YO'Q — ular lug'atda (`messages/*.json`,
 * asosan `labels.*`), chunki har tilda boshqacha. Bu yerda faqat
 * tilga bog'liq bo'lmagan narsalar: qiymatlar, tartib, rang klasslari.
 */

/* ── Problem status ───────────────────────────────────────────── */
export const PROBLEM_STATUS_BADGE: Record<ProblemStatus, string> = {
  pending:      'bg-amber-50 text-amber-700',
  open:         'bg-accent-50 text-accent-700',
  under_review: 'bg-sky-50 text-sky-700',
  resolved:     'bg-violet-50 text-violet-700',
  rejected:     'bg-rose-50 text-rose-700',
};

/**
 * Boyitilgan status vizuali — kartochkalar va detal sahifa uchun.
 * dot: nuqta rangi · text: matn rangi · chip: yumshoq fonli pill (ring bilan)
 * bar: hover/urg'u chizig'i · glow: hover soyasi.
 */
export const PROBLEM_STATUS_META: Record<
  ProblemStatus,
  { dot: string; text: string; chip: string; bar: string; border: string }
> = {
  pending: {
    dot: 'bg-amber-500', text: 'text-amber-700',
    chip: 'bg-amber-50 text-amber-700', bar: 'bg-amber-400', border: 'hover:border-amber-300',
  },
  open: {
    dot: 'bg-accent-500', text: 'text-accent-700',
    chip: 'bg-accent-50 text-accent-700', bar: 'bg-accent-500', border: 'hover:border-accent-300',
  },
  under_review: {
    dot: 'bg-sky-500', text: 'text-sky-700',
    chip: 'bg-sky-50 text-sky-700', bar: 'bg-sky-500', border: 'hover:border-sky-300',
  },
  resolved: {
    dot: 'bg-violet-500', text: 'text-violet-700',
    chip: 'bg-violet-50 text-violet-700', bar: 'bg-violet-500', border: 'hover:border-violet-300',
  },
  rejected: {
    dot: 'bg-rose-500', text: 'text-rose-700',
    chip: 'bg-rose-50 text-rose-700', bar: 'bg-rose-500', border: 'hover:border-rose-300',
  },
};

/* ── Solution status ──────────────────────────────────────────── */
export const SOLUTION_STATUS_BADGE: Record<SolutionStatus, string> = {
  pending:  'bg-amber-50 text-amber-700',
  accepted: 'bg-accent-50 text-accent-700',
  rejected: 'bg-rose-50 text-rose-700',
};

/* ── Roles ────────────────────────────────────────────────────── */
export const ROLE_BADGE: Record<UserRole, string> = {
  superadmin:         'bg-violet-50 text-violet-700',
  analyzer:           'bg-cyan-50 text-cyan-700',
  school_student:     'bg-accent-50 text-accent-700',
  university_student: 'bg-sky-50 text-sky-700',
  user:               'bg-slate-100 text-slate-600',
  investor:           'bg-indigo-50 text-indigo-700',
};

/* ── Domain data ──────────────────────────────────────────────── */
/**
 * Viloyatlar: `value` — bazada saqlanadigan KANONIK qiymat (o'zbekcha,
 * O'ZGARMAYDI — mavjud yozuvlar shu qiymat bilan), `key` — ko'rsatiladigan
 * nom uchun lug'at kaliti (`regions.<key>`).
 */
export const UZ_REGIONS = [
  { value: 'Andijon', key: 'andijan' },
  { value: 'Buxoro', key: 'bukhara' },
  { value: "Farg'ona", key: 'fergana' },
  { value: 'Jizzax', key: 'jizzakh' },
  { value: 'Namangan', key: 'namangan' },
  { value: 'Navoiy', key: 'navoi' },
  { value: 'Qashqadaryo', key: 'kashkadarya' },
  { value: "Qoraqalpog'iston", key: 'karakalpakstan' },
  { value: 'Samarqand', key: 'samarkand' },
  { value: 'Sirdaryo', key: 'syrdarya' },
  { value: 'Surxondaryo', key: 'surkhandarya' },
  { value: 'Toshkent viloyati', key: 'tashkentRegion' },
  { value: 'Toshkent shahri', key: 'tashkentCity' },
  { value: 'Xorazm', key: 'khorezm' },
] as const;

export type RegionKey = (typeof UZ_REGIONS)[number]['key'];

/** Bazadagi qiymat → lug'at kaliti (noma'lum qiymat — `null`, xom holda ko'rsatiladi). */
export function regionKey(value: string | null | undefined): RegionKey | null {
  return UZ_REGIONS.find((r) => r.value === value)?.key ?? null;
}

export const SCHOOL_GRADES = Array.from({ length: 11 }, (_, i) => i + 1);
export const UNIVERSITY_COURSES = Array.from({ length: 6 }, (_, i) => i + 1);

/**
 * ⚠️ ZAXIRA ro'yxat. Haqiqiy kategoriyalar bazadan keladi va admin paneldan
 * boshqariladi (`lib/use-categories.ts`) — bu yerdagi qiymatlar faqat server
 * javob bermaganда forma bo'sh qolmasligi uchun. Yangi kategoriya kodga emas,
 * admin panelga qo'shiladi.
 */
export const PROBLEM_CATEGORIES = [
  'Texnologiya',
  'Biznes',
  'Ijtimoiy',
  "Ta'lim",
  "Sog'liqni saqlash",
  "Qishloq xo'jaligi",
  'Ekologiya',
  'Sport',
  'Boshqa',
];

/* ── Startups ─────────────────────────────────────────────────── */
export const STARTUP_STATUS_BADGE: Record<StartupStatus, string> = {
  draft:     'bg-amber-50 text-amber-700',
  published: 'bg-accent-50 text-accent-700',
  archived:  'bg-slate-100 text-slate-600',
};

/**
 * Platforma turlari uchun meta — App Store / Play Store / sayt / Telegram
 * uslubidagi tugmalar va ranglar. Real do'kon ko'rinishini taqlid qiladi.
 * Matnlar (qisqa nom, CTA, badge yuqori matni, do'kon nomi) — lug'atda:
 * `labels.platform.<type>.{label,cta,kicker,store}`.
 */
export interface PlatformMeta {
  /** Tugma uchun rang sinflari (tailwind) */
  badgeClass: string;
  /** Filtr chip rangi */
  chipClass: string;
}

export const PLATFORM_META: Record<PlatformType, PlatformMeta> = {
  android: {
    badgeClass:
      'bg-brand-900 text-white hover:bg-brand-800 hover:shadow-lift active:bg-brand-800',
    chipClass: 'bg-emerald-50 text-emerald-600',
  },
  ios: {
    badgeClass:
      'bg-brand-900 text-white hover:bg-brand-800 hover:shadow-lift active:bg-brand-800',
    chipClass: 'bg-slate-100 text-slate-600',
  },
  website: {
    badgeClass:
      'bg-accent-600 text-white hover:bg-accent-700 hover:shadow-glow-accent active:bg-accent-700',
    chipClass: 'bg-accent-50 text-accent-700',
  },
  telegram_bot: {
    badgeClass:
      'bg-[#229ED9] text-white hover:bg-[#1E93CC] hover:shadow-lift active:bg-[#1B8AC0]',
    chipClass: 'bg-cyan-50 text-cyan-700',
  },
  other: {
    badgeClass:
      'bg-iris-500 text-white hover:bg-iris-600 hover:shadow-glow-iris active:bg-iris-600',
    chipClass: 'bg-violet-50 text-violet-700',
  },
};

export const PLATFORM_ORDER: PlatformType[] = [
  'android',
  'ios',
  'website',
  'telegram_bot',
  'other',
];

/** Saralash variantlari — yorliqlar `startups.sort.<value>` da. */
export const STARTUP_SORT_OPTIONS: StartupSort[] = [
  'featured',
  'top_rated',
  'newest',
  'popular',
  'alphabetical',
];

/** Reyting davri — yorliqlar `leaderboard.period.<value>` da. */
export const LEADERBOARD_PERIOD_OPTIONS: LeaderboardPeriod[] = ['all', 'year', 'month', 'week'];

/* ── Shikoyat (report) sabablari — yorliqlar `report.reason.<reason>` da ── */

/** Har bir obyekt turi uchun ko'rsatiladigan sabablar (backend bilan mos) */
export const REPORT_REASONS_BY_TYPE: Record<ReportTargetType, ReportReason[]> = {
  startup: ['spam', 'scam', 'copyright', 'not_working', 'inappropriate', 'misinformation', 'offensive', 'other'],
  message: ['spam', 'harassment', 'hate_speech', 'sexual_content', 'violence', 'misinformation', 'offensive', 'other'],
  problem: ['spam', 'inappropriate', 'duplicate', 'misinformation', 'offensive', 'other'],
  solution: ['spam', 'inappropriate', 'copyright', 'low_quality', 'misinformation', 'offensive', 'other'],
  user: ['spam', 'harassment', 'hate_speech', 'sexual_content', 'violence', 'scam', 'offensive', 'other'],
};

/** ⚠️ ZAXIRA ro'yxat — qarang: `PROBLEM_CATEGORIES` ustidagi izoh. */
export const STARTUP_CATEGORIES = [
  'Texnologiya',
  'Fintex',
  "Ta'lim",
  'Sog\'liq',
  'E-commerce',
  'Logistika',
  'AI / ML',
  'O\'yinlar',
  'Sport',
  'Ijtimoiy',
  'Boshqa',
];
