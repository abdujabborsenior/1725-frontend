import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { SolutionsClient } from './solutions-client';
import { Scope } from '@/i18n/scope';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.solutions' });
  // Shaxsiy sahifa ("Yechimlarim") — indekslanmaydi
  return pageMetadata({
    locale,
    path: '/solutions',
    title: t('title'),
    description: t('description'),
    noindex: true,
  });
}

export default function SolutionsPage({
  params: { locale },
}: {
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  return (
    <Scope name="solutionsPage">
      <SolutionsClient />
    </Scope>
  );
}
