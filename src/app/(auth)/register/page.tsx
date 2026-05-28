'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { GraduationCap, School, User, ArrowRight, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type UserType = 'general' | 'school' | 'university';

const REGIONS = [
  'Toshkent shahri','Toshkent viloyati','Andijon','Farg\'ona','Namangan',
  'Samarqand','Buxoro','Navoiy','Qashqadaryo','Surxondaryo',
  'Jizzax','Sirdaryo','Xorazm','Qoraqalpog\'iston',
];
const GRADES  = ['1','2','3','4','5','6','7','8','9','10','11'];
const COURSES = ['1','2','3','4','5','6'];

const pwdRules = z.string()
  .min(8, 'Kamida 8 belgi')
  .regex(/[A-Z]/, '1 ta katta harf kerak')
  .regex(/[0-9]/, '1 ta raqam kerak');

const generalSchema = z.object({
  type: z.literal('general'),
  fullName: z.string().min(3, 'Kamida 3 ta belgi').max(100),
  email: z.string().email('Email noto\'g\'ri'),
  password: pwdRules,
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Parollar mos emas', path: ['confirmPassword'] });

const schoolSchema = z.object({
  type: z.literal('school'),
  fullName: z.string().min(3, 'Kamida 3 ta belgi').max(100),
  email: z.string().email('Email noto\'g\'ri'),
  password: pwdRules,
  confirmPassword: z.string(),
  age: z.coerce.number({ invalid_type_error: 'Yosh kiriting' }).min(6).max(20),
  region: z.string().min(1, 'Viloyatni tanlang'),
  district: z.string().min(2, 'Tumanni kiriting'),
  school: z.string().min(2, 'Maktabni kiriting'),
  grade: z.string().min(1, 'Sinfni tanlang'),
}).refine(d => d.password === d.confirmPassword, { message: 'Parollar mos emas', path: ['confirmPassword'] });

const universitySchema = z.object({
  type: z.literal('university'),
  fullName: z.string().min(3, 'Kamida 3 ta belgi').max(100),
  email: z.string().email('Email noto\'g\'ri'),
  password: pwdRules,
  confirmPassword: z.string(),
  age: z.coerce.number({ invalid_type_error: 'Yosh kiriting' }).min(16).max(40),
  region: z.string().min(1, 'Viloyatni tanlang'),
  university: z.string().min(2, 'Universitetni kiriting'),
  course: z.string().min(1, 'Kursni tanlang'),
}).refine(d => d.password === d.confirmPassword, { message: 'Parollar mos emas', path: ['confirmPassword'] });

type GeneralForm = z.infer<typeof generalSchema>;
type SchoolForm  = z.infer<typeof schoolSchema>;
type UniForm     = z.infer<typeof universitySchema>;
type AnyForm     = GeneralForm | SchoolForm | UniForm;

const TYPES = [
  { id: 'general'    as UserType, icon: User,           label: 'Oddiy foydalanuvchi', desc: 'Istalgan yoshdagi har qanday inson' },
  { id: 'school'     as UserType, icon: School,         label: 'Maktab o\'quvchisi',   desc: '1–11 sinf o\'quvchilari' },
  { id: 'university' as UserType, icon: GraduationCap,  label: 'Talaba',               desc: 'Oliy ta\'lim muassasasi talabalari' },
];

function getSchema(t: UserType) {
  if (t === 'school')     return schoolSchema;
  if (t === 'university') return universitySchema;
  return generalSchema;
}

/* ── Sub-components ─────────────────────────────────────────── */

function Field({
  label, error, hint, type = 'text', className, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const [show, setShow] = useState(false);
  const isPwd = type === 'password';
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={isPwd ? (show ? 'text' : 'password') : type}
          className={cn(
            'w-full h-11 px-4 rounded-xl text-sm text-white placeholder:text-slate-700 transition-all',
            'bg-[#0d0d14] border focus:outline-none',
            isPwd && 'pr-11',
            error
              ? 'border-red-500/40 focus:border-red-500/70'
              : 'border-white/[0.07] focus:border-white/20 focus:bg-[#111120]',
          )}
        />
        {isPwd && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
            {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
      {hint && !error && <p className="text-[11px] text-slate-600">{hint}</p>}
    </div>
  );
}

function SelectF({
  label, error, children, className, ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{label}</label>
      <select
        {...props}
        className={cn(
          'w-full h-11 px-4 rounded-xl text-sm text-white appearance-none transition-all',
          'bg-[#0d0d14] border focus:outline-none',
          error
            ? 'border-red-500/40'
            : 'border-white/[0.07] focus:border-white/20 focus:bg-[#111120]',
        )}
      >
        {children}
      </select>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */

export default function RegisterPage() {
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const [userType, setUserType] = useState<UserType | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } =
    useForm<AnyForm>({ resolver: zodResolver(getSchema(userType ?? 'general')) as any });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: AnyForm) => {
      if (data.type === 'school') {
        const d = data as SchoolForm;
        return authApi.registerSchool({
          fullName: d.fullName, email: d.email, password: d.password,
          age: d.age, region: d.region, district: d.district,
          school: d.school, grade: Number(d.grade),
        });
      }
      if (data.type === 'university') {
        const d = data as UniForm;
        return authApi.registerUniversity({
          fullName: d.fullName, email: d.email, password: d.password,
          age: d.age, region: d.region, university: d.university,
          course: Number(d.course),
        });
      }
      return authApi.register({ fullName: data.fullName, email: data.email, password: data.password });
    },
    onSuccess: (_, vars) => {
      setPendingEmail(vars.email);
      toast.success('Emailingizga tasdiqlash kodi yuborildi');
      router.push('/verify-email');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message ?? 'Xatolik yuz berdi');
    },
  });

  function pickType(t: UserType) {
    setUserType(t);
    reset({ type: t } as any);
  }

  const e = errors as any;

  /* ── Type selector screen ─────────────────────────── */
  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-1.5">
            <h1 className="text-[22px] font-semibold tracking-tight text-white">Ro&apos;yxatdan o&apos;tish</h1>
            <p className="text-sm text-slate-500">Davom etish uchun foydalanuvchi turini tanlang</p>
          </div>

          <div className="space-y-2.5">
            {TYPES.map(({ id, icon: Icon, label, desc }) => (
              <button key={id} onClick={() => pickType(id)}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.055] hover:border-white/[0.13] transition-all duration-200 text-left group">
                <span className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:border-white/15 transition-colors">
                  <Icon className="h-[18px] w-[18px] text-slate-400 group-hover:text-slate-200 transition-colors" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{label}</span>
                  <span className="block text-xs text-slate-600 mt-0.5">{desc}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>

          <p className="text-sm text-slate-600">
            Hisobingiz bormi?{' '}
            <Link href="/login" className="text-slate-300 hover:text-white transition-colors font-medium">
              Kirish
            </Link>
          </p>
        </div>
      </div>
    );
  }

  /* ── Registration form screen ─────────────────────── */
  const selected = TYPES.find(t => t.id === userType)!;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-7">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setUserType(null)}
            className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-slate-500 hover:text-white hover:border-white/15 transition-all flex-shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-[18px] font-semibold text-white leading-tight">{selected.label}</h1>
            <p className="text-xs text-slate-600 mt-0.5">{selected.desc}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(d => mutate({ ...d, type: userType } as any))} className="space-y-4">
          <input type="hidden" value={userType} {...register('type' as any)} />

          {/* Name + Age */}
          <div className={cn('grid gap-3', userType !== 'general' ? 'grid-cols-[1fr_100px]' : 'grid-cols-1')}>
            <Field label="To'liq ism" placeholder="Ism Familiya" error={e.fullName?.message} {...register('fullName')} />
            {userType !== 'general' && (
              <Field label="Yosh" type="number" placeholder="18" error={e.age?.message} {...register('age')} />
            )}
          </div>

          {/* Region */}
          {userType !== 'general' && (
            <SelectF label="Viloyat" error={e.region?.message} {...register('region')}>
              <option value="">Viloyatni tanlang</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </SelectF>
          )}

          {/* School-specific */}
          {userType === 'school' && (
            <>
              <Field label="Tuman" placeholder="Tuman nomi" error={e.district?.message} {...register('district' as any)} />
              <div className="grid grid-cols-[1fr_120px] gap-3">
                <Field label="Maktab" placeholder="Maktab nomi yoki raqami" error={e.school?.message} {...register('school' as any)} />
                <SelectF label="Sinf" error={e.grade?.message} {...register('grade' as any)}>
                  <option value="">Sinf</option>
                  {GRADES.map(g => <option key={g} value={g}>{g}-sinf</option>)}
                </SelectF>
              </div>
            </>
          )}

          {/* University-specific */}
          {userType === 'university' && (
            <div className="grid grid-cols-[1fr_120px] gap-3">
              <Field label="Universitet" placeholder="Universitet nomi" error={e.university?.message} {...register('university' as any)} />
              <SelectF label="Kurs" error={e.course?.message} {...register('course' as any)}>
                <option value="">Kurs</option>
                {COURSES.map(c => <option key={c} value={c}>{c}-kurs</option>)}
              </SelectF>
            </div>
          )}

          {/* Email */}
          <Field label="Email" type="email" placeholder="email@example.com" error={e.email?.message} {...register('email')} />

          {/* Password */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Parol" type="password" placeholder="••••••••"
              error={e.password?.message}
              hint="8+ belgi, 1 katta harf, 1 raqam"
              {...register('password')}
            />
            <Field
              label="Parolni tasdiqlang" type="password" placeholder="••••••••"
              error={e.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 rounded-xl bg-white text-black text-sm font-semibold hover:bg-slate-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-1"
          >
            {isPending
              ? <span className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
              : <><span>Ro&apos;yxatdan o&apos;tish</span><ArrowRight className="h-4 w-4" /></>
            }
          </button>
        </form>

        <p className="text-sm text-slate-600">
          Hisobingiz bormi?{' '}
          <Link href="/login" className="text-slate-300 hover:text-white transition-colors font-medium">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}
