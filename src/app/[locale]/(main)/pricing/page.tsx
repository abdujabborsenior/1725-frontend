import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import type { AppLocale } from '@/i18n/routing';
import { BILLING_ENABLED } from '@/lib/billing';
import { fetchInitial } from '@/lib/server-api';
import { pageMetadata } from '@/lib/seo';
import type { BillingPlan } from '@/types';
import { PricingClient } from './pricing-client';
import { Scope } from '@/i18n/scope';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.billing' });
  return pageMetadata({
    locale,
    path: '/pricing',
    title: t('pricing.title'),
    description: t('pricing.description'),
    // Bo'lim o'chiq bo'lsa sahifa 404 — u indekslanmasin
    noindex: !BILLING_ENABLED,
  });
}

/** Tariflar kamdan-kam o'zgaradi — SSR keshida 5 daqiqa. */
export const revalidate = 300;

/**
 * **VAQTINCHA O'CHIQ** (`NEXT_PUBLIC_BILLING_ENABLED`).
 *
 * Flag yoqilmagan bo'lsa sahifa `notFound()` beradi — ya'ni marshrut amalda
 * mavjud emas: foydalanuvchi ham, qidiruv tizimi ham topa olmaydi. Kod esa
 * repoda to'liq tayyor turadi (yoqish = bitta env o'zgaruvchi + deploy).
 */
export default async function PricingPage({
  params: { locale },
}: {
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  if (!BILLING_ENABLED) notFound();

  // Fail-open: backend javob bermasa `null` keladi va client o'zi yuklaydi.
  const initialPlans = await fetchInitial<BillingPlan[]>('/billing/plans', 300);
  return (
    <Scope name="pricing">
      <PricingClient initialPlans={initialPlans} />
    </Scope>
  );
}
