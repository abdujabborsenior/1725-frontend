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

/* ── Problem status ───────────────────────────────────────────── */
export const PROBLEM_STATUS_LABEL: Record<ProblemStatus, string> = {
  pending: 'Kutilmoqda',
  open: 'Ochiq',
  under_review: "Ko'rib chiqilmoqda",
  resolved: 'Hal qilindi',
  rejected: 'Rad etildi',
};

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
  { label: string; dot: string; text: string; chip: string; bar: string; border: string }
> = {
  pending: {
    label: 'Kutilmoqda', dot: 'bg-amber-500', text: 'text-amber-700',
    chip: 'bg-amber-50 text-amber-700', bar: 'bg-amber-400', border: 'hover:border-amber-300',
  },
  open: {
    label: 'Ochiq', dot: 'bg-accent-500', text: 'text-accent-700',
    chip: 'bg-accent-50 text-accent-700', bar: 'bg-accent-500', border: 'hover:border-accent-300',
  },
  under_review: {
    label: "Ko'rib chiqilmoqda", dot: 'bg-sky-500', text: 'text-sky-700',
    chip: 'bg-sky-50 text-sky-700', bar: 'bg-sky-500', border: 'hover:border-sky-300',
  },
  resolved: {
    label: 'Hal qilindi', dot: 'bg-violet-500', text: 'text-violet-700',
    chip: 'bg-violet-50 text-violet-700', bar: 'bg-violet-500', border: 'hover:border-violet-300',
  },
  rejected: {
    label: 'Rad etildi', dot: 'bg-rose-500', text: 'text-rose-700',
    chip: 'bg-rose-50 text-rose-700', bar: 'bg-rose-500', border: 'hover:border-rose-300',
  },
};

/* ── Solution status ──────────────────────────────────────────── */
export const SOLUTION_STATUS_LABEL: Record<SolutionStatus, string> = {
  pending: 'Kutilmoqda',
  accepted: 'Qabul qilingan',
  rejected: 'Rad etilgan',
};

export const SOLUTION_STATUS_BADGE: Record<SolutionStatus, string> = {
  pending:  'bg-amber-50 text-amber-700',
  accepted: 'bg-accent-50 text-accent-700',
  rejected: 'bg-rose-50 text-rose-700',
};

/* ── Roles ────────────────────────────────────────────────────── */
export const ROLE_LABEL: Record<UserRole, string> = {
  superadmin: 'Superadmin',
  analyzer: 'Analizator',
  school_student: "Maktab o'quvchisi",
  university_student: 'Talaba',
  user: 'Foydalanuvchi',
};

export const ROLE_BADGE: Record<UserRole, string> = {
  superadmin:         'bg-violet-50 text-violet-700',
  analyzer:           'bg-cyan-50 text-cyan-700',
  school_student:     'bg-accent-50 text-accent-700',
  university_student: 'bg-sky-50 text-sky-700',
  user:               'bg-slate-100 text-slate-600',
};

/* ── Domain data ──────────────────────────────────────────────── */
export const UZ_REGIONS = [
  'Andijon',
  'Buxoro',
  "Farg'ona",
  'Jizzax',
  'Namangan',
  'Navoiy',
  'Qashqadaryo',
  "Qoraqalpog'iston",
  'Samarqand',
  'Sirdaryo',
  'Surxondaryo',
  'Toshkent viloyati',
  'Toshkent shahri',
  'Xorazm',
] as const;

export const SCHOOL_GRADES = Array.from({ length: 11 }, (_, i) => i + 1);
export const UNIVERSITY_COURSES = Array.from({ length: 6 }, (_, i) => i + 1);

export const PROBLEM_CATEGORIES = [
  'Texnologiya',
  'Biznes',
  'Ijtimoiy',
  "Ta'lim",
  "Sog'liqni saqlash",
  "Qishloq xo'jaligi",
  'Ekologiya',
  'Boshqa',
];

/* ── Startups ─────────────────────────────────────────────────── */
export const STARTUP_STATUS_LABEL: Record<StartupStatus, string> = {
  draft: 'Qoralama',
  published: "E'lon qilingan",
  archived: 'Arxivlangan',
};

export const STARTUP_STATUS_BADGE: Record<StartupStatus, string> = {
  draft:     'bg-amber-50 text-amber-700',
  published: 'bg-accent-50 text-accent-700',
  archived:  'bg-slate-100 text-slate-600',
};

/**
 * Platforma turlari uchun meta — App Store / Play Store / sayt / Telegram
 * uslubidagi tugmalar va ranglar. Real do'kon ko'rinishini taqlid qiladi.
 */
export interface PlatformMeta {
  /** Qisqa nom (filtrlarda) */
  label: string;
  /** Do'kon/CTA tugmasi matni */
  cta: string;
  /** "Quyidagidan oling" yuqori matni (App Store / Play Store badge uslubi) */
  storeKicker: string;
  storeName: string;
  /** Tugma uchun rang sinflari (tailwind) */
  badgeClass: string;
  /** Filtr chip rangi */
  chipClass: string;
}

export const PLATFORM_META: Record<PlatformType, PlatformMeta> = {
  android: {
    label: 'Android',
    cta: 'Google Play',
    storeKicker: 'GET IT ON',
    storeName: 'Google Play',
    badgeClass: 'bg-brand-900 text-white active:bg-brand-800',
    chipClass: 'bg-emerald-50 text-emerald-600',
  },
  ios: {
    label: 'iOS',
    cta: 'App Store',
    storeKicker: 'Download on the',
    storeName: 'App Store',
    badgeClass: 'bg-brand-900 text-white active:bg-brand-800',
    chipClass: 'bg-slate-100 text-slate-600',
  },
  website: {
    label: 'Veb-sayt',
    cta: 'Saytga o\'tish',
    storeKicker: 'OPEN',
    storeName: 'Website',
    badgeClass: 'bg-accent-600 text-white active:bg-accent-700',
    chipClass: 'bg-accent-50 text-accent-700',
  },
  telegram_bot: {
    label: 'Telegram',
    cta: 'Telegramda ochish',
    storeKicker: 'OPEN IN',
    storeName: 'Telegram',
    badgeClass: 'bg-[#229ED9] text-white active:bg-[#1B8AC0]',
    chipClass: 'bg-cyan-50 text-cyan-700',
  },
  other: {
    label: 'Havola',
    cta: 'Havolani ochish',
    storeKicker: 'OPEN',
    storeName: 'Link',
    badgeClass: 'bg-iris-500 text-white active:bg-iris-600',
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

export const STARTUP_SORT_OPTIONS: { value: StartupSort; label: string }[] = [
  { value: 'featured', label: 'Tavsiya etilgan' },
  { value: 'top_rated', label: 'Eng yuqori baholangan' },
  { value: 'newest', label: 'Eng yangi' },
  { value: 'popular', label: 'Mashhur' },
  { value: 'alphabetical', label: 'Alifbo bo\'yicha' },
];

export const LEADERBOARD_PERIOD_OPTIONS: {
  value: LeaderboardPeriod;
  label: string;
}[] = [
  { value: 'all', label: 'Barcha vaqt' },
  { value: 'year', label: 'Bu yil' },
  { value: 'month', label: 'Bu oy' },
  { value: 'week', label: 'Bu hafta' },
];

/* ── Shikoyat (report) sabablari ──────────────────────────────── */
export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam yoki reklama',
  inappropriate: 'Nomaqbul kontent',
  harassment: 'Tahqirlash / bezovta qilish',
  hate_speech: 'Nafrat nutqi',
  sexual_content: 'Jinsiy mazmunli kontent',
  violence: "Zo'ravonlik",
  misinformation: "Yolg'on ma'lumot",
  scam: 'Firibgarlik / aldov',
  copyright: 'Mualliflik huquqi buzilishi',
  duplicate: 'Takroriy',
  not_working: 'Ishlamaydi / buzilgan',
  low_quality: 'Past sifatli / ahamiyatsiz',
  offensive: 'Haqoratli',
  other: 'Boshqa sabab',
};

/** Har bir obyekt turi uchun ko'rsatiladigan sabablar (backend bilan mos) */
export const REPORT_REASONS_BY_TYPE: Record<ReportTargetType, ReportReason[]> = {
  startup: ['spam', 'scam', 'copyright', 'not_working', 'inappropriate', 'misinformation', 'offensive', 'other'],
  message: ['spam', 'harassment', 'hate_speech', 'sexual_content', 'violence', 'misinformation', 'offensive', 'other'],
  problem: ['spam', 'inappropriate', 'duplicate', 'misinformation', 'offensive', 'other'],
  solution: ['spam', 'inappropriate', 'copyright', 'low_quality', 'misinformation', 'offensive', 'other'],
  user: ['spam', 'harassment', 'hate_speech', 'sexual_content', 'violence', 'scam', 'offensive', 'other'],
};

export const REPORT_TARGET_LABELS: Record<ReportTargetType, string> = {
  startup: 'startap',
  message: 'xabar',
  problem: 'muammo',
  solution: 'yechim',
  user: 'foydalanuvchi',
};

export const STARTUP_CATEGORIES = [
  'Texnologiya',
  'Fintex',
  "Ta'lim",
  'Sog\'liq',
  'E-commerce',
  'Logistika',
  'AI / ML',
  'O\'yinlar',
  'Ijtimoiy',
  'Boshqa',
];
