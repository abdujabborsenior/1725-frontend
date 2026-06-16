'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

const schema = z.object({
  email:    z.string().email("Email noto'g'ri formatda"),
  password: z.string().min(1, 'Parol kiritilmagan'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, setPendingEmail } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  // Ulashilgan havoladan kelgan bo'lsa — qaytib boriladigan manzilni saqlaymiz
  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get('next');
    if (next && next.startsWith('/')) sessionStorage.setItem('sh_next', next);
  }, []);

  function redirectAfterAuth() {
    const next = sessionStorage.getItem('sh_next');
    sessionStorage.removeItem('sh_next');
    router.push(next && next.startsWith('/') ? next : '/problems');
  }

  async function onSubmit(data: FormData) {
    try {
      const payload = await authApi.login(data.email, data.password);
      setAuth(payload.accessToken, payload.refreshToken, payload.user);
      toast.success(`Xush kelibsiz, ${payload.user?.fullName ?? ''}!`);
      redirectAfterAuth();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Email yoki parol noto'g'ri");
      if (msg.includes('tasdiql') || msg.toLowerCase().includes('verif')) {
        setPendingEmail(data.email);
        toast(msg, { icon: '📧' });
        router.push('/verify-email');
      } else {
        toast.error(msg);
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
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

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-card">
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-brand-900 mb-2">Xush kelibsiz!</h1>
            <p className="text-slate-500 text-sm">
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
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Parol
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  className="w-full h-12 pl-11 pr-12 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label={showPwd ? 'Parolni yashirish' : "Parolni ko'rsatish"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600">{errors.password.message}</p>
              )}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs text-slate-500 hover:text-accent-700 font-medium transition-colors"
                >
                  Parolni unutdingizmi?
                </Link>
              </div>
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
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">yoki</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Register links */}
          <div className="space-y-3">
            <p className="text-center text-xs text-slate-500 mb-3">
              Hisobingiz yo&apos;qmi? Ro&apos;yxatdan o&apos;ting:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { href: '/register',            label: 'Oddiy',  sub: 'foydalanuvchi' },
                { href: '/register/school',     label: 'Maktab', sub: "o'quvchisi" },
                { href: '/register/university', label: 'Talaba', sub: 'universiteti' },
              ].map(({ href, label, sub }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-0.5 p-3 rounded-xl border border-slate-200 hover:border-accent-500 hover:bg-accent-50 transition-all duration-150 group"
                >
                  <span className="text-xs font-semibold text-brand-900 group-hover:text-accent-700 transition-colors">
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
