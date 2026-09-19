import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AiWorkspace } from '@/components/ai/ai-workspace';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

/**
 * Indekslanadi: sahifa ommaviy (mehmon ham ochadi, savoli ro'yxatdan
 * o'tgach yuboriladi) va "muammoga yechim topuvchi AI" so'rovlari uchun
 * platformaning asosiy kirish nuqtasi.
 */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.ai' });
  return pageMetadata({
    locale,
    path: '/ai',
    title: t('title'),
    description: t('description'),
  });
}

/**
 * Yechim AI sahifasi — butun ekran Studio'ga beriladi.
 * `useSearchParams` ishlatilgani uchun Suspense chegarasi majburiy (Next 14).
 */
export default function AiPage({
  params: { locale },
}: {
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  return (
    <Suspense fallback={null}>
      <AiWorkspace />
    </Suspense>
  );
}
