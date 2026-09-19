'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, RefreshCw, CheckCircle2 } from '@/components/icons';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { AuthMobileLogo } from '@/components/auth/auth-shell';
import { consumeNext } from '@/components/auth/next-capture';
import { navigateAfterAuthChange } from '@/lib/auth-navigation';
import toast from 'react-hot-toast';

export function VerifyEmailClient() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { pendingEmail, hasHydrated, clearAuth, setAuth } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (hasHydrated && !pendingEmail) router.replace('/login');
  }, [hasHydrated, pendingEmail, router]);

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleVerify() {
    if (otp.length !== 6 || !pendingEmail) return;
    setLoading(true);
    setOtpError(false);
    try {
      const res = await authApi.verifyOtp(pendingEmail, otp);
      setSuccess(true);
      if (res.accessToken && res.refreshToken && res.user) {
        // Avto-login: qayta parol kiritmasdan maqsad sahifasiga qaytamiz
        // (masalan startap joylash / muammo yuborish / yechim berish).
        setAuth(res.accessToken, res.refreshToken, res.user);
        const next = consumeNext();
        toast.success(t('verify.welcome', { name: res.user.fullName }));
        setTimeout(() => navigateAfterAuthChange(next ?? '/problems'), 1200);
      } else {
        toast.success(t('verify.verifiedToast'));
        setTimeout(() => router.push('/login'), 1500);
      }
    } catch {
      setOtpError(true);
      toast.error(t('errors.codeInvalid'));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!pendingEmail || !canResend) return;
    setResendLoading(true);
    try {
      await authApi.resendOtp(pendingEmail);
      setCountdown(60);
      setCanResend(false);
      setOtp('');
      setOtpError(false);
      toast.success(t('codeResent'));
    } catch {
      toast.error(t('errors.generic'));
    } finally {
      setResendLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center animate-slide-up">
        <div className="h-24 w-24 rounded-full bg-accent-50 border border-accent-200 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-12 w-12 text-accent-600" />
        </div>
        <h1 className="mb-2 text-title-1 font-bold tracking-tight text-brand-900">{t('verify.verified')}</h1>
        <p className="text-slate-500">{t('redirecting')}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <AuthMobileLogo />
      <div className="rounded-ios-2xl bg-white p-7 text-center shadow-card sm:p-8">
          <div className="h-20 w-20 rounded-[18px] bg-accent-500 flex items-center justify-center mx-auto mb-6">
            <Mail className="h-10 w-10 text-white" />
          </div>

          <h1 className="mb-2 text-title-1 font-bold tracking-tight text-brand-900">{t('verify.title')}</h1>
          <p className="text-slate-500 text-subhead mb-1">
            {t('verify.sentTo')}
          </p>
          <p className="text-accent-700 font-semibold text-subhead mb-8 truncate">
            {pendingEmail}
          </p>

          <div className="flex justify-center mb-3">
            <OtpInput value={otp} onChange={setOtp} length={6} error={otpError} />
          </div>
          {otpError && (
            <p className="text-subhead text-rose-600 mb-4">{t('errors.codeInvalid')}</p>
          )}

          <div className="space-y-3 mt-6">
            <Button
              size="lg"
              fullWidth
              loading={loading}
              disabled={otp.length !== 6}
              onClick={handleVerify}
            >
              {t('verify.submit')}
            </Button>

            <button
              onClick={handleResend}
              disabled={!canResend || resendLoading}
              className="flex items-center justify-center gap-2 w-full text-subhead text-slate-500 hover:text-accent-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors py-2"
            >
              <RefreshCw className={`h-4 w-4 ${resendLoading ? 'animate-spin' : ''}`} />
              {canResend
                ? t('resend')
                : t('resendIn', { seconds: String(countdown) })}
            </button>
          </div>

          <button
            onClick={() => { clearAuth(); router.push('/login'); }}
            className="mt-4 text-caption-1 text-slate-500 transition-colors hover:text-accent-700"
          >
            {t('verify.otherEmail')}
          </button>
      </div>
    </div>
  );
}
