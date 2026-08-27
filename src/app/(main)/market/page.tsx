import type { Metadata } from 'next';
import type { MarketCluster } from '@/types';
import { fetchInitial } from '@/lib/server-api';
import { MarketClient } from './market-client';

export const metadata: Metadata = {
  title: 'Bozor yo‘nalishlari',
  description:
    'Odamlar nimani so‘rayapti va qaysi yo‘nalishda hali yechim yo‘q — real so‘rovlar asosidagi bozor xaritasi.',
};

/**
 * SSR: klasterlar HTML bilan keladi.
 *
 * `revalidate` uzoq (10 daqiqa): klasterlar sutkasiga bir marta qayta
 * quriladi, shuning uchun tez-tez so'rash bekorga yuk bo'lardi.
 */
export const revalidate = 600;

export default async function MarketPage() {
  const initial = await fetchInitial<MarketCluster[]>(
    '/market/clusters?limit=24',
    600,
  );
  return <MarketClient initialClusters={initial} />;
}
