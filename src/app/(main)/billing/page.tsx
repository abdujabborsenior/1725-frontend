import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BILLING_ENABLED } from '@/lib/billing';
import { BillingClient } from './billing-client';

export const metadata: Metadata = {
  title: 'Obunam',
  robots: { index: false, follow: false },
};

/** Shaxsiy bo'lim — obuna holati va to'lovlar tarixi (flag bilan yoqiladi). */
export default function BillingPage() {
  if (!BILLING_ENABLED) notFound();
  return <BillingClient />;
}
