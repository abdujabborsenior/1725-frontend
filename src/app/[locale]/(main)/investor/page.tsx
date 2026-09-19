import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { InvestorClient } from './investor-client';
import { Scope } from '@/i18n/scope';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.investor' });
  return pageMetadata({
    locale,
    path: '/investor',
    title: t('cabinet.title'),
    description: t('cabinet.description'),
    // Shaxsiy kabinet — qidiruv tizimida ko'rinmaydi
    noindex: true,
  });
}

/** Investor kabineti — profil, tasdiq holati va lentaga kirish. */
export default function InvestorPage({
  params: { locale },
}: {
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  return (
    <Scope name="investor">
      <InvestorClient />
    </Scope>
  );
}
