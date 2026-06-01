'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Zap, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email("Email noto'g'ri formatda"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await authApi.forgotPassword(data.email);
      setPendingEmail(data.email);
      setSent(true);
      toast.success("Agar email mavjud bo'lsa, kod yuborildi");
      setTimeout(() => router.push('/reset-password'), 1200);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

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
          <div className="h-16 w-16 rounded-2xl bg-accent-50 border border-accent-200 flex items-center justify-center mx-auto mb-5">
            <KeyRound className="h-8 w-8 text-accent-600" />
          </div>

          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-brand-900 mb-2">Parolni tiklash</h1>
            <p className="text-slate-500 text-sm">
              Emailingizni kiriting — tiklash uchun 6 xonali kod yuboramiz
            </p>
          </div>

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
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isSubmitting}
              disabled={sent}
            >
              {sent ? 'Yuborildi' : 'Kod yuborish'}
              {!sent && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          {sent && (
            <p className="mt-4 text-center text-xs text-slate-500">
              Kod <span className="text-accent-700 font-semibold">{getValues('email')}</span> ga yuborildi.
              Yo&apos;naltirilmoqda...
            </p>
          )}

          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-brand-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Kirishga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
