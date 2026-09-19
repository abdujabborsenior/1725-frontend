import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { HomeClient } from './home-client';
import { Scope } from '@/i18n/scope';

/**
 * Bosh sahifa — server qobig'i: til (statik render) + SEO metadata.
 * Butun interaktiv kontent `HomeClient` da (client komponent).
 */
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

export default function HomePage({ params: { locale } }: { params: { locale: AppLocale } }) {
  setRequestLocale(locale);
  return (
    <Scope name="home">
      <HomeClient />
    </Scope>
  );
}
