import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { VerifyEmailClient } from './verify-email-client';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.auth.verifyEmail' });
  return pageMetadata({
    locale,
    path: '/verify-email',
    title: t('title'),
    description: t('description'),
    noindex: true,
  });
}

export default function VerifyEmailPage({ params: { locale } }: { params: { locale: AppLocale } }) {
  setRequestLocale(locale);
  return <VerifyEmailClient />;
}
