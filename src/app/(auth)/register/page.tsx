'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import {
  GraduationCap, School, User,
  ChevronLeft, ChevronRight, Mail, MapPin,
} from '@/components/icons';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PasswordField, PASSWORD_RULES } from '@/components/ui/password-field';
import { AuthMobileLogo } from '@/components/auth/auth-shell';
import { AuthedRedirect } from '@/components/auth/authed-redirect';
import { UZ_REGIONS, SCHOOL_GRADES, UNIVERSITY_COURSES } from '@/lib/constants';
import toast from 'react-hot-toast';

type UserType = 'general' | 'school' | 'university';

// Maktab o'quvchisi / talaba turlari VAQTINCHA o'chirilgan (2026-07-11
// direktivasi): hamma standart oqimda ro'yxatdan o'tadi (tur tanlash yo'q).
// Qayta yoqish uchun `true` qilish kifoya — formalar va sxemalar saqlangan.
const EDU_TYPES_ENABLED = false;

/* Parol qoidalari — `PASSWORD_RULES` (yagona manba) dan quriladi, shuning
   uchun sxema va maydon ostidagi jonli ko'rsatkich hech qachon ajralmaydi. */
const pwd = z.string().superRefine((v, ctx) => {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(v)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Kerak: ${rule.label}` });
    }
  }
});

const generalSchema = z.object({
  fullName: z.string().min(2, 'Kamida 2 ta belgi').max(150),
  email: z.string().email("Email noto'g'ri"),
  password: pwd,
});

const schoolSchema = z.object({
  fullName: z.string().min(2, 'Kamida 2 ta belgi').max(150),
  region: z.string().min(1, 'Tanlang'),
  district: z.string().min(2, 'Kiriting'),
  school: z.string().min(2, 'Kiriting'),
  grade: z.coerce.number().int().min(1).max(11),
  email: z.string().email("Email noto'g'ri"),
  password: pwd,
});

const universitySchema = z.object({
  fullName: z.string().min(2, 'Kamida 2 ta belgi').max(150),
  region: z.string().min(1, 'Tanlang'),
  university: z.string().min(3, 'Kiriting'),
  course: z.coerce.number().int().min(1).max(6),
  email: z.string().email("Email noto'g'ri"),
  password: pwd,
});

type GeneralData = z.infer<typeof generalSchema>;
type SchoolData = z.infer<typeof schoolSchema>;
type UniData = z.infer<typeof universitySchema>;

const TYPES: { id: UserType; icon: typeof User; label: string; desc: string }[] = [
  { id: 'general', icon: User, label: 'Oddiy foydalanuvchi', desc: 'Istalgan yoshdagi har qanday inson' },
  { id: 'school', icon: School, label: "Maktab o'quvchisi", desc: "1–11 sinf o'quvchilari" },
  { id: 'university', icon: GraduationCap, label: 'Talaba', desc: "Oliy ta'lim muassasasi talabalari" },
];

const REGION_OPTIONS = [
  { value: '', label: 'Viloyatni tanlang...' },
  ...UZ_REGIONS.map((r) => ({ value: r, label: r })),
];
const GRADE_OPTIONS = [
  { value: '', label: 'Sinf' },
  ...SCHOOL_GRADES.map((g) => ({ value: String(g), label: `${g}-sinf` })),
];
const COURSE_OPTIONS = [
  { value: '', label: 'Kurs' },
  ...UNIVERSITY_COURSES.map((c) => ({ value: String(c), label: `${c}-kurs` })),
];

function Footer() {
  return (
    <p className="text-center text-subhead text-slate-500 pt-1">
      Hisobingiz bormi?{' '}
      <Link href="/login" className="text-accent-700 hover:text-accent-800 font-semibold transition-colors">
        Kirish
      </Link>
    </p>
  );
}

/* ── Forms ───────────────────────────────────────────────────── */
function GeneralForm() {
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } =
    useForm<GeneralData>({ resolver: zodResolver(generalSchema), mode: 'onChange' });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: GeneralData) => authApi.register(d),
    onSuccess: (_, v) => { setPendingEmail(v.email); toast.success('Emailga kod yuborildi'); router.push('/verify-email'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
      <Input label="To'liq ism" placeholder="Ism Familiya" autoComplete="name"
        icon={<User className="h-4 w-4" />}
        error={errors.fullName?.message} {...register('fullName')} />
      <Input label="Email" type="email" placeholder="email@example.com" autoComplete="email"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message} {...register('email')} />
      <PasswordField label="Parol" placeholder="Parol yarating" rules
        autoComplete="new-password"
        error={errors.password?.message} {...register('password')} />
      <Button type="submit" size="lg" fullWidth loading={isPending}>
        Ro&apos;yxatdan o&apos;tish
      </Button>
      <Footer />
    </form>
  );
}

function SchoolForm() {
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } =
    useForm<SchoolData>({ resolver: zodResolver(schoolSchema), mode: 'onChange' });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: SchoolData) => authApi.registerSchool(d),
    onSuccess: (_, v) => { setPendingEmail(v.email); toast.success('Emailga kod yuborildi'); router.push('/verify-email'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
      <Input label="To'liq ism" placeholder="Ism Familiya" autoComplete="name"
        icon={<User className="h-4 w-4" />}
        error={errors.fullName?.message} {...register('fullName')} />
      <Select label="Viloyat" options={REGION_OPTIONS} error={errors.region?.message} {...register('region')} />
      <Input label="Tuman" placeholder="Chilonzor tumani" autoComplete="address-level2" icon={<MapPin className="h-4 w-4" />}
        error={errors.district?.message} {...register('district')} />
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <Input label="Maktab" placeholder="Maktab nomi / raqami" icon={<School className="h-4 w-4" />}
          error={errors.school?.message} {...register('school')} />
        <Select label="Sinf" options={GRADE_OPTIONS} error={errors.grade?.message} {...register('grade')} />
      </div>
      <Input label="Email" type="email" placeholder="email@example.com" autoComplete="email"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message} {...register('email')} />
      <PasswordField label="Parol" placeholder="Parol yarating" rules
        autoComplete="new-password"
        error={errors.password?.message} {...register('password')} />
      <Button type="submit" size="lg" fullWidth loading={isPending}>
        Ro&apos;yxatdan o&apos;tish
      </Button>
      <Footer />
    </form>
  );
}

function UniversityForm() {
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } =
    useForm<UniData>({ resolver: zodResolver(universitySchema), mode: 'onChange' });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: UniData) => authApi.registerUniversity(d),
    onSuccess: (_, v) => { setPendingEmail(v.email); toast.success('Emailga kod yuborildi'); router.push('/verify-email'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
      <Input label="To'liq ism" placeholder="Ism Familiya" autoComplete="name"
        icon={<User className="h-4 w-4" />}
        error={errors.fullName?.message} {...register('fullName')} />
      <Select label="Viloyat" options={REGION_OPTIONS} error={errors.region?.message} {...register('region')} />
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <Input label="Universitet" placeholder="Universitet nomi" icon={<GraduationCap className="h-4 w-4" />}
          error={errors.university?.message} {...register('university')} />
        <Select label="Kurs" options={COURSE_OPTIONS} error={errors.course?.message} {...register('course')} />
      </div>
      <Input label="Email" type="email" placeholder="email@example.com" autoComplete="email"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message} {...register('email')} />
      <PasswordField label="Parol" placeholder="Parol yarating" rules
        autoComplete="new-password"
        error={errors.password?.message} {...register('password')} />
      <Button type="submit" size="lg" fullWidth loading={isPending}>
        Ro&apos;yxatdan o&apos;tish
      </Button>
      <Footer />
    </form>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function RegisterPage() {
  // Tur tanlash o'chirilganda hamma to'g'ridan-to'g'ri standart formaga tushadi.
  const [userType, setUserType] = useState<UserType | null>(
    EDU_TYPES_ENABLED ? null : 'general',
  );
  // Standart rejimda yorliq ko'rsatilmaydi ("Oddiy foydalanuvchi" ham emas).
  const selected = EDU_TYPES_ENABLED ? TYPES.find((t) => t.id === userType) : undefined;

  return (
    <div className="w-full max-w-md">
      {/* Allaqachon kirgan foydalanuvchi formani ko'rmaydi — maqsadiga qaytadi */}
      <AuthedRedirect />
      <AuthMobileLogo />
      <div className="rounded-ios-2xl bg-white p-7 shadow-card sm:p-8">
          <div className="flex items-center gap-3 mb-7">
            {EDU_TYPES_ENABLED && userType && (
              <button
                onClick={() => setUserType(null)}
                aria-label="Orqaga"
                className="tappable h-9 w-9 rounded-full bg-fill-tertiary flex items-center justify-center text-accent-700 flex-shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h1 className="text-title-3 font-bold text-brand-900">
                {selected ? selected.label : "Ro'yxatdan o'tish"}
              </h1>
              <p className="text-caption-1 text-slate-500 mt-0.5">
                {selected
                  ? selected.desc
                  : EDU_TYPES_ENABLED
                    ? 'Foydalanuvchi turini tanlang'
                    : 'Bir daqiqada bepul hisob yarating'}
              </p>
            </div>
          </div>

          {EDU_TYPES_ENABLED && !userType && (
            <div className="space-y-2.5">
              {TYPES.map(({ id, icon: Icon, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setUserType(id)}
                  className="w-full flex items-center gap-4 p-4 rounded-ios-lg bg-fill-tertiary transition-colors hover:bg-fill text-left group"
                >
                  <span className="h-11 w-11 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-100 group-hover:border-accent-300 transition-colors">
                    <Icon className="h-5 w-5 text-brand-900 group-hover:text-accent-700 transition-colors" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-subhead font-semibold text-brand-900">{label}</span>
                    <span className="block text-caption-1 text-slate-500 mt-0.5">{desc}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300" strokeWidth={3} />
                </button>
              ))}
              <Footer />
            </div>
          )}

          {userType === 'general' && <GeneralForm key="general" />}
          {userType === 'school' && <SchoolForm key="school" />}
          {userType === 'university' && <UniversityForm key="university" />}
      </div>
    </div>
  );
}
