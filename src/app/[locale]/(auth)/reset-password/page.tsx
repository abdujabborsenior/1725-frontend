import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { ResetPasswordClient } from './reset-password-client';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.auth.resetPassword' });
  return pageMetadata({
    locale,
    path: '/reset-password',
    title: t('title'),
    description: t('description'),
    noindex: true,
  });
}

export default function ResetPasswordPage({ params: { locale } }: { params: { locale: AppLocale } }) {
  setRequestLocale(locale);
  return <ResetPasswordClient />;
}
