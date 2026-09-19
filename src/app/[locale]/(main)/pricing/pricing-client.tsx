'use client';

import { Link, getPathname, useRouter } from '@/i18n/navigation';
import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { billingApi, getErrorMessage } from '@/lib/api';
import {
  PROVIDER_ORDER,
  bestYearlySaving,
  providerNames,
  yearlySavingPercent,
} from '@/lib/billing';
import { ClickMark, PaymeMark } from '@/components/brand/payment-marks';
import { useAuthStore } from '@/store/auth.store';
import { PlanCard } from '@/components/billing/plan-card';
import { PaymentSheet } from '@/components/billing/payment-sheet';
import { PageHeader } from '@/components/ui/page-header';
import { Segmented } from '@/components/ui/segmented';
import { CardSkeleton } from '@/components/ui/skeleton';
import { LockOpen, ShieldCheck, Wallet } from '@/components/icons';
import type { AppLocale } from '@/i18n/routing';
import type { BillingInterval, BillingPlan, PaymentProvider } from '@/types';

/**
 * Tariflar sahifasi. Naqsh — Claude/Apple obuna varaqasi:
 * yuqorida **Oylik / Yillik** segmenti, ostida faqat SHU muddatga tegishli
 * tariflar. Ikkala muddat bir vaqtda ko'rsatilmaydi (6 ta karta tanlovni
 * qiyinlashtiradi) — segment almashtiriladi, kartalar joyida yangilanadi.
 */
export function PricingClient({ initialPlans }: { initialPlans: BillingPlan[] | null }) {
  const t = useTranslations('pricing');
  const tb = useTranslations('billing');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  /** To'lov varaqasida turgan tarif (null — varaqa yopiq) */
  const [checkoutPlan, setCheckoutPlan] = useState<BillingPlan | null>(null);
  const [paying, setPaying] = useState(false);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: () => billingApi.plans(),
    initialData: initialPlans ?? undefined,
    // SSR ma'lumot "eski" deb belgilanadi → shaxsiy bo'lmagan ro'yxat fonda
    // bir marta yangilanadi, lekin ekran darhol to'la ko'rinadi.
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60_000,
  });

  /** Sozlangan to'lov usullari (Payme / Click) — serverdan. */
  const { data: status } = useQuery({
    queryKey: ['billing', 'status'],
    queryFn: () => billingApi.status(),
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
  /** Sozlangan usullar — ekrandagi tartibda (server ro'yxatiga tayanadi). */
  const activeProviders = useMemo(
    () => PROVIDER_ORDER.filter((p) => (status?.providers ?? []).includes(p)),
    [status?.providers],
  );
  const providerLabels = providerNames(status?.providers ?? []);

  /** "Tanlash" — to'lov usuli varaqasini ochadi (hali hech narsa yaratilmaydi). */
  function handleSelect(plan: BillingPlan) {
    // Mehmon → ro'yxatdan o'tib AYNAN shu sahifaga qaytadi (loyihadagi
    // guest→register→qaytish oqimi; `?next=` middleware bilan ishlaydi).
    if (!token) {
      router.push('/register?next=/pricing');
      return;
    }
    setCheckoutPlan(plan);
  }

  /** Usul tanlangach — buyurtma yaratiladi va provayder sahifasiga o'tiladi. */
  async function handleConfirm(provider: PaymentProvider) {
    if (!checkoutPlan) return;
    setPaying(true);
    try {
      const res = await billingApi.checkout({
        planId: checkoutPlan.id,
        provider,
        // To'lovdan keyin qaytish manzili — joriy til prefiksi bilan
        // (ruscha foydalanuvchi `/ru/billing/status` ga qaytadi). Buyurtma
        // ID'sini SERVER qo'shadi (`?order=...`) — mijoz uni bilishi shart
        // emas va o'zgartira olmaydi.
        returnUrl:
          typeof window !== 'undefined'
            ? `${window.location.origin}${getPathname({ href: '/billing/status', locale })}`
            : undefined,
      });
      // Tashqi to'lov sahifasi — Next router emas, to'liq navigatsiya.
      window.location.assign(res.checkoutUrl);
    } catch (err) {
      toast.error(getErrorMessage(err, t('checkoutFailed')));
      setPaying(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      {/* Muddat almashtirgichi */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-full max-w-xs">
          <Segmented<BillingInterval>
            aria-label={t('intervalAria')}
            value={interval}
            onChange={setInterval}
            options={[
              { value: 'monthly', label: tb('interval.monthly') },
              { value: 'yearly', label: tb('interval.yearly') },
            ]}
          />
        </div>
        {bestSaving !== null && (
          <p className="text-footnote text-slate-500">
            {t.rich('yearlySaving', {
              percent: String(bestSaving),
              b: (chunks) => <span className="font-semibold text-accent-700">{chunks}</span>,
            })}
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
          {t('empty')}
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
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Ishonch qatori — to'lov oldidan odam bilishi kerak bo'lgan uchta narsa */}
      <section className="grid gap-3 sm:grid-cols-3">
        {/*
          1-karta: umumiy "hamyon" belgisi o'rniga QABUL QILINADIGAN
          USULLARNING o'zi ko'rsatiladi. Ro'yxat serverdan keladi
          (`/billing/status`), shuning uchun provayder qo'shilsa/o'chirilsa
          bu joy o'z-o'zidan to'g'ri qoladi — matnda hech qanday brend nomi
          qattiq yozilmaydi.
        */}
        <div className="rounded-ios-xl bg-white p-4">
          <span className="mb-2.5 flex items-center gap-1.5">
            {activeProviders.length > 0 ? (
              activeProviders.map((p) => (
                <span
                  key={p}
                  className="flex h-8 w-[52px] items-center justify-center rounded-[9px] bg-fill-tertiary text-brand-900"
                >
                  {p === 'payme' ? (
                    <PaymeMark className="h-[18px] w-auto" />
                  ) : (
                    <ClickMark className="w-[40px] h-auto" />
                  )}
                </span>
              ))
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-accent-50 text-accent-600 [&>svg]:h-[18px] [&>svg]:w-[18px]">
                <Wallet />
              </span>
            )}
          </span>
          <p className="text-subhead font-semibold text-brand-900">
            {t('trust.payVia', {
              count: providerLabels.length,
              a: providerLabels[0] ?? '',
              b: providerLabels[1] ?? '',
            })}
          </p>
          <p className="mt-0.5 text-footnote text-slate-500">
            {t('trust.cardData')}
          </p>
        </div>

        {[
          {
            id: 'noAuto',
            icon: <ShieldCheck />,
            title: t('trust.noAutoTitle'),
            text: t('trust.noAutoText'),
          },
          {
            id: 'own',
            icon: <LockOpen />,
            title: t('trust.ownTitle'),
            text: t('trust.ownText'),
          },
        ].map((item) => (
          <div key={item.id} className="rounded-ios-xl bg-white p-4">
            <span className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-[9px] bg-accent-50 text-accent-600 [&>svg]:h-[18px] [&>svg]:w-[18px]">
              {item.icon}
            </span>
            <p className="text-subhead font-semibold text-brand-900">{item.title}</p>
            <p className="mt-0.5 text-footnote text-slate-500">{item.text}</p>
          </div>
        ))}
      </section>

      <PaymentSheet
        open={checkoutPlan !== null}
        plan={checkoutPlan}
        providers={status?.providers ?? []}
        loading={paying}
        onClose={() => !paying && setCheckoutPlan(null)}
        onConfirm={handleConfirm}
      />

      {token && (
        <p className="text-center text-footnote text-slate-500">
          {t.rich('historyNote', {
            link: (chunks) => (
              <Link href="/billing" className="font-semibold text-accent-700 hv-link transition-colors hover:text-accent-800">
                {chunks}
              </Link>
            ),
          })}
        </p>
      )}
    </div>
  );
}
