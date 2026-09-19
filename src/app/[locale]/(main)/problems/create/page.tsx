import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { CreateProblemClient } from './create-problem-client';
import { Scope } from '@/i18n/scope';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.problems.create' });
  // Forma sahifasi — indekslanmaydi (kirgan foydalanuvchi uchun)
  return pageMetadata({
    locale,
    path: '/problems/create',
    title: t('title'),
    description: t('description'),
    noindex: true,
  });
}

export default function CreateProblemPage({
  params: { locale },
}: {
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  return (
    <Scope name="problemCreate">
      <CreateProblemClient />
    </Scope>
  );
}
