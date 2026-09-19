import type { Metadata } from 'next';
import { preload } from 'react-dom';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { PublicProfile } from '@/types';
import type { AppLocale } from '@/i18n/routing';
import { fetchInitial } from '@/lib/server-api';
import { pageMetadata, profileJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { ProfileClient } from './profile-client';
import { Scope } from '@/i18n/scope';

/** SSR: ochiq profil HTML bilan keladi (LCP/CLS) — follow holatini client yangilaydi. */
export const revalidate = 30;

type Params = { locale: AppLocale; handle: string };

/** Sahifa va metadata BIR XIL so'rovni chaqiradi — Next uni bitta fetch'ga birlashtiradi. */
function loadProfile(handle: string) {
  return fetchInitial<PublicProfile>(`/users/profile/${encodeURIComponent(handle)}`);
}

export async function generateMetadata({
  params: { locale, handle },
}: {
  params: Params;
}): Promise<Metadata> {
  // `fetchInitial` tilni `getLocale()` dan oladi — metadata sahifadan OLDIN
  // hisoblanishi mumkin, shuning uchun til shu yerda ham o'rnatiladi (aks
  // holda u `headers()` ga tushib, ISR sahifani dinamikka aylantirardi).
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'meta.user' });
  const profile = await loadProfile(handle);
  const path = `/u/${handle}`;

  if (!profile) {
    return pageMetadata({
      locale,
      path,
      title: t('notFoundTitle'),
      description: t('notFoundDescription'),
      noindex: true,
    });
  }

  const title = profile.username
    ? `${profile.fullName} (@${profile.username})`
    : profile.fullName;
  // Tavsif — odamning o'z so'zlari (sarlavha + bio); bo'lmasa platforma matni
  const about = [profile.headline?.trim().replace(/[\s.]+$/, ''), profile.bio?.trim()]
    .filter(Boolean)
    .join('. ');
  const description = about
    ? t('descriptionAbout', { name: profile.fullName, about })
    : t('description', { name: profile.fullName });

  return pageMetadata({
    locale,
    path,
    title,
    description,
    image: profile.avatarUrl ?? profile.coverUrl,
    type: 'profile',
  });
}

export default async function PublicProfilePage({
  params: { locale, handle },
}: {
  params: Params;
}) {
  setRequestLocale(locale);
  const initialProfile = await loadProfile(handle);
  if (initialProfile?.coverUrl) {
    preload(initialProfile.coverUrl, { as: 'image', fetchPriority: 'high' });
  }
  return (
    <Scope name="publicProfile">
      {initialProfile?.username && (
        <JsonLd
          data={profileJsonLd(locale, {
            username: initialProfile.username,
            fullName: initialProfile.fullName,
            headline: initialProfile.headline,
            bio: initialProfile.bio,
            avatarUrl: initialProfile.avatarUrl,
            createdAt: initialProfile.createdAt,
            followerCount: initialProfile.followerCount,
          })}
        />
      )}
      <ProfileClient initialProfile={initialProfile} />
    </Scope>
  );
}
