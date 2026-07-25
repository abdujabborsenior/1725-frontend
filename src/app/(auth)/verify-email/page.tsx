'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, RefreshCw, CheckCircle2 } from '@/components/icons';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { AuthMobileLogo } from '@/components/auth/auth-shell';
import { consumeNext } from '@/components/auth/next-capture';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
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
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
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
        toast.success(`Xush kelibsiz, ${res.user.fullName}!`);
        setTimeout(() => router.push(next ?? '/problems'), 1200);
      } else {
        toast.success('Email tasdiqlandi!');
        setTimeout(() => router.push('/login'), 1500);
      }
    } catch {
      setOtpError(true);
      toast.error("Kod noto'g'ri yoki muddati o'tgan");
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
      toast.success('Yangi kod yuborildi');
    } catch {
      toast.error('Xatolik yuz berdi');
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
        <h1 className="mb-2 text-title-1 font-bold tracking-tight text-brand-900">Tasdiqlandi!</h1>
        <p className="text-slate-500">Yo&apos;naltirilmoqda...</p>
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

          <h1 className="mb-2 text-title-1 font-bold tracking-tight text-brand-900">Emailni tasdiqlang</h1>
          <p className="text-slate-500 text-subhead mb-1">
            6 xonali kod quyidagi emailga yuborildi:
          </p>
          <p className="text-accent-700 font-semibold text-subhead mb-8 truncate">
            {pendingEmail}
          </p>

          <div className="flex justify-center mb-3">
            <OtpInput value={otp} onChange={setOtp} length={6} error={otpError} />
          </div>
          {otpError && (
            <p className="text-subhead text-rose-600 mb-4">Kod noto&apos;g&apos;ri yoki muddati o&apos;tgan</p>
          )}

          <div className="space-y-3 mt-6">
            <Button
              size="lg"
              fullWidth
              loading={loading}
              disabled={otp.length !== 6}
              onClick={handleVerify}
            >
              Tasdiqlash
            </Button>

            <button
              onClick={handleResend}
              disabled={!canResend || resendLoading}
              className="flex items-center justify-center gap-2 w-full text-subhead text-slate-500 hover:text-brand-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors py-2"
            >
              <RefreshCw className={`h-4 w-4 ${resendLoading ? 'animate-spin' : ''}`} />
              {canResend
                ? 'Kodni qayta yuborish'
                : `Qayta yuborish (${countdown}s)`}
            </button>
          </div>

          <button
            onClick={() => { clearAuth(); router.push('/login'); }}
            className="mt-4 text-caption-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            Boshqa email bilan kirish
          </button>
      </div>
    </div>
  );
}
