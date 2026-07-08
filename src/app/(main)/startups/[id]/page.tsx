import { preload } from 'react-dom';
import type { Startup } from '@/types';
import { fetchInitial } from '@/lib/server-api';
import { StartupDetailClient } from './startup-detail-client';

/** SSR: startap kartasi (cover LCP) HTML bilan keladi — client flaglarni yangilaydi. */
export const revalidate = 30;

export default async function StartupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const initialStartup = await fetchInitial<Startup>(
    `/startups/${encodeURIComponent(params.id)}`,
  );
  // LCP — cover: head'dan preload (brauzer uni CSS bilan parallel, yuqori
  // ustuvorlikda oladi; HTML ichidan kech topilmaydi)
  if (initialStartup?.coverUrl) {
    preload(initialStartup.coverUrl, { as: 'image', fetchPriority: 'high' });
  }
  return <StartupDetailClient initialStartup={initialStartup} />;
}
