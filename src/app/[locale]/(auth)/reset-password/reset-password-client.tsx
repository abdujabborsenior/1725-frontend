'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ShieldCheck, RefreshCw, ArrowLeft } from '@/components/icons';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { PasswordField, isPasswordValid } from '@/components/ui/password-field';
import { AuthCard } from '@/components/auth/auth-shell';
import toast from 'react-hot-toast';

export function ResetPasswordClient() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { pendingEmail, hasHydrated } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (hasHydrated && !pendingEmail) router.replace('/forgot-password');
  }, [hasHydrated, pendingEmail, router]);

  useEffect(() => {
    if (resendCountdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const passwordValid = isPasswordValid(password);
  const matches = password === confirm && confirm.length > 0;
  const canSubmit = otp.length === 6 && passwordValid && matches && !loading;

  async function handleSubmit() {
    if (!pendingEmail || !canSubmit) return;
    setLoading(true);
    try {
      await authApi.resetPassword({
        email: pendingEmail,
        code: otp,
        newPassword: password,
        confirmPassword: confirm,
      });
      toast.success(t('reset.success'));
      router.push('/login');
    } catch (err) {
      toast.error(getErrorMessage(err, t('errors.codeInvalid')));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!pendingEmail || !canResend) return;
    try {
      await authApi.resendOtp(pendingEmail, 'password_reset');
      setResendCountdown(60);
      setCanResend(false);
      setOtp('');
      toast.success(t('codeResent'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (!pendingEmail) return null;

  return (
    <AuthCard
      eyebrow={t('reset.eyebrow')}
      title={t('reset.title')}
      subtitle={t('reset.subtitle')}
    >
          <p className="-mt-4 mb-5 truncate text-subhead font-semibold text-accent-700">
            {pendingEmail}
          </p>
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3">
              <label className="text-footnote font-medium text-slate-500 self-start">
                {t('reset.codeLabel')}
              </label>
              <OtpInput value={otp} onChange={setOtp} length={6} />
            </div>

            <PasswordField
              label={t('reset.newPassword')}
              placeholder={t('reset.newPasswordPlaceholder')}
              autoComplete="new-password"
              rules
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <PasswordField
              label={t('reset.confirm')}
              placeholder={t('reset.confirmPlaceholder')}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={confirm.length > 0 && !matches ? t('reset.mismatch') : undefined}
            />

            <Button
              size="lg"
              fullWidth
              loading={loading}
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              <ShieldCheck className="h-4 w-4" /> {t('reset.submit')}
            </Button>

            <button
              onClick={handleResend}
              disabled={!canResend}
              className="flex items-center justify-center gap-2 w-full text-subhead text-slate-500 hover:text-accent-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors py-1"
            >
              <RefreshCw className="h-4 w-4" />
              {canResend ? t('resend') : t('resendIn', { seconds: String(resendCountdown) })}
            </button>
          </div>

          <Link
            href="/login"
            className="mt-5 flex items-center justify-center gap-1.5 text-subhead text-slate-500 transition-colors hover:text-accent-700"
          >
            <ArrowLeft className="h-4 w-4" /> {t('backToLogin')}
          </Link>
    </AuthCard>
  );
}
