'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User, Mail, Lock, Eye, EyeOff,
  ArrowRight, ArrowLeft, Zap, CheckCircle2, MapPin, BookOpen,
} from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import toast from 'react-hot-toast';

const UZ_REGIONS = [
  'Toshkent shahri','Toshkent viloyati','Samarqand','Buxoro','Farg\'ona',
  'Namangan','Andijon','Qashqadaryo','Surxondaryo','Xorazm',
  'Navoiy','Jizzax','Sirdaryo','Qoraqalpog\'iston',
];

const schema = z.object({
  fullName:        z.string().min(3, 'Kamida 3 ta belgi'),
  age:             z.coerce.number().min(16,'16 yoshdan').max(35,'35 yoshgacha'),
  region:          z.string().min(1, 'Viloyat tanlang'),
  university:      z.string().min(2, 'Universitet nomini kiriting'),
  course:          z.coerce.number().min(1).max(6),
  email:           z.string().email('Email noto\'g\'ri'),
  password:        z.string().min(8,'Kamida 8 ta belgi').regex(/[A-Z]/,'Katta harf').regex(/[0-9]/,'Raqam'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Parollar mos kelmayapti', path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

const STEPS = [
  { title: 'Shaxsiy', subtitle: 'Ism va yosh' },
  { title: 'Universitet', subtitle: 'Ta\'lim ma\'lumotlari' },
  { title: 'Kirish', subtitle: 'Email va parol' },
];

const STEP_FIELDS: (keyof FormData)[][] = [
  ['fullName', 'age'],
  ['region', 'university', 'course'],
  ['email', 'password', 'confirmPassword'],
];

export default function RegisterUniversityPage() {
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const [step, setStep] = useState(0);
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, trigger, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema), mode: 'onTouched' });

  async function nextStep() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep(s => s + 1);
  }

  async function onSubmit(data: FormData) {
    try {
      await authApi.registerUniversity({
        fullName: data.fullName, age: data.age, region: data.region,
        university: data.university, course: data.course,
        email: data.email, password: data.password, confirmPassword: data.confirmPassword,
      });
      setPendingEmail(data.email);
      toast.success('Ro\'yxatdan o\'tdingiz! Email tasdiqlang');
      router.push('/verify-email');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error.response?.data?.error?.message ?? 'Xatolik yuz berdi');
    }
  }

  const regionOptions = [
    { value: '', label: 'Viloyat tanlang' },
    ...UZ_REGIONS.map(r => ({ value: r, label: r })),
  ];

  const courseOptions = [
    { value: '', label: 'Kurs tanlang' },
    ...Array.from({ length: 6 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}-kurs` })),
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex justify-center mb-8">
          <Link href="/login" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-12 w-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-brand">
              <Zap className="h-6 w-6 text-white" fill="white" />
            </div>
            <span className="text-2xl font-black text-white">StartupHub</span>
          </Link>
        </div>

        <div className="glass-strong rounded-3xl p-8 shadow-card">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-400/30">
              <BookOpen className="h-4 w-4 text-brand-400" />
              <span className="text-sm font-semibold text-brand-400">Talaba</span>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-1 mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-1 flex-1">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${
                  i < step ? 'bg-neon-green text-gray-900' :
                  i === step ? 'bg-gradient-brand text-white shadow-glow-brand' :
                  'glass border border-white/10 text-slate-500'
                }`}>
                  {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <div className="flex-1 min-w-0 hidden sm:block">
                  <p className={`text-[10px] font-semibold truncate transition-colors ${i === step ? 'text-white' : 'text-slate-600'}`}>
                    {s.title}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 mx-1 transition-colors duration-300 ${i < step ? 'bg-neon-green/50' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="mb-5">
            <h1 className="text-xl font-bold text-white">{STEPS[step].title}</h1>
            <p className="text-sm text-slate-400 mt-0.5">{STEPS[step].subtitle}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {step === 0 && (
              <>
                <Input label="To'liq ism" placeholder="Ism Familiya"
                  icon={<User className="h-4 w-4" />} error={errors.fullName?.message}
                  {...register('fullName')} />
                <Input label="Yosh" type="number" placeholder="20" min={16} max={35}
                  error={errors.age?.message} {...register('age')} />
                <Button type="button" size="lg" fullWidth onClick={nextStep}>
                  Davom etish <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {step === 1 && (
              <>
                <Select label="Viloyat" options={regionOptions}
                  error={errors.region?.message} {...register('region')} />
                <Input label="Universitet" placeholder="Universiteti nomi"
                  icon={<MapPin className="h-4 w-4" />} error={errors.university?.message}
                  {...register('university')} />
                <Select label="Kurs" options={courseOptions}
                  error={errors.course?.message} {...register('course')} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" size="lg" onClick={() => setStep(0)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="lg" fullWidth onClick={nextStep}>
                    Davom etish <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <Input label="Email" type="email" placeholder="sizning@email.com"
                  icon={<Mail className="h-4 w-4" />} error={errors.email?.message}
                  {...register('email')} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Parol</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                      {...register('password')}
                      className="w-full h-12 pl-11 pr-12 rounded-2xl glass border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none input-glow transition-all" />
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                </div>
                <Input label="Parolni tasdiqlang" type="password" placeholder="••••••••"
                  icon={<Lock className="h-4 w-4" />} error={errors.confirmPassword?.message}
                  {...register('confirmPassword')} />
                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
                    Ro&apos;yxatdan o&apos;tish <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Hisobingiz bormi?{' '}
            <Link href="/login" className="text-brand-400 hover:text-white font-semibold transition-colors">
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
