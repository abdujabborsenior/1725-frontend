import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { ConversationClient } from './conversation-client';

/**
 * Suhbat — shaxsiy (token bilan ochiladi): serverda uning nomini bilib
 * bo'lmaydi va bilish kerak ham emas — umumiy sarlavha, indekslanmaydi.
 */
export async function generateMetadata({
  params: { locale, id },
}: {
  params: { locale: AppLocale; id: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.chat' });
  return pageMetadata({
    locale,
    path: `/messages/${id}`,
    title: t('title'),
    description: t('description'),
    noindex: true,
  });
}

export default function ConversationPage({
  params: { locale },
}: {
  params: { locale: AppLocale; id: string };
}) {
  setRequestLocale(locale);
  return <ConversationClient />;
}
