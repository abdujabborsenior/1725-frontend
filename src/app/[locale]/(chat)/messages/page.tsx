import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { MessagesClient } from './messages-client';

/** Shaxsiy yozishmalar — indekslanmaydi (noindex). */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.chat' });
  return pageMetadata({
    locale,
    path: '/messages',
    title: t('title'),
    description: t('description'),
    noindex: true,
  });
}

export default function MessagesPage({ params: { locale } }: { params: { locale: AppLocale } }) {
  setRequestLocale(locale);
  return <MessagesClient />;
}
