import type { Metadata } from 'next';
import type { PublicGroup, PublicUserCard } from '@/types';
import { fetchInitial } from '@/lib/server-api';
import { DiscoverClient } from './discover-client';

export const metadata: Metadata = {
  title: 'Hamjamiyat',
  description:
    'Odamlarni toping, kuzating va guruhlarga qo‘shiling — MYMarkaz hamjamiyati.',
};

/** SSR: standart ro'yxatlar (odamlar + guruhlar) HTML bilan keladi — CLS 0. */
export const revalidate = 30;

export default async function DiscoverPage() {
  const [initialSuggestions, initialGroups] = await Promise.all([
    fetchInitial<PublicUserCard[]>('/users/suggestions?limit=12'),
    fetchInitial<PublicGroup[]>('/chat/groups/public?limit=20'),
  ]);
  return (
    <DiscoverClient
      initialSuggestions={initialSuggestions}
      initialGroups={initialGroups}
    />
  );
}
