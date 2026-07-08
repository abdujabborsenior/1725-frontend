import type { Metadata } from 'next';
import type { Poll } from '@/types';
import { fetchInitial } from '@/lib/server-api';
import { PollsClient } from './polls-client';

export const metadata: Metadata = {
  title: 'Ovoz berish',
  description:
    'Hamjamiyat tanlovi — eng kuchli startaplarga ovoz bering, natijalarni jonli kuzating.',
};

/** SSR: tanlovlar ro'yxati HTML bilan keladi (LCP/CLS); backend yotsa client yuklaydi. */
export const revalidate = 30;

export default async function PollsPage() {
  const initialPolls = await fetchInitial<Poll[]>('/polls');
  return <PollsClient initialPolls={initialPolls} />;
}
