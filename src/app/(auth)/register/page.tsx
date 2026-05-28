'use client';

import React, { useState } from 'react';
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

const UZ_REGIONS = [
  'Andijon','Buxoro',"Farg'ona",'Jizzax','Namangan','Navoiy',
  'Qashqadaryo',"Qoraqalpog'iston",'Samarqand','Sirdaryo',
  'Surxondaryo','Toshkent viloyati','Toshkent shahri','Xorazm',
];
const GRADES  = Array.from({ length: 11 }, (_, i) => i + 1);
const COURSES = Array.from({ length: 6  }, (_, i) => i + 1);

const pwd = z.string()
  .min(8, 'Kamida 8 ta belgi')
  .regex(/[A-Z]/,        'Kamida 1 ta katta harf')
  .regex(/[0-9]/,        'Kamida 1 ta raqam')
  .regex(/[!@#$%^&*]/,  'Kamida 1 ta maxsus belgi (!@#$%^&*)');

const generalSchema = z.object({
  fullName:        z.string().min(2, 'Kamida 2 ta belgi').max(150),
  dateOfBirth:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sana: YYYY-MM-DD ko'rinishida"),
  email:           z.string().email("Email noto'g'ri"),
  password:        pwd,
  confirmPassword: z.string().min(1, "Parolni tasdiqlang"),
}).refine(d => d.password === d.confirmPassword, { message: 'Parollar mos emas', path: ['confirmPassword'] });

const schoolSchema = z.object({
  fullName:        z.string().min(2, 'Kamida 2 ta belgi').max(150),
  age:             z.coerce.number({ invalid_type_error: 'Raqam kiriting' }).int().min(6, 'Min 6').max(18, 'Max 18'),
  region:          z.string().min(1, 'Tanlang'),
  district:        z.string().min(2, 'Kiriting'),
  school:          z.string().min(2, 'Kiriting'),
  grade:           z.coerce.number().int().min(1).max(11),
  email:           z.string().email("Email noto'g'ri"),
  password:        pwd,
  confirmPassword: z.string().min(1, "Parolni tasdiqlang"),
}).refine(d => d.password === d.confirmPassword, { message: 'Parollar mos emas', path: ['confirmPassword'] });

const universitySchema = z.object({
  fullName:        z.string().min(2, 'Kamida 2 ta belgi').max(150),
  age:             z.coerce.number({ invalid_type_error: 'Raqam kiriting' }).int().min(16, 'Min 16').max(35, 'Max 35'),
  region:          z.string().min(1, 'Tanlang'),
  university:      z.string().min(3, 'Kiriting'),
  course:          z.coerce.number().int().min(1).max(6),
  email:           z.string().email("Email noto'g'ri"),
  password:        pwd,
  confirmPassword: z.string().min(1, "Parolni tasdiqlang"),
}).refine(d => d.password === d.confirmPassword, { message: 'Parollar mos emas', path: ['confirmPassword'] });

type GeneralData = z.infer<typeof generalSchema>;
type SchoolData  = z.infer<typeof schoolSchema>;
type UniData     = z.infer<typeof universitySchema>;

const TYPES = [
  { id: 'general'    as UserType, icon: User,          label: "Oddiy foydalanuvchi", desc: 'Istalgan yoshdagi har qanday inson' },
  { id: 'school'     as UserType, icon: School,        label: "Maktab o'quvchisi",   desc: "1–11 sinf o'quvchilari" },
  { id: 'university' as UserType, icon: GraduationCap, label: 'Talaba',              desc: "Oliy ta'lim muassasasi talabalari" },
];

/* ── Field (forwardRef) ──────────────────────────────────────── */

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string; error?: string; hint?: string;
};

const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, hint, type = 'text', className: _, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const isPwd = type === 'password';
    return (
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">{label}</label>
        <div className="relative">
          <input
            ref={ref}
            {...props}
            type={isPwd ? (show ? 'text' : 'password') : type}
            className={cn(
              'w-full h-11 rounded-xl px-3.5 text-sm text-white placeholder:text-slate-600',
              'outline-none transition-colors bg-slate-900 border',
              error ? 'border-red-500/60 focus:border-red-500/80' : 'border-slate-800 focus:border-slate-600',
              isPwd && 'pr-11',
            )}
          />
          {isPwd && (
            <button type="button" tabIndex={-1} onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error  && <p className="text-[11px] text-red-400">{error}</p>}
        {hint && !error && <p className="text-[11px] text-slate-600">{hint}</p>}
      </div>
    );
  }
);
Field.displayName = 'Field';

/* ── SelectField (forwardRef) ────────────────────────────────── */

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string; error?: string;
};

const SelectField = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, children, className: _, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">{label}</label>
      <select ref={ref} {...props}
        className={cn(
          'w-full h-11 rounded-xl px-3.5 text-sm text-white appearance-none',
          'outline-none transition-colors bg-slate-900 border',
          error ? 'border-red-500/60' : 'border-slate-800 focus:border-slate-600',
        )}>
        {children}
      </select>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  )
);
SelectField.displayName = 'SelectField';

/* ── Submit button ───────────────────────────────────────────── */

function SubmitBtn({ isPending }: { isPending: boolean }) {
  return (
    <button type="submit" disabled={isPending}
      className="w-full h-11 rounded-xl bg-white text-black text-sm font-semibold hover:bg-slate-100 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
      {isPending
        ? <span className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
        : <><span>Ro&apos;yxatdan o&apos;tish</span><ArrowRight className="h-4 w-4" /></>
      }
    </button>
  );
}

function Footer() {
  return (
    <p className="text-center text-sm text-slate-600">
      Hisobingiz bormi?{' '}
      <Link href="/login" className="text-slate-300 hover:text-white font-medium transition-colors">Kirish</Link>
    </p>
  );
}

/* ── Form components ─────────────────────────────────────────── */

function GeneralForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } =
    useForm<GeneralData>({ resolver: zodResolver(generalSchema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: GeneralData) =>
      authApi.register({
        fullName: d.fullName, dateOfBirth: d.dateOfBirth,
        email: d.email, password: d.password, confirmPassword: d.confirmPassword,
      }),
    onSuccess: (_, v) => { setPendingEmail(v.email as string); toast.success('Emailga kod yuborildi'); router.push('/verify-email'); },
    onError:   (e: any) => toast.error(e.response?.data?.error?.message ?? 'Xatolik'),
  });

  return (
    <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-3.5">
      <Field label="To'liq ism" placeholder="Ism Familiya"
        error={errors.fullName?.message} {...register('fullName')} />
      <Field label="Tug'ilgan sana" type="date"
        error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
      <Field label="Email" type="email" placeholder="email@example.com"
        error={errors.email?.message} {...register('email')} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Parol" type="password" placeholder="P@ssword1"
          hint="8+ belgi, katta harf, raqam, maxsus belgi"
          error={errors.password?.message} {...register('password')} />
        <Field label="Tasdiqlash" type="password" placeholder="••••••••"
          error={errors.confirmPassword?.message} {...register('confirmPassword')} />
      </div>
      <SubmitBtn isPending={isPending} />
      <Footer />
    </form>
  );
}

function SchoolForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } =
    useForm<SchoolData>({ resolver: zodResolver(schoolSchema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: SchoolData) =>
      authApi.registerSchool({
        fullName: d.fullName, age: d.age, region: d.region,
        district: d.district, school: d.school, grade: d.grade,
        email: d.email, password: d.password, confirmPassword: d.confirmPassword,
      }),
    onSuccess: (_, v) => { setPendingEmail(v.email as string); toast.success('Emailga kod yuborildi'); router.push('/verify-email'); },
    onError:   (e: any) => toast.error(e.response?.data?.error?.message ?? 'Xatolik'),
  });

  return (
    <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-3.5">
      <div className="grid grid-cols-[1fr_90px] gap-3">
        <Field label="To'liq ism" placeholder="Ism Familiya"
          error={errors.fullName?.message} {...register('fullName')} />
        <Field label="Yosh" type="number" placeholder="14"
          error={errors.age?.message} {...register('age')} />
      </div>
      <SelectField label="Viloyat" error={errors.region?.message} {...register('region')}>
        <option value="">Tanlang...</option>
        {UZ_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
      </SelectField>
      <Field label="Tuman" placeholder="Chilonzor tumani"
        error={errors.district?.message} {...register('district')} />
      <div className="grid grid-cols-[1fr_110px] gap-3">
        <Field label="Maktab" placeholder="Maktab nomi yoki raqami"
          error={errors.school?.message} {...register('school')} />
        <SelectField label="Sinf" error={errors.grade?.message} {...register('grade')}>
          <option value="">Sinf</option>
          {GRADES.map(g => <option key={g} value={g}>{g}-sinf</option>)}
        </SelectField>
      </div>
      <Field label="Email" type="email" placeholder="email@example.com"
        error={errors.email?.message} {...register('email')} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Parol" type="password" placeholder="P@ssword1"
          hint="8+ belgi, katta harf, raqam, maxsus belgi"
          error={errors.password?.message} {...register('password')} />
        <Field label="Tasdiqlash" type="password" placeholder="••••••••"
          error={errors.confirmPassword?.message} {...register('confirmPassword')} />
      </div>
      <SubmitBtn isPending={isPending} />
      <Footer />
    </form>
  );
}

function UniversityForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } =
    useForm<UniData>({ resolver: zodResolver(universitySchema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: UniData) =>
      authApi.registerUniversity({
        fullName: d.fullName, age: d.age, region: d.region,
        university: d.university, course: d.course,
        email: d.email, password: d.password, confirmPassword: d.confirmPassword,
      }),
    onSuccess: (_, v) => { setPendingEmail(v.email as string); toast.success('Emailga kod yuborildi'); router.push('/verify-email'); },
    onError:   (e: any) => toast.error(e.response?.data?.error?.message ?? 'Xatolik'),
  });

  return (
    <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-3.5">
      <div className="grid grid-cols-[1fr_90px] gap-3">
        <Field label="To'liq ism" placeholder="Ism Familiya"
          error={errors.fullName?.message} {...register('fullName')} />
        <Field label="Yosh" type="number" placeholder="20"
          error={errors.age?.message} {...register('age')} />
      </div>
      <SelectField label="Viloyat" error={errors.region?.message} {...register('region')}>
        <option value="">Tanlang...</option>
        {UZ_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
      </SelectField>
      <div className="grid grid-cols-[1fr_110px] gap-3">
        <Field label="Universitet" placeholder="Universitet nomi"
          error={errors.university?.message} {...register('university')} />
        <SelectField label="Kurs" error={errors.course?.message} {...register('course')}>
          <option value="">Kurs</option>
          {COURSES.map(c => <option key={c} value={c}>{c}-kurs</option>)}
        </SelectField>
      </div>
      <Field label="Email" type="email" placeholder="email@example.com"
        error={errors.email?.message} {...register('email')} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Parol" type="password" placeholder="P@ssword1"
          hint="8+ belgi, katta harf, raqam, maxsus belgi"
          error={errors.password?.message} {...register('password')} />
        <Field label="Tasdiqlash" type="password" placeholder="••••••••"
          error={errors.confirmPassword?.message} {...register('confirmPassword')} />
      </div>
      <SubmitBtn isPending={isPending} />
      <Footer />
    </form>
  );
}

/* ── Main page ───────────────────────────────────────────────── */

export default function RegisterPage() {
  const [userType, setUserType] = useState<UserType | null>(null);
  const selected = TYPES.find(t => t.id === userType);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">

        <div className="flex items-center gap-3">
          {userType && (
            <button onClick={() => setUserType(null)}
              className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-700 transition-all flex-shrink-0">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-white">
              {selected ? selected.label : "Ro'yxatdan o'tish"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {selected ? selected.desc : 'Foydalanuvchi turini tanlang'}
            </p>
          </div>
        </div>

        {!userType && (
          <div className="space-y-2">
            {TYPES.map(({ id, icon: Icon, label, desc }) => (
              <button key={id} onClick={() => setUserType(id)}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-all text-left group">
                <span className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 group-hover:border-slate-600 transition-colors">
                  <Icon className="h-[18px] w-[18px] text-slate-400 group-hover:text-slate-200 transition-colors" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{label}</span>
                  <span className="block text-xs text-slate-600 mt-0.5">{desc}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
            <p className="text-sm text-slate-600 pt-1">
              Hisobingiz bormi?{' '}
              <Link href="/login" className="text-slate-300 hover:text-white font-medium transition-colors">Kirish</Link>
            </p>
          </div>
        )}

        {userType === 'general'    && <GeneralForm    key="general"    onBack={() => setUserType(null)} />}
        {userType === 'school'     && <SchoolForm     key="school"     onBack={() => setUserType(null)} />}
        {userType === 'university' && <UniversityForm key="university" onBack={() => setUserType(null)} />}
      </div>
    </div>
  );
}
