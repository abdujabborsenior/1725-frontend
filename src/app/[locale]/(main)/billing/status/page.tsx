import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import type { AppLocale } from '@/i18n/routing';
import { BILLING_ENABLED } from '@/lib/billing';
import { pageMetadata } from '@/lib/seo';
import { CardSkeleton } from '@/components/ui/skeleton';
import { PaymentStatusClient } from './status-client';
import { Scope } from '@/i18n/scope';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.billing' });
  return pageMetadata({
    locale,
    path: '/billing/status',
    title: t('status.title'),
    description: t('status.description'),
    noindex: true,
  });
}

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
export default function BillingStatusPage({
  params: { locale },
}: {
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  if (!BILLING_ENABLED) notFound();
  return (
    <Scope name="billing">
      <Suspense fallback={<CardSkeleton />}>
        <PaymentStatusClient />
      </Suspense>
    </Scope>
  );
}
