import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { DealflowClient } from './dealflow-client';
import { Scope } from '@/i18n/scope';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.investor' });
  return pageMetadata({
    locale,
    path: '/investor/dealflow',
    title: t('dealflow.title'),
    description: t('dealflow.description'),
    noindex: true,
  });
}

export default function DealflowPage({
  params: { locale },
}: {
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  // `useSearchParams` Suspense chegarasini talab qiladi (Next.js App Router).
  return (
    <Scope name="dealflow">
      <Suspense fallback={null}>
        <DealflowClient />
      </Suspense>
    </Scope>
  );
}
