'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
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
import { navigateAfterAuthChange } from '@/lib/auth-navigation';
import { AuthedRedirect } from '@/components/auth/authed-redirect';
import toast from 'react-hot-toast';

/**
 * Tasdiqlanmagan email xatosi. Backend bu holat uchun alohida kod bermaydi
 * (umumiy `HTTP_401`), matn esa foydalanuvchi tilida keladi — shuning uchun
 * uch tildagi o'zak bo'yicha taniladi: "tasdiql…" (uz) · "verif…" (en) ·
 * "подтвер…" (ru).
 */
function isUnverifiedEmailError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return lower.includes('tasdiql') || lower.includes('verif') || lower.includes('подтвер');
}

export function LoginClient() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { setAuth, setPendingEmail } = useAuthStore();

  const schema = useMemo(
    () =>
      z.object({
        email:    z.string().email(t('errors.emailFormat')),
        password: z.string().min(1, t('login.passwordRequired')),
      }),
    [t],
  );
  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  // ?next= ni (auth) layout'dagi NextCapture saqlaydi — bu yerda faqat o'qiymiz.
  // Navigatsiya `navigateAfterAuthChange` orqali: u avval Router Cache'ni
  // bekor qiladi (mehmon davrida keshlangan redirect'lar qolib ketmasin).
  function redirectAfterAuth() {
    navigateAfterAuthChange(consumeNext() ?? '/problems');
  }

  async function onSubmit(data: FormData) {
    try {
      const payload = await authApi.login(data.email, data.password);
      setAuth(payload.accessToken, payload.refreshToken, payload.user);
      toast.success(t('login.welcome', { name: payload.user?.fullName ?? '' }));
      redirectAfterAuth();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, t('login.failed'));
      if (isUnverifiedEmailError(msg)) {
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
      eyebrow={t('login.eyebrow')}
      title={t('login.title')}
      subtitle={t('login.subtitle')}
    >
      {/* Allaqachon kirgan foydalanuvchi formani ko'rmaydi — maqsadiga qaytadi */}
      <AuthedRedirect />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label={t('fields.email')}
              type="email"
              placeholder={t('fields.emailPlaceholder')}
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="flex flex-col gap-1.5">
              <PasswordField
                label={t('fields.password')}
                placeholder={t('login.passwordPlaceholder')}
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="tappable -me-1.5 inline-flex min-h-[32px] items-center rounded-full px-1.5 text-subhead font-medium text-accent-600 transition-colors hover:text-accent-700"
                >
                  {t('login.forgot')}
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
              {t('login.submit')}
            </Button>
          </form>

          {/* iOS: ikki chiziqli "divider" o'rniga bitta hairline —
              qo'shimcha amal ostida, tinch. */}
          <div className="hairline-t mt-7 pt-5">
            <p className="text-center text-subhead text-slate-500">
              {t.rich('login.noAccount', {
                link: (chunks) => (
                  <Link
                    href="/register"
                    className="font-semibold text-accent-600 transition-colors hover:text-accent-700"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>
    </AuthCard>
  );
}
