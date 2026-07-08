import { preload } from 'react-dom';
import type { CategoryCount, PaginatedResponse, Startup } from '@/types';
import { fetchInitial } from '@/lib/server-api';
import { StartupsClient } from './startups-client';

/**
 * Server component: 1-sahifa ro'yxatini SSR'da olib keladi (Next data-keshi,
 * ~30 s) — LCP kartalar/rasmlar HTML bilan birga keladi. Backend yotsa —
 * `null` (client o'zi yuklaydi, hozirgi xulq).
 */
export const revalidate = 30;

export default async function StartupsPage() {
  // Ro'yxat + kategoriya chips'lari birga SSR bo'ladi — chips keyin kelib
  // kontentni pastga surmaydi (CLS 0)
  const [initialList, initialCategories] = await Promise.all([
    fetchInitial<PaginatedResponse<Startup>>('/startups?page=1&limit=12&sort=featured'),
    fetchInitial<CategoryCount[]>('/startups/categories', 300),
  ]);

  // LCP — birinchi karta cover'i: head'dan preload + origin'iga preconnect
  const firstCover = initialList?.data?.find((s) => s.coverUrl)?.coverUrl ?? null;
  if (firstCover) preload(firstCover, { as: 'image', fetchPriority: 'high' });
  let coverOrigin: string | null = null;
  try {
    if (firstCover) coverOrigin = new URL(firstCover).origin;
  } catch {
    coverOrigin = null;
  }

  return (
    <>
      {coverOrigin && <link rel="preconnect" href={coverOrigin} />}
      <StartupsClient initialList={initialList} initialCategories={initialCategories} />
    </>
  );
}
