import type { Metadata } from 'next';
import type { PaginatedResponse, Problem } from '@/types';
import { fetchInitial } from '@/lib/server-api';
import { ProblemsClient } from './problems-client';

export const metadata: Metadata = {
  title: 'Muammolar',
  description:
    'Hamjamiyat yechim kutayotgan real muammolar — o‘qing, "Foydali" deb belgilang va yechim taklif qiling.',
};

/**
 * Server component: 1-sahifa ro'yxatini SSR'da olib keladi (Next data-keshi,
 * ~30 s) — LCP matn kartalari HTML bilan birga keladi. Backend yotsa —
 * `null` (client o'zi yuklaydi, hozirgi xulq).
 */
export const revalidate = 30;

export default async function ProblemsPage() {
  const initialList = await fetchInitial<PaginatedResponse<Problem>>(
    '/problems?page=1&limit=9',
  );
  return <ProblemsClient initialList={initialList} />;
}
