import type { Metadata } from 'next';
import type { MarketClusterDetail } from '@/types';
import { fetchInitial } from '@/lib/server-api';
import { ClusterClient } from './cluster-client';

export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cluster = await fetchInitial<MarketClusterDetail>(
    `/market/clusters/${slug}`,
    600,
  );
  if (!cluster) return { title: 'Yo‘nalish' };
  return {
    title: cluster.label,
    description:
      cluster.summary ??
      `${cluster.label} yo‘nalishi bo‘yicha talab va mavjud yechimlar.`,
  };
}

export default async function ClusterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const initial = await fetchInitial<MarketClusterDetail>(
    `/market/clusters/${slug}`,
    600,
  );
  /*
   * `null` ikki holatda keladi: slug mavjud emas YOKI backend javob
   * bermadi. Ikkalasini SSR'da ajratib bo'lmaydi, shuning uchun bu yerda
   * `notFound()` chaqirilmaydi — client o'zi qayta so'raydi va faqat
   * haqiqatan topilmasa "topilmadi" holatini ko'rsatadi (fail-open).
   */
  return <ClusterClient slug={slug} initial={initial} />;
}
