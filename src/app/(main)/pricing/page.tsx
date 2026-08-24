import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BILLING_ENABLED } from '@/lib/billing';
import { fetchInitial } from '@/lib/server-api';
import type { BillingPlan } from '@/types';
import { PricingClient } from './pricing-client';

export const metadata: Metadata = {
  title: 'Tariflar',
  description:
    'Loyihangizni MYMarkazda e’lon qiling — oylik yoki yillik tarif tanlang.',
};

/** Tariflar kamdan-kam o'zgaradi — SSR keshida 5 daqiqa. */
export const revalidate = 300;

/**
 * **VAQTINCHA O'CHIQ** (`NEXT_PUBLIC_BILLING_ENABLED`).
 *
 * Flag yoqilmagan bo'lsa sahifa `notFound()` beradi — ya'ni marshrut amalda
 * mavjud emas: foydalanuvchi ham, qidiruv tizimi ham topa olmaydi. Kod esa
 * repoda to'liq tayyor turadi (yoqish = bitta env o'zgaruvchi + deploy).
 */
export default async function PricingPage() {
  if (!BILLING_ENABLED) notFound();

  // Fail-open: backend javob bermasa `null` keladi va client o'zi yuklaydi.
  const initialPlans = await fetchInitial<BillingPlan[]>('/billing/plans', 300);
  return <PricingClient initialPlans={initialPlans} />;
}
