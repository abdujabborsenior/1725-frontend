'use client';

import { Link, useRouter } from '@/i18n/navigation';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
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
import { PasswordField, PASSWORD_RULES, type PasswordRuleId } from '@/components/ui/password-field';
import { AuthMobileLogo } from '@/components/auth/auth-shell';
import { AuthedRedirect } from '@/components/auth/authed-redirect';
import { UZ_REGIONS, SCHOOL_GRADES, UNIVERSITY_COURSES } from '@/lib/constants';
import toast from 'react-hot-toast';

type UserType = 'general' | 'school' | 'university';

// Maktab o'quvchisi / talaba turlari VAQTINCHA o'chirilgan (2026-07-11
// direktivasi): hamma standart oqimda ro'yxatdan o'tadi (tur tanlash yo'q).
// Qayta yoqish uchun `true` qilish kifoya — formalar va sxemalar saqlangan.
const EDU_TYPES_ENABLED = false;

/* Sxema xabarlari lug'atdan (joriy tilda) keladi, shuning uchun sxemalar
   komponent ichida quriladi (`useSchemas`). Forma tiplari esa modul
   darajasida — `ReturnType` orqali — o'zgarishsiz qoladi. */
interface SchemaMessages {
  minName: string;
  maxName: string;
  choose: string;
  enter: string;
  email: string;
  rule: (id: PasswordRuleId) => string;
}

function buildSchemas(m: SchemaMessages) {
  /* Parol qoidalari — `PASSWORD_RULES` (yagona manba) dan quriladi, shuning
     uchun sxema va maydon ostidagi jonli ko'rsatkich hech qachon ajralmaydi. */
  const pwd = z.string().superRefine((v, ctx) => {
    for (const rule of PASSWORD_RULES) {
      if (!rule.test(v)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: m.rule(rule.id) });
      }
    }
  });

  const general = z.object({
    fullName: z.string().min(2, m.minName).max(150, m.maxName),
    email: z.string().email(m.email),
    password: pwd,
  });

  const school = z.object({
    fullName: z.string().min(2, m.minName).max(150, m.maxName),
    region: z.string().min(1, m.choose),
    district: z.string().min(2, m.enter),
    school: z.string().min(2, m.enter),
    grade: z.coerce.number().int().min(1, m.choose).max(11, m.choose),
    email: z.string().email(m.email),
    password: pwd,
  });

  const university = z.object({
    fullName: z.string().min(2, m.minName).max(150, m.maxName),
    region: z.string().min(1, m.choose),
    university: z.string().min(3, m.enter),
    course: z.coerce.number().int().min(1, m.choose).max(6, m.choose),
    email: z.string().email(m.email),
    password: pwd,
  });

  return { general, school, university };
}

type Schemas = ReturnType<typeof buildSchemas>;
type GeneralData = z.infer<Schemas['general']>;
type SchoolData = z.infer<Schemas['school']>;
type UniData = z.infer<Schemas['university']>;

function useSchemas(): Schemas {
  const tv = useTranslations('validation');
  const tu = useTranslations('ui.password');
  return useMemo(
    () =>
      buildSchemas({
        minName: tv('minChars', { min: '2' }),
        maxName: tv('maxChars', { max: '150' }),
        choose: tv('choose'),
        enter: tv('enter'),
        email: tv('email'),
        rule: (id) => tv('passwordRule', { rule: tu(`rules.${id}`) }),
      }),
    [tv, tu],
  );
}

const TYPES = [
  { id: 'general', icon: User },
  { id: 'school', icon: School },
  { id: 'university', icon: GraduationCap },
] as const satisfies readonly { id: UserType; icon: typeof User }[];

/* Variantlar — qiymat kanonik (bazadagi), yorliq joriy tilda. */
function useRegionOptions() {
  const t = useTranslations('auth.register');
  const tr = useTranslations('regions');
  return useMemo(
    () => [
      { value: '', label: t('regionPlaceholder') },
      ...UZ_REGIONS.map((r) => ({ value: r.value, label: tr(r.key) })),
    ],
    [t, tr],
  );
}

function useGradeOptions() {
  const t = useTranslations('auth.register');
  return useMemo(
    () => [
      { value: '', label: t('grade') },
      ...SCHOOL_GRADES.map((g) => ({ value: String(g), label: t('gradeOption', { grade: String(g) }) })),
    ],
    [t],
  );
}

function useCourseOptions() {
  const t = useTranslations('auth.register');
  return useMemo(
    () => [
      { value: '', label: t('course') },
      ...UNIVERSITY_COURSES.map((c) => ({ value: String(c), label: t('courseOption', { course: String(c) }) })),
    ],
    [t],
  );
}

function Footer() {
  const t = useTranslations('auth.register');
  return (
    <p className="text-center text-subhead text-slate-500 pt-1">
      {t.rich('haveAccount', {
        link: (chunks) => (
          <Link href="/login" className="text-accent-700 hover:text-accent-800 font-semibold transition-colors">
            {chunks}
          </Link>
        ),
      })}
    </p>
  );
}

/* ── Forms ───────────────────────────────────────────────────── */
function GeneralForm() {
  const t = useTranslations('auth');
  const schemas = useSchemas();
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } =
    useForm<GeneralData>({ resolver: zodResolver(schemas.general), mode: 'onChange' });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: GeneralData) => authApi.register(d),
    onSuccess: (_, v) => { setPendingEmail(v.email); toast.success(t('register.codeSent')); router.push('/verify-email'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
      <Input label={t('register.fullName')} placeholder={t('register.fullNamePlaceholder')} autoComplete="name"
        icon={<User className="h-4 w-4" />}
        error={errors.fullName?.message} {...register('fullName')} />
      <Input label={t('fields.email')} type="email" placeholder="email@example.com" autoComplete="email"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message} {...register('email')} />
      <PasswordField label={t('fields.password')} placeholder={t('register.passwordPlaceholder')} rules
        autoComplete="new-password"
        error={errors.password?.message} {...register('password')} />
      <Button type="submit" size="lg" fullWidth loading={isPending}>
        {t('register.submit')}
      </Button>
      <Footer />
    </form>
  );
}

function SchoolForm() {
  const t = useTranslations('auth');
  const schemas = useSchemas();
  const regionOptions = useRegionOptions();
  const gradeOptions = useGradeOptions();
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } =
    useForm<SchoolData>({ resolver: zodResolver(schemas.school), mode: 'onChange' });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: SchoolData) => authApi.registerSchool(d),
    onSuccess: (_, v) => { setPendingEmail(v.email); toast.success(t('register.codeSent')); router.push('/verify-email'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
      <Input label={t('register.fullName')} placeholder={t('register.fullNamePlaceholder')} autoComplete="name"
        icon={<User className="h-4 w-4" />}
        error={errors.fullName?.message} {...register('fullName')} />
      <Select label={t('register.region')} options={regionOptions} error={errors.region?.message} {...register('region')} />
      <Input label={t('register.district')} placeholder={t('register.districtPlaceholder')} autoComplete="address-level2" icon={<MapPin className="h-4 w-4" />}
        error={errors.district?.message} {...register('district')} />
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <Input label={t('register.school')} placeholder={t('register.schoolPlaceholder')} icon={<School className="h-4 w-4" />}
          error={errors.school?.message} {...register('school')} />
        <Select label={t('register.grade')} options={gradeOptions} error={errors.grade?.message} {...register('grade')} />
      </div>
      <Input label={t('fields.email')} type="email" placeholder="email@example.com" autoComplete="email"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message} {...register('email')} />
      <PasswordField label={t('fields.password')} placeholder={t('register.passwordPlaceholder')} rules
        autoComplete="new-password"
        error={errors.password?.message} {...register('password')} />
      <Button type="submit" size="lg" fullWidth loading={isPending}>
        {t('register.submit')}
      </Button>
      <Footer />
    </form>
  );
}

function UniversityForm() {
  const t = useTranslations('auth');
  const schemas = useSchemas();
  const regionOptions = useRegionOptions();
  const courseOptions = useCourseOptions();
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } =
    useForm<UniData>({ resolver: zodResolver(schemas.university), mode: 'onChange' });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: UniData) => authApi.registerUniversity(d),
    onSuccess: (_, v) => { setPendingEmail(v.email); toast.success(t('register.codeSent')); router.push('/verify-email'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
      <Input label={t('register.fullName')} placeholder={t('register.fullNamePlaceholder')} autoComplete="name"
        icon={<User className="h-4 w-4" />}
        error={errors.fullName?.message} {...register('fullName')} />
      <Select label={t('register.region')} options={regionOptions} error={errors.region?.message} {...register('region')} />
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <Input label={t('register.university')} placeholder={t('register.universityPlaceholder')} icon={<GraduationCap className="h-4 w-4" />}
          error={errors.university?.message} {...register('university')} />
        <Select label={t('register.course')} options={courseOptions} error={errors.course?.message} {...register('course')} />
      </div>
      <Input label={t('fields.email')} type="email" placeholder="email@example.com" autoComplete="email"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message} {...register('email')} />
      <PasswordField label={t('fields.password')} placeholder={t('register.passwordPlaceholder')} rules
        autoComplete="new-password"
        error={errors.password?.message} {...register('password')} />
      <Button type="submit" size="lg" fullWidth loading={isPending}>
        {t('register.submit')}
      </Button>
      <Footer />
    </form>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export function RegisterClient() {
  const t = useTranslations('auth.register');
  const tc = useTranslations('common');
  // Tur tanlash o'chirilganda hamma to'g'ridan-to'g'ri standart formaga tushadi.
  const [userType, setUserType] = useState<UserType | null>(
    EDU_TYPES_ENABLED ? null : 'general',
  );
  // Standart rejimda yorliq ko'rsatilmaydi ("Oddiy foydalanuvchi" ham emas).
  const selected = EDU_TYPES_ENABLED ? TYPES.find((type) => type.id === userType) : undefined;

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
                aria-label={tc('back')}
                className="tappable hv-pop h-9 w-9 rounded-full bg-accent-50 flex items-center justify-center text-accent-700 flex-shrink-0 hover:bg-accent-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h1 className="text-title-3 font-bold text-brand-900">
                {selected ? t(`types.${selected.id}.label`) : t('title')}
              </h1>
              <p className="text-caption-1 text-slate-500 mt-0.5">
                {selected
                  ? t(`types.${selected.id}.desc`)
                  : EDU_TYPES_ENABLED
                    ? t('chooseType')
                    : t('subtitle')}
              </p>
            </div>
          </div>

          {EDU_TYPES_ENABLED && !userType && (
            <div className="space-y-2.5">
              {TYPES.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setUserType(id)}
                  className="w-full flex items-center gap-4 p-4 rounded-ios-lg bg-fill-tertiary transition-colors hover:bg-accent-50 text-left group"
                >
                  <span className="h-11 w-11 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-100 group-hover:border-accent-300 transition-colors">
                    <Icon className="h-5 w-5 text-brand-900 group-hover:text-accent-700 transition-colors" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-subhead font-semibold text-brand-900">{t(`types.${id}.label`)}</span>
                    <span className="block text-caption-1 text-slate-500 mt-0.5">{t(`types.${id}.desc`)}</span>
                  </span>
                  <ChevronRight className="ios-chevron h-4 w-4 text-slate-300" strokeWidth={3} />
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
