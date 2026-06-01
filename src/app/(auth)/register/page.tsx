'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import {
  GraduationCap, School, User, ArrowRight, Eye, EyeOff,
  ChevronLeft, Zap, Mail, Lock, MapPin, CalendarDays,
} from 'lucide-react';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { UZ_REGIONS, SCHOOL_GRADES, UNIVERSITY_COURSES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type UserType = 'general' | 'school' | 'university';

const pwd = z.string()
  .min(8, 'Kamida 8 ta belgi')
  .regex(/[A-Z]/, 'Kamida 1 ta katta harf')
  .regex(/[0-9]/, 'Kamida 1 ta raqam')
  .regex(/[!@#$%^&*]/, 'Kamida 1 ta maxsus belgi (!@#$%^&*)');

const generalSchema = z.object({
  fullName: z.string().min(2, 'Kamida 2 ta belgi').max(150),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sana: YYYY-MM-DD ko'rinishida"),
  email: z.string().email("Email noto'g'ri"),
  password: pwd,
  confirmPassword: z.string().min(1, 'Parolni tasdiqlang'),
}).refine((d) => d.password === d.confirmPassword, { message: 'Parollar mos emas', path: ['confirmPassword'] });

const schoolSchema = z.object({
  fullName: z.string().min(2, 'Kamida 2 ta belgi').max(150),
  age: z.coerce.number({ invalid_type_error: 'Raqam kiriting' }).int().min(6, 'Min 6').max(18, 'Max 18'),
  region: z.string().min(1, 'Tanlang'),
  district: z.string().min(2, 'Kiriting'),
  school: z.string().min(2, 'Kiriting'),
  grade: z.coerce.number().int().min(1).max(11),
  email: z.string().email("Email noto'g'ri"),
  password: pwd,
  confirmPassword: z.string().min(1, 'Parolni tasdiqlang'),
}).refine((d) => d.password === d.confirmPassword, { message: 'Parollar mos emas', path: ['confirmPassword'] });

const universitySchema = z.object({
  fullName: z.string().min(2, 'Kamida 2 ta belgi').max(150),
  age: z.coerce.number({ invalid_type_error: 'Raqam kiriting' }).int().min(16, 'Min 16').max(35, 'Max 35'),
  region: z.string().min(1, 'Tanlang'),
  university: z.string().min(3, 'Kiriting'),
  course: z.coerce.number().int().min(1).max(6),
  email: z.string().email("Email noto'g'ri"),
  password: pwd,
  confirmPassword: z.string().min(1, 'Parolni tasdiqlang'),
}).refine((d) => d.password === d.confirmPassword, { message: 'Parollar mos emas', path: ['confirmPassword'] });

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

/* ── Password input ──────────────────────────────────────────── */
type PwdProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string; error?: string; hint?: string;
};
const PasswordInput = React.forwardRef<HTMLInputElement, PwdProps>(
  ({ label, error, hint, ...props }, ref) => {
    const [show, setShow] = useState(false);
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            ref={ref}
            {...props}
            type={show ? 'text' : 'password'}
            className={cn(
              'w-full h-12 pl-11 pr-12 rounded-xl bg-white border border-slate-200 hover:border-slate-300',
              'text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus transition-all duration-150',
              error && 'border-rose-400',
            )}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label={show ? 'Yashirish' : "Ko'rsatish"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';

function Footer() {
  return (
    <p className="text-center text-sm text-slate-500 pt-1">
      Hisobingiz bormi?{' '}
      <Link href="/login" className="text-accent-700 hover:text-accent-800 font-semibold transition-colors">
        Kirish
      </Link>
    </p>
  );
}

const PWD_HINT = '8+ belgi, katta harf, raqam, maxsus belgi';

/* ── Forms ───────────────────────────────────────────────────── */
function GeneralForm() {
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } =
    useForm<GeneralData>({ resolver: zodResolver(generalSchema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: GeneralData) => authApi.register(d),
    onSuccess: (_, v) => { setPendingEmail(v.email); toast.success('Emailga kod yuborildi'); router.push('/verify-email'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
      <Input label="To'liq ism" placeholder="Ism Familiya" icon={<User className="h-4 w-4" />}
        error={errors.fullName?.message} {...register('fullName')} />
      <Input label="Tug'ilgan sana" type="date" icon={<CalendarDays className="h-4 w-4" />}
        error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
      <Input label="Email" type="email" placeholder="email@example.com" icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message} {...register('email')} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PasswordInput label="Parol" placeholder="P@ssword1" hint={PWD_HINT}
          error={errors.password?.message} {...register('password')} />
        <PasswordInput label="Tasdiqlash" placeholder="••••••••"
          error={errors.confirmPassword?.message} {...register('confirmPassword')} />
      </div>
      <Button type="submit" size="lg" fullWidth loading={isPending}>
        Ro&apos;yxatdan o&apos;tish <ArrowRight className="h-4 w-4" />
      </Button>
      <Footer />
    </form>
  );
}

function SchoolForm() {
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } =
    useForm<SchoolData>({ resolver: zodResolver(schoolSchema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: SchoolData) => authApi.registerSchool(d),
    onSuccess: (_, v) => { setPendingEmail(v.email); toast.success('Emailga kod yuborildi'); router.push('/verify-email'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
      <div className="grid grid-cols-[1fr_96px] gap-3">
        <Input label="To'liq ism" placeholder="Ism Familiya" icon={<User className="h-4 w-4" />}
          error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Yosh" type="number" placeholder="14" error={errors.age?.message} {...register('age')} />
      </div>
      <Select label="Viloyat" options={REGION_OPTIONS} error={errors.region?.message} {...register('region')} />
      <Input label="Tuman" placeholder="Chilonzor tumani" icon={<MapPin className="h-4 w-4" />}
        error={errors.district?.message} {...register('district')} />
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <Input label="Maktab" placeholder="Maktab nomi / raqami" icon={<School className="h-4 w-4" />}
          error={errors.school?.message} {...register('school')} />
        <Select label="Sinf" options={GRADE_OPTIONS} error={errors.grade?.message} {...register('grade')} />
      </div>
      <Input label="Email" type="email" placeholder="email@example.com" icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message} {...register('email')} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PasswordInput label="Parol" placeholder="P@ssword1" hint={PWD_HINT}
          error={errors.password?.message} {...register('password')} />
        <PasswordInput label="Tasdiqlash" placeholder="••••••••"
          error={errors.confirmPassword?.message} {...register('confirmPassword')} />
      </div>
      <Button type="submit" size="lg" fullWidth loading={isPending}>
        Ro&apos;yxatdan o&apos;tish <ArrowRight className="h-4 w-4" />
      </Button>
      <Footer />
    </form>
  );
}

function UniversityForm() {
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } =
    useForm<UniData>({ resolver: zodResolver(universitySchema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: UniData) => authApi.registerUniversity(d),
    onSuccess: (_, v) => { setPendingEmail(v.email); toast.success('Emailga kod yuborildi'); router.push('/verify-email'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
      <div className="grid grid-cols-[1fr_96px] gap-3">
        <Input label="To'liq ism" placeholder="Ism Familiya" icon={<User className="h-4 w-4" />}
          error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Yosh" type="number" placeholder="20" error={errors.age?.message} {...register('age')} />
      </div>
      <Select label="Viloyat" options={REGION_OPTIONS} error={errors.region?.message} {...register('region')} />
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <Input label="Universitet" placeholder="Universitet nomi" icon={<GraduationCap className="h-4 w-4" />}
          error={errors.university?.message} {...register('university')} />
        <Select label="Kurs" options={COURSE_OPTIONS} error={errors.course?.message} {...register('course')} />
      </div>
      <Input label="Email" type="email" placeholder="email@example.com" icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message} {...register('email')} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PasswordInput label="Parol" placeholder="P@ssword1" hint={PWD_HINT}
          error={errors.password?.message} {...register('password')} />
        <PasswordInput label="Tasdiqlash" placeholder="••••••••"
          error={errors.confirmPassword?.message} {...register('confirmPassword')} />
      </div>
      <Button type="submit" size="lg" fullWidth loading={isPending}>
        Ro&apos;yxatdan o&apos;tish <ArrowRight className="h-4 w-4" />
      </Button>
      <Footer />
    </form>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const [userType, setUserType] = useState<UserType | null>(null);
  const selected = TYPES.find((t) => t.id === userType);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-brand-900 flex items-center justify-center">
              <Zap className="h-6 w-6 text-accent-400" fill="currentColor" />
            </div>
            <span className="text-2xl font-black text-brand-900">StartupHub</span>
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-card">
          <div className="flex items-center gap-3 mb-7">
            {userType && (
              <button
                onClick={() => setUserType(null)}
                aria-label="Orqaga"
                className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand-900 hover:border-slate-300 transition-all flex-shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-brand-900">
                {selected ? selected.label : "Ro'yxatdan o'tish"}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {selected ? selected.desc : 'Foydalanuvchi turini tanlang'}
              </p>
            </div>
          </div>

          {!userType && (
            <div className="space-y-2.5">
              {TYPES.map(({ id, icon: Icon, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setUserType(id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-accent-500 hover:bg-accent-50/40 transition-all text-left group"
                >
                  <span className="h-11 w-11 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-100 group-hover:border-accent-300 transition-colors">
                    <Icon className="h-5 w-5 text-brand-900 group-hover:text-accent-700 transition-colors" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-brand-900">{label}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{desc}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-accent-700 group-hover:translate-x-0.5 transition-all" />
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
    </div>
  );
}
