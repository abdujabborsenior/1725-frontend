'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Zap, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import toast from 'react-hot-toast';

const pwdRules = [
  { test: (v: string) => v.length >= 8, label: '8+ belgi' },
  { test: (v: string) => /[A-Z]/.test(v), label: 'Katta harf' },
  { test: (v: string) => /[0-9]/.test(v), label: 'Raqam' },
  { test: (v: string) => /[!@#$%^&*]/.test(v), label: 'Maxsus belgi' },
];

export default function ResetPasswordPage() {
  const router = useRouter();
  const { pendingEmail, hasHydrated } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
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

  const passwordValid = pwdRules.every((r) => r.test(password));
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-brand-900 flex items-center justify-center">
              <Zap className="h-6 w-6 text-accent-400" fill="currentColor" />
            </div>
            <span className="text-2xl font-black text-brand-900">StartupHub</span>
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-card">
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-brand-900 mb-2">Yangi parol o&apos;rnatish</h1>
            <p className="text-slate-500 text-sm">
              Emailga yuborilgan kodni va yangi parolingizni kiriting
            </p>
            <p className="text-accent-700 font-semibold text-sm mt-1 truncate">
              {pendingEmail}
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider self-start">
                Tasdiqlash kodi
              </label>
              <OtpInput value={otp} onChange={setOtp} length={6} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Yangi parol
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-12 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label={showPwd ? 'Yashirish' : "Ko'rsatish"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {pwdRules.map((r) => (
                    <span
                      key={r.label}
                      className={`text-[10px] px-2 py-0.5 rounded-md border ${
                        r.test(password)
                          ? 'text-accent-700 border-accent-200 bg-accent-50'
                          : 'text-slate-500 border-slate-200 bg-slate-50'
                      }`}
                    >
                      {r.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Parolni tasdiqlang
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus transition-all duration-150"
                />
              </div>
              {confirm.length > 0 && !matches && (
                <p className="text-xs text-rose-600">Parollar mos kelmadi</p>
              )}
            </div>

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
              className="flex items-center justify-center gap-2 w-full text-sm text-slate-500 hover:text-brand-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors py-1"
            >
              <RefreshCw className="h-4 w-4" />
              {canResend ? 'Kodni qayta yuborish' : `Qayta yuborish (${resendCountdown}s)`}
            </button>
          </div>

          <Link
            href="/login"
            className="mt-5 flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-brand-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Kirishga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
