'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, RefreshCw, ArrowLeft } from '@/components/icons';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { PasswordField, isPasswordValid } from '@/components/ui/password-field';
import { AuthCard } from '@/components/auth/auth-shell';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
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
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
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
      toast.success('Parol yangilandi! Endi kiring.');
      router.push('/login');
    } catch (err) {
      toast.error(getErrorMessage(err, "Kod noto'g'ri yoki muddati o'tgan"));
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
      toast.success('Yangi kod yuborildi');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (!pendingEmail) return null;

  return (
    <AuthCard
      eyebrow="Xavfsizlik"
      title="Yangi parol o'rnatish"
      subtitle="Emailga yuborilgan kodni va yangi parolingizni kiriting"
    >
          <p className="-mt-4 mb-5 truncate text-subhead font-semibold text-accent-700">
            {pendingEmail}
          </p>
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3">
              <label className="text-footnote font-medium text-slate-500 self-start">
                Tasdiqlash kodi
              </label>
              <OtpInput value={otp} onChange={setOtp} length={6} />
            </div>

            <PasswordField
              label="Yangi parol"
              placeholder="Yangi parol yarating"
              autoComplete="new-password"
              rules
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <PasswordField
              label="Parolni tasdiqlang"
              placeholder="Parolni takrorlang"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={confirm.length > 0 && !matches ? 'Parollar mos kelmadi' : undefined}
            />

            <Button
              size="lg"
              fullWidth
              loading={loading}
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              <ShieldCheck className="h-4 w-4" /> Parolni yangilash
            </Button>

            <button
              onClick={handleResend}
              disabled={!canResend}
              className="flex items-center justify-center gap-2 w-full text-subhead text-slate-500 hover:text-brand-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors py-1"
            >
              <RefreshCw className="h-4 w-4" />
              {canResend ? 'Kodni qayta yuborish' : `Qayta yuborish (${resendCountdown}s)`}
            </button>
          </div>

          <Link
            href="/login"
            className="mt-5 flex items-center justify-center gap-1.5 text-subhead text-slate-500 hover:text-brand-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Kirishga qaytish
          </Link>
    </AuthCard>
  );
}
