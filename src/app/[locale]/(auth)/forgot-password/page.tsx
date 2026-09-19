import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { ForgotPasswordClient } from './forgot-password-client';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.auth.forgotPassword' });
  return pageMetadata({
    locale,
    path: '/forgot-password',
    title: t('title'),
    description: t('description'),
    noindex: true,
  });
}

export default function ForgotPasswordPage({ params: { locale } }: { params: { locale: AppLocale } }) {
  setRequestLocale(locale);
  return <ForgotPasswordClient />;
}
