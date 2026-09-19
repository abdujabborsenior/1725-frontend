import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { LoginClient } from './login-client';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.auth.login' });
  return pageMetadata({
    locale,
    path: '/login',
    title: t('title'),
    description: t('description'),
    noindex: true,
  });
}

export default function LoginPage({ params: { locale } }: { params: { locale: AppLocale } }) {
  setRequestLocale(locale);
  return <LoginClient />;
}
