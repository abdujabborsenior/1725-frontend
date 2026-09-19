import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { CategoryCount, LeaderboardResponse } from '@/types';
import type { AppLocale } from '@/i18n/routing';
import { fetchInitial } from '@/lib/server-api';
import { pageMetadata } from '@/lib/seo';
import { LeaderboardClient } from './leaderboard-client';
import { Scope } from '@/i18n/scope';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.leaderboard' });
  return pageMetadata({
    locale,
    path: '/leaderboard',
    title: t('title'),
    description: t('description'),
  });
}

/** SSR: standart reyting (period=all, 1-sahifa) HTML bilan keladi — CLS/LCP tez. */
export const revalidate = 30;

export default async function LeaderboardPage({
  params: { locale },
}: {
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  const [initialBoard, initialCategories] = await Promise.all([
    fetchInitial<LeaderboardResponse>('/startups/leaderboard?period=all&page=1&limit=20'),
    fetchInitial<CategoryCount[]>('/startups/categories', 300),
  ]);
  return (
    <Scope name="leaderboard">
      <LeaderboardClient initialBoard={initialBoard} initialCategories={initialCategories} />
    </Scope>
  );
}
