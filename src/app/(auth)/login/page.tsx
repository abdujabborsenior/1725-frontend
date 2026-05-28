'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

const schema = z.object({
  email:    z.string().email('Email noto\'g\'ri formatda'),
  password: z.string().min(1, 'Parol kiritilmagan'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, setPendingEmail } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const res = await authApi.login(data.email, data.password);
      const payload = (res.data as { data: { accessToken: string; user: User } }).data;

      setAuth(payload.accessToken, payload.user);
      toast.success(`Xush kelibsiz, ${payload.user?.fullName ?? ''}!`);
      router.push('/problems');
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.error?.message as string | undefined;
      if (msg && (msg.includes('tasdiql') || msg.includes('verify'))) {
        setPendingEmail(data.email);
        toast(msg, { icon: '📧' });
        router.push('/verify-email');
      } else {
        toast.error(msg ?? 'Email yoki parol noto\'g\'ri');
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-brand">
              <Zap className="h-6 w-6 text-white" fill="white" />
            </div>
            <span className="text-2xl font-black text-white">StartupHub</span>
          </div>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-card">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Xush kelibsiz!</h1>
            <p className="text-slate-400 text-sm">
              Hisobingizga kiring va muammolarni hal qiling
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="sizning@email.com"
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Parol
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  className="w-full h-12 pl-11 pr-12 rounded-2xl glass border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none input-glow transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              className="mt-2"
            >
              Kirish
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500">yoki</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Register links */}
          <div className="space-y-3">
            <p className="text-center text-xs text-slate-500 mb-3">Hisobingiz yo&apos;qmi? Ro&apos;yxatdan o&apos;ting:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { href: '/register', label: 'Oddiy', sub: 'foydalanuvchi' },
                { href: '/register/school', label: 'Maktab', sub: "o'quvchisi" },
                { href: '/register/university', label: 'Talaba', sub: 'universiteti' },
              ].map(({ href, label, sub }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-0.5 p-3 rounded-2xl glass border border-white/10 hover:border-brand-400/40 hover:bg-white/8 transition-all duration-200 group"
                >
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {label}
                  </span>
                  <span className="text-[10px] text-slate-500">{sub}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
