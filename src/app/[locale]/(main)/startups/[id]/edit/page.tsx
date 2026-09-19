import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { EditStartupClient } from './edit-startup-client';
import { Scope } from '@/i18n/scope';

/** Tahrirlash — faqat egasi uchun: qidiruv tizimi indekslamaydi. */
export async function generateMetadata({
  params: { locale, id },
}: {
  params: { locale: AppLocale; id: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.startups.edit' });
  return pageMetadata({
    locale,
    path: `/startups/${id}/edit`,
    title: t('title'),
    description: t('description'),
    noindex: true,
  });
}

export default function EditStartupPage({
  params: { locale },
}: {
  params: { locale: AppLocale; id: string };
}) {
  setRequestLocale(locale);
  return (
    <Scope name="startupForm">
      <EditStartupClient />
    </Scope>
  );
}
