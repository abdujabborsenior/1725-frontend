import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { InvestorRequestsClient } from './requests-client';
import { Scope } from '@/i18n/scope';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.investor' });
  return pageMetadata({
    locale,
    path: '/investor/requests',
    title: t('requests.title'),
    description: t('requests.description'),
    noindex: true,
  });
}

export default function InvestorRequestsPage({
  params: { locale },
}: {
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  return (
    <Scope name="investorRequests">
      <InvestorRequestsClient />
    </Scope>
  );
}
