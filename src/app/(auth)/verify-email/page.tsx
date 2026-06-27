'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, RefreshCw, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { AuthMobileLogo } from '@/components/auth/auth-shell';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { pendingEmail, hasHydrated, clearAuth } = useAuthStore();
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
      await authApi.verifyOtp(pendingEmail, otp);
      setSuccess(true);
      toast.success('Email tasdiqlandi!');
      setTimeout(() => router.push('/login'), 1500);
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
        <h1 className="text-2xl font-bold text-brand-900 mb-2">Tasdiqlandi!</h1>
        <p className="text-slate-500">Kirish sahifasiga yo&apos;naltirilmoqda...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <AuthMobileLogo />
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-7 text-center shadow-card backdrop-blur-sm sm:p-8">
          <div className="h-20 w-20 rounded-2xl bg-accent-50 border border-accent-200 flex items-center justify-center mx-auto mb-6">
            <Mail className="h-10 w-10 text-accent-600" />
          </div>

          <h1 className="text-2xl font-bold text-brand-900 mb-2">Emailni tasdiqlang</h1>
          <p className="text-slate-500 text-sm mb-1">
            6 xonali kod quyidagi emailga yuborildi:
          </p>
          <p className="text-accent-700 font-semibold text-sm mb-8 truncate">
            {pendingEmail}
          </p>

          <div className="flex justify-center mb-3">
            <OtpInput value={otp} onChange={setOtp} length={6} error={otpError} />
          </div>
          {otpError && (
            <p className="text-sm text-rose-600 mb-4">Kod noto&apos;g&apos;ri yoki muddati o&apos;tgan</p>
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
              className="flex items-center justify-center gap-2 w-full text-sm text-slate-500 hover:text-brand-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors py-2"
            >
              <RefreshCw className={`h-4 w-4 ${resendLoading ? 'animate-spin' : ''}`} />
              {canResend
                ? 'Kodni qayta yuborish'
                : `Qayta yuborish (${countdown}s)`}
            </button>
          </div>

          <button
            onClick={() => { clearAuth(); router.push('/login'); }}
            className="mt-4 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Boshqa email bilan kirish
          </button>
      </div>
    </div>
  );
}
