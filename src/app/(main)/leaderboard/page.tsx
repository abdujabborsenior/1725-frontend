import type { Metadata } from 'next';
import type { CategoryCount, LeaderboardResponse } from '@/types';
import { fetchInitial } from '@/lib/server-api';
import { LeaderboardClient } from './leaderboard-client';

export const metadata: Metadata = {
  title: 'Reyting',
  description:
    'IMDB uslubidagi vaznli (Bayes) reyting bo‘yicha eng yaxshi startaplar va asoschilar reytingi.',
};

/** SSR: standart reyting (period=all, 1-sahifa) HTML bilan keladi — CLS/LCP tez. */
export const revalidate = 30;

export default async function LeaderboardPage() {
  const [initialBoard, initialCategories] = await Promise.all([
    fetchInitial<LeaderboardResponse>('/startups/leaderboard?period=all&page=1&limit=20'),
    fetchInitial<CategoryCount[]>('/startups/categories', 300),
  ]);
  return (
    <LeaderboardClient initialBoard={initialBoard} initialCategories={initialCategories} />
  );
}
