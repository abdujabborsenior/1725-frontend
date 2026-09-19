import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import type { AppLocale } from '@/i18n/routing';
import { BILLING_ENABLED } from '@/lib/billing';
import { pageMetadata } from '@/lib/seo';
import { BillingClient } from './billing-client';
import { Scope } from '@/i18n/scope';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.billing' });
  return pageMetadata({
    locale,
    path: '/billing',
    title: t('billing.title'),
    description: t('billing.description'),
    noindex: true,
  });
}

/** Shaxsiy bo'lim — obuna holati va to'lovlar tarixi (flag bilan yoqiladi). */
export default function BillingPage({
  params: { locale },
}: {
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  if (!BILLING_ENABLED) notFound();
  return (
    <Scope name="billing">
      <BillingClient />
    </Scope>
  );
}
