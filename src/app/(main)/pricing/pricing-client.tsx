'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { billingApi, getErrorMessage } from '@/lib/api';
import {
  BILLING_PROVIDER_LABEL,
  INTERVAL_LABEL,
  bestYearlySaving,
  yearlySavingPercent,
} from '@/lib/billing';
import { useAuthStore } from '@/store/auth.store';
import { PlanCard } from '@/components/billing/plan-card';
import { PageHeader } from '@/components/ui/page-header';
import { Segmented } from '@/components/ui/segmented';
import { CardSkeleton } from '@/components/ui/skeleton';
import { LockOpen, ShieldCheck, Wallet } from '@/components/icons';
import type { BillingInterval, BillingPlan } from '@/types';

/**
 * Tariflar sahifasi. Naqsh — Claude/Apple obuna varaqasi:
 * yuqorida **Oylik / Yillik** segmenti, ostida faqat SHU muddatga tegishli
 * tariflar. Ikkala muddat bir vaqtda ko'rsatilmaydi (6 ta karta tanlovni
 * qiyinlashtiradi) — segment almashtiriladi, kartalar joyida yangilanadi.
 */
export function PricingClient({ initialPlans }: { initialPlans: BillingPlan[] | null }) {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: () => billingApi.plans(),
    initialData: initialPlans ?? undefined,
    // SSR ma'lumot "eski" deb belgilanadi → shaxsiy bo'lmagan ro'yxat fonda
    // bir marta yangilanadi, lekin ekran darhol to'la ko'rinadi.
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60_000,
  });

  /** Joriy obuna — "Joriy tarifingiz" belgisini qo'yish uchun (faqat kirganda). */
  const { data: me } = useQuery({
    queryKey: ['billing', 'me'],
    queryFn: () => billingApi.me(),
    enabled: hasHydrated && !!token,
    staleTime: 60_000,
  });

  const all = useMemo(() => plans ?? [], [plans]);
  const visible = useMemo(
    () =>
      all
        .filter((p) => p.interval === interval)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [all, interval],
  );
  const bestSaving = useMemo(() => bestYearlySaving(all), [all]);

  async function handleSelect(plan: BillingPlan) {
    // Mehmon → ro'yxatdan o'tib AYNAN shu sahifaga qaytadi (loyihadagi
    // guest→register→qaytish oqimi; `?next=` middleware bilan ishlaydi).
    if (!token) {
      router.push('/register?next=/pricing');
      return;
    }
    setBusyPlanId(plan.id);
    try {
      const res = await billingApi.checkout({
        planId: plan.id,
        // To'lovdan keyin qaytish manzili. Buyurtma ID'sini SERVER qo'shadi
        // (`?order=...`) — mijoz uni bilishi shart emas va o'zgartira olmaydi.
        returnUrl:
          typeof window !== 'undefined'
            ? `${window.location.origin}/billing/status`
            : undefined,
      });
      // Payme checkout sahifasiga o'tamiz (tashqi manzil — router emas).
      window.location.assign(res.checkoutUrl);
    } catch (err) {
      toast.error(getErrorMessage(err, 'To‘lovni boshlab bo‘lmadi'));
      setBusyPlanId(null);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tariflar"
        subtitle="Loyihangizni e’lon qilish uchun mos tarifni tanlang. Istalgan vaqtda o‘zgartirishingiz mumkin."
      />

      {/* Muddat almashtirgichi */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-full max-w-xs">
          <Segmented<BillingInterval>
            aria-label="To‘lov muddati"
            value={interval}
            onChange={setInterval}
            options={[
              { value: 'monthly', label: INTERVAL_LABEL.monthly },
              { value: 'yearly', label: INTERVAL_LABEL.yearly },
            ]}
          />
        </div>
        {bestSaving !== null && (
          <p className="text-footnote text-slate-500">
            Yillik tarifda{' '}
            <span className="font-semibold text-accent-700">{bestSaving}% gacha</span> tejaysiz
          </p>
        )}
      </div>

      {/* Tariflar */}
      {isLoading && visible.length === 0 ? (
        <div className="grid gap-5 md:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : visible.length === 0 ? (
        <p className="rounded-ios-2xl bg-white px-6 py-14 text-center text-subhead text-slate-500">
          Tariflar hozircha mavjud emas.
        </p>
      ) : (
        <div className="grid items-stretch gap-5 md:grid-cols-3">
          {visible.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              savingPercent={
                plan.interval === 'yearly' ? yearlySavingPercent(all, plan.tier) : null
              }
              current={me?.subscription?.planId === plan.id}
              loading={busyPlanId === plan.id}
              disabled={busyPlanId !== null && busyPlanId !== plan.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Ishonch qatori — to'lov oldidan odam bilishi kerak bo'lgan uchta narsa */}
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: <Wallet />,
            title: `${BILLING_PROVIDER_LABEL} orqali to‘lov`,
            text: 'Karta ma’lumotlari saytimizda saqlanmaydi.',
          },
          {
            icon: <ShieldCheck />,
            title: 'Avtomatik yechim yo‘q',
            text: 'To‘lov bir martalik — muddat tugagach o‘zingiz uzaytirasiz.',
          },
          {
            icon: <LockOpen />,
            title: 'Loyihalaringiz sizniki',
            text: 'Muddat tugasa ham e’lon qilingan loyihalar saqlanadi.',
          },
        ].map((item) => (
          <div key={item.title} className="rounded-ios-xl bg-white p-4">
            <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-[9px] bg-fill-tertiary text-slate-500 [&>svg]:h-[18px] [&>svg]:w-[18px]">
              {item.icon}
            </span>
            <p className="text-subhead font-semibold text-brand-900">{item.title}</p>
            <p className="mt-0.5 text-footnote text-slate-500">{item.text}</p>
          </div>
        ))}
      </section>

      {token && (
        <p className="text-center text-footnote text-slate-500">
          To‘lovlar tarixi va joriy obuna —{' '}
          <Link href="/billing" className="font-semibold text-accent-700">
            Obunam
          </Link>{' '}
          bo‘limida.
        </p>
      )}
    </div>
  );
}
