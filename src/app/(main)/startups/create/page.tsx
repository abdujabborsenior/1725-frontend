'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from '@/components/icons';
import { useAuthStore } from '@/store/auth.store';
import { StartupForm } from '@/components/startups/startup-form';
import { PageHeader } from '@/components/ui/page-header';

export default function CreateStartupPage() {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();

  // Guest — register'ga (ro'yxatdan o'tgach aynan shu sahifaga qaytadi)
  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace(`/register?next=${encodeURIComponent('/startups/create')}`);
    }
  }, [hasHydrated, token, router]);

  // Guest'ni middleware server tomonda redirect qiladi — bu faqat backstop.
  // Hydration'ni KUTMAYMIZ: sahifa shell'i darhol chiziladi (LCP tez);
  // faqat aniq guest holatida (hydrated + token yo'q) yashiramiz.
  if (hasHydrated && !token) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* iOS "back" — chevron + yorliq, tint rangda */}
      <button
        onClick={() => router.back()}
        className="tappable -ml-1 flex items-center gap-0.5 text-body text-accent-700"
      >
        <ChevronLeft className="h-[19px] w-[19px]" strokeWidth={3} />
        Orqaga
      </button>

      <PageHeader
        title="Startap joylash"
        subtitle="Faqat nom va tavsif majburiy — qolganini keyin ham to'ldirishingiz mumkin."
      />

      <StartupForm />
    </div>
  );
}
