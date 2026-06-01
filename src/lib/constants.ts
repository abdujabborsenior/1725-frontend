import type { ProblemStatus, SolutionStatus, UserRole } from '@/types';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

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
  pending:      'bg-amber-50 text-amber-700 border-amber-200',
  open:         'bg-accent-50 text-accent-700 border-accent-200',
  under_review: 'bg-sky-50 text-sky-700 border-sky-200',
  resolved:     'bg-violet-50 text-violet-700 border-violet-200',
  rejected:     'bg-rose-50 text-rose-700 border-rose-200',
};

/* ── Solution status ──────────────────────────────────────────── */
export const SOLUTION_STATUS_LABEL: Record<SolutionStatus, string> = {
  pending: 'Kutilmoqda',
  accepted: 'Qabul qilingan',
  rejected: 'Rad etilgan',
};

export const SOLUTION_STATUS_BADGE: Record<SolutionStatus, string> = {
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-accent-50 text-accent-700 border-accent-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
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
  superadmin:         'bg-violet-50 text-violet-700 border-violet-200',
  analyzer:           'bg-cyan-50 text-cyan-700 border-cyan-200',
  school_student:     'bg-accent-50 text-accent-700 border-accent-200',
  university_student: 'bg-sky-50 text-sky-700 border-sky-200',
  user:               'bg-slate-50 text-slate-700 border-slate-200',
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
