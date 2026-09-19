import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { RegisterClient } from './register-client';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.auth.register' });
  return pageMetadata({
    locale,
    path: '/register',
    title: t('title'),
    description: t('description'),
    noindex: true,
  });
}

export default function RegisterPage({ params: { locale } }: { params: { locale: AppLocale } }) {
  setRequestLocale(locale);
  return <RegisterClient />;
}
