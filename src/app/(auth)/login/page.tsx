'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail } from '@/components/icons';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordField } from '@/components/ui/password-field';
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
              <PasswordField
                label="Parol"
                placeholder="Parolingiz"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-caption-1 text-slate-500 hover:text-accent-700 font-medium transition-colors"
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
             
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-caption-1 text-slate-500">yoki</span>
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
