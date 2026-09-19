import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import type { AppLocale } from '@/i18n/routing';
import type { MarketCluster } from '@/types';
import { fetchInitial } from '@/lib/server-api';
import { pageMetadata } from '@/lib/seo';
import { MarketClient } from './market-client';
import { Scope } from '@/i18n/scope';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.market' });
  return pageMetadata({
    locale,
    path: '/market',
    title: t('list.title'),
    description: t('list.description'),
  });
}

/**
 * SSR: klasterlar HTML bilan keladi.
 *
 * `revalidate` uzoq (10 daqiqa): klasterlar sutkasiga bir marta qayta
 * quriladi, shuning uchun tez-tez so'rash bekorga yuk bo'lardi.
 */
export const revalidate = 600;

export default async function MarketPage({
  params: { locale },
}: {
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  const initial = await fetchInitial<MarketCluster[]>(
    '/market/clusters?limit=24',
    600,
  );
  return (
    <Scope name="market">
      <MarketClient initialClusters={initial} />
    </Scope>
  );
}
