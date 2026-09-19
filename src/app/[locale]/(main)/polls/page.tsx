import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Poll } from '@/types';
import type { AppLocale } from '@/i18n/routing';
import { fetchInitial } from '@/lib/server-api';
import { pageMetadata } from '@/lib/seo';
import { PollsClient } from './polls-client';
import { Scope } from '@/i18n/scope';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.polls' });
  return pageMetadata({
    locale,
    path: '/polls',
    title: t('title'),
    description: t('description'),
  });
}

/** SSR: tanlovlar ro'yxati HTML bilan keladi (LCP/CLS); backend yotsa client yuklaydi. */
export const revalidate = 30;

export default async function PollsPage({
  params: { locale },
}: {
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  const initialPolls = await fetchInitial<Poll[]>('/polls');
  return (
    <Scope name="polls">
      <PollsClient initialPolls={initialPolls} />
    </Scope>
  );
}
