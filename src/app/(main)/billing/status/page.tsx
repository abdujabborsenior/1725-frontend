import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { BILLING_ENABLED } from '@/lib/billing';
import { CardSkeleton } from '@/components/ui/skeleton';
import { PaymentStatusClient } from './status-client';

export const metadata: Metadata = {
  title: 'To‘lov holati',
  robots: { index: false, follow: false },
};

/**
 * To'lovdan keyin Payme foydalanuvchini SHU sahifaga qaytaradi
 * (`/billing/status?order=<id>`). Bu yerda hech narsa "tasdiqlanmaydi" —
 * haqiqiy tasdiq Payme serveridan bizning merchant endpointimizga keladi
 * (`PerformTransaction`). Sahifa faqat buyurtma holatini KUZATADI.
 *
 * Nega shunday: brauzerga qaytish — ishonchsiz signal (foydalanuvchi
 * sahifani yopishi, tarmoq uzilishi mumkin). To'lovni faqat provayderning
 * server-server chaqiruvi tasdiqlaydi.
 */
export default function BillingStatusPage() {
  if (!BILLING_ENABLED) notFound();
  return (
    <Suspense fallback={<CardSkeleton />}>
      <PaymentStatusClient />
    </Suspense>
  );
}
