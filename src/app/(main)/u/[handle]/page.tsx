import { preload } from 'react-dom';
import type { PublicProfile } from '@/types';
import { fetchInitial } from '@/lib/server-api';
import { ProfileClient } from './profile-client';

/** SSR: ochiq profil HTML bilan keladi (LCP/CLS) — follow holatini client yangilaydi. */
export const revalidate = 30;

export default async function PublicProfilePage({
  params,
}: {
  params: { handle: string };
}) {
  const initialProfile = await fetchInitial<PublicProfile>(
    `/users/profile/${encodeURIComponent(params.handle)}`,
  );
  if (initialProfile?.coverUrl) {
    preload(initialProfile.coverUrl, { as: 'image', fetchPriority: 'high' });
  }
  return <ProfileClient initialProfile={initialProfile} />;
}
