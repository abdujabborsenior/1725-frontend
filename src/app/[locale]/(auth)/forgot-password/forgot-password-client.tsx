'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ChevronLeft } from '@/components/icons';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthCard } from '@/components/auth/auth-shell';
import toast from 'react-hot-toast';

export function ForgotPasswordClient() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const [sent, setSent] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('errors.emailFormat')),
      }),
    [t],
  );
  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await authApi.forgotPassword(data.email);
      setPendingEmail(data.email);
      setSent(true);
      toast.success(t('forgot.sentToast'));
      setTimeout(() => router.push('/reset-password'), 1200);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <AuthCard
      eyebrow={t('forgot.eyebrow')}
      title={t('forgot.title')}
      subtitle={t('forgot.subtitle')}
    >
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
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isSubmitting}
              disabled={sent}
            >
              {sent ? t('forgot.sent') : t('forgot.submit')}
            </Button>
          </form>

          {sent && (
            <p className="mt-4 text-center text-caption-1 text-slate-500">
              {t.rich('forgot.sentNotice', {
                email: getValues('email'),
                hl: (chunks) => <span className="text-accent-700 font-semibold">{chunks}</span>,
              })}
            </p>
          )}

          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-1.5 text-subhead text-slate-500 transition-colors hover:text-accent-700"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={3} /> {t('backToLogin')}
          </Link>
    </AuthCard>
  );
}
