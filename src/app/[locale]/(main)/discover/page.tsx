import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { PublicGroup, PublicUserCard } from '@/types';
import type { AppLocale } from '@/i18n/routing';
import { fetchInitial } from '@/lib/server-api';
import { pageMetadata } from '@/lib/seo';
import { DiscoverClient } from './discover-client';
import { Scope } from '@/i18n/scope';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.discover' });
  return pageMetadata({
    locale,
    path: '/discover',
    title: t('title'),
    description: t('description'),
  });
}

/** SSR: standart ro'yxatlar (odamlar + guruhlar) HTML bilan keladi — CLS 0. */
export const revalidate = 30;

export default async function DiscoverPage({
  params: { locale },
}: {
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  const [initialSuggestions, initialGroups] = await Promise.all([
    fetchInitial<PublicUserCard[]>('/users/suggestions?limit=12'),
    fetchInitial<PublicGroup[]>('/chat/groups/public?limit=20'),
  ]);
  return (
    <Scope name="discover">
      <DiscoverClient
        initialSuggestions={initialSuggestions}
        initialGroups={initialGroups}
      />
    </Scope>
  );
}
