import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { NotificationByIdClient } from './notification-client';

/** Bildirishnoma chuqur havolasi — faqat yo'naltiradi, indekslanmaydi. */
export async function generateMetadata({
  params: { locale, id },
}: {
  params: { locale: AppLocale; id: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.notifications' });
  return pageMetadata({
    locale,
    path: `/notifications/${id}`,
    title: t('title'),
    description: t('description'),
    noindex: true,
  });
}

export default function NotificationByIdPage({
  params: { locale },
}: {
  params: { locale: AppLocale; id: string };
}) {
  setRequestLocale(locale);
  return <NotificationByIdClient />;
}
