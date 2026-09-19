import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { CreateStartupClient } from './create-startup-client';
import { Scope } from '@/i18n/scope';

/** Forma sahifasi — shaxsiy amal, qidiruv tizimi indekslamaydi. */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.startups.create' });
  return pageMetadata({
    locale,
    path: '/startups/create',
    title: t('title'),
    description: t('description'),
    noindex: true,
  });
}

export default function CreateStartupPage({
  params: { locale },
}: {
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  return (
    <Scope name="startupForm">
      <CreateStartupClient />
    </Scope>
  );
}
