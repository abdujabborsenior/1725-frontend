import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import type { AppLocale } from '@/i18n/routing';
import type { MarketClusterDetail } from '@/types';
import { fetchInitial } from '@/lib/server-api';
import { pageMetadata } from '@/lib/seo';
import { ClusterClient } from './cluster-client';
import { Scope } from '@/i18n/scope';

export const revalidate = 600;

type Params = { locale: AppLocale; slug: string };

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: Params;
}): Promise<Metadata> {
  // `fetchInitial` tilni `getLocale()` dan oladi — metadata sahifadan oldin
  // hisoblanishi mumkin, shuning uchun til shu yerda ham o'rnatiladi
  // (aks holda so'rov sarlavhasi o'qilib, statik render buzilardi).
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'meta.market' });
  const path = `/market/${slug}`;
  const cluster = await fetchInitial<MarketClusterDetail>(
    `/market/clusters/${slug}`,
    600,
  );
  if (!cluster) {
    return pageMetadata({
      locale,
      path,
      title: t('cluster.notFoundTitle'),
      description: t('cluster.notFoundDescription'),
      noindex: true,
    });
  }
  return pageMetadata({
    locale,
    path,
    title: t('cluster.title', { name: cluster.label }),
    description: cluster.summary || t('cluster.description', { name: cluster.label }),
    type: 'article',
  });
}

export default async function ClusterPage({
  params: { locale, slug },
}: {
  params: Params;
}) {
  setRequestLocale(locale);
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
  return (
    <Scope name="market">
      <ClusterClient slug={slug} initial={initial} />
    </Scope>
  );
}
