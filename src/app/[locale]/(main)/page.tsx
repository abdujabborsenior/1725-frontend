import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import type {
  LeaderboardResponse,
  PaginatedResponse,
  Poll,
  Problem,
  PublicGroup,
  PublicUserCard,
  Startup,
} from '@/types';
import { fetchInitial } from '@/lib/server-api';
import { pageMetadata } from '@/lib/seo';
import { HomeClient, type HomeInitial } from './home-client';
import { Scope } from '@/i18n/scope';

/**
 * Bosh sahifa — server qobig'i: til (statik render) + SEO metadata + bosh
 * sahifaning BARCHA ommaviy ma'lumoti (ISR).
 *
 * Nega serverda (2026-09-21, 1M miqyos): ilgari bosh sahifa ochilgan HAR
 * brauzer backend'ga 6 ta so'rov yuborardi (startaplar, reyting, muammolar,
 * guruhlar, tavsiyalar, ovoz berish) — 1M bir vaqtdagi mehmon = 6M API
 * chaqiruvi. Endi ular ISR bilan HTML'ga kiradi: backend'ga har til uchun
 * ~60 s da BIR marta so'rov ketadi, mehmon brauzeri esa API'ga umuman
 * murojaat qilmaydi (kirgan foydalanuvchida — faqat shaxsiy belgilar uchun,
 * `useSsrSeed`). Qo'shimcha foyda: kontent (startap/muammo havolalari)
 * HTML'da — qidiruv tizimlari uchun ham.
 *
 * Fail-open: backend javob bermasa `null` → client o'zi yuklaydi (avvalgidek).
 */
export const revalidate = 60;
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.home' });
  return pageMetadata({
    locale,
    path: '/',
    title: t('title'),
    description: t('description'),
    // Brend nomi sarlavhaning o'zida — " | MYMarkaz" shabloni qo'shilmaydi
    absoluteTitle: true,
  });
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  const [startups, leaderboard, problems, groups, suggestions, polls] = await Promise.all([
    fetchInitial<PaginatedResponse<Startup>>('/startups?limit=6&sort=featured', 60),
    fetchInitial<LeaderboardResponse>('/startups/leaderboard?limit=6&period=all', 60),
    fetchInitial<PaginatedResponse<Problem>>('/problems?limit=6&status=open', 60),
    fetchInitial<PublicGroup[]>('/chat/groups/public?limit=5', 60),
    fetchInitial<PublicUserCard[]>('/users/suggestions?limit=5', 60),
    fetchInitial<Poll[]>('/polls', 60),
  ]);
  const initial: HomeInitial = { startups, leaderboard, problems, groups, suggestions, polls };
  return (
    <Scope name="home">
      <HomeClient initial={initial} />
    </Scope>
  );
}
