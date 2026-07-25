'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from '@/components/icons';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthCard } from '@/components/auth/auth-shell';
import { consumeNext } from '@/components/auth/next-capture';
import { AuthedRedirect } from '@/components/auth/authed-redirect';
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

  // ?next= ni (auth) layout'dagi NextCapture saqlaydi — bu yerda faqat o'qiymiz.
  function redirectAfterAuth() {
    router.push(consumeNext() ?? '/problems');
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
        toast(msg, { icon: <Mail className="h-5 w-5 text-accent-600" /> });
        router.push('/verify-email');
      } else {
        toast.error(msg);
      }
    }
  }

  return (
    <AuthCard
      eyebrow="Kirish"
      title="Xush kelibsiz!"
      subtitle="Hisobingizga kiring va g'oyalaringizni hayotga tatbiq eting"
    >
      {/* Allaqachon kirgan foydalanuvchi formani ko'rmaydi — maqsadiga qaytadi */}
      <AuthedRedirect />
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
                  className="h-12 w-full rounded-ios-md border border-slate-200 bg-white pl-11 pr-12 text-body text-brand-900 placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 ease-ios focus:outline-none input-focus"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-700 transition-colors"
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
            <span className="text-xs text-slate-500">yoki</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Register link */}
          <p className="text-center text-subhead text-slate-500">
            Hisobingiz yo&apos;qmi?{' '}
            <Link href="/register" className="text-accent-700 hover:text-accent-800 font-semibold transition-colors">
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </p>
    </AuthCard>
  );
}
