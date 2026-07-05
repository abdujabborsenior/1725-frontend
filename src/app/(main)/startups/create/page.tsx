'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Rocket } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { StartupForm } from '@/components/startups/startup-form';

export default function CreateStartupPage() {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();

  // Guest — register'ga (ro'yxatdan o'tgach aynan shu sahifaga qaytadi)
  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace(`/register?next=${encodeURIComponent('/startups/create')}`);
    }
  }, [hasHydrated, token, router]);

  if (!hasHydrated || !token) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-900 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Orqaga
      </button>

      <div>
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-emerald-iris text-white shadow-glow-iris">
            <Rocket className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          Yangi startap
        </span>
        <h1 className="mt-3 text-[1.75rem] font-bold tracking-tight text-brand-900">
          Startap joylash
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Faqat nom va tavsif majburiy — qolganini keyin ham to&apos;ldirishingiz mumkin
        </p>
      </div>

      <StartupForm />
    </div>
  );
}
