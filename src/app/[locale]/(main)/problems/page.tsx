import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { PaginatedResponse, Problem } from '@/types';
import type { AppLocale } from '@/i18n/routing';
import { fetchInitial } from '@/lib/server-api';
import { pageMetadata } from '@/lib/seo';
import { ProblemsClient } from './problems-client';
import { Scope } from '@/i18n/scope';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: AppLocale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.problems.list' });
  return pageMetadata({
    locale,
    path: '/problems',
    title: t('title'),
    description: t('description'),
  });
}

/**
 * Server component: 1-sahifa ro'yxatini SSR'da olib keladi (Next data-keshi,
 * ~30 s) — LCP matn kartalari HTML bilan birga keladi. Backend yotsa —
 * `null` (client o'zi yuklaydi, hozirgi xulq).
 */
export const revalidate = 30;

export default async function ProblemsPage({
  params: { locale },
}: {
  params: { locale: AppLocale };
}) {
  setRequestLocale(locale);
  const initialList = await fetchInitial<PaginatedResponse<Problem>>(
    '/problems?page=1&limit=9',
  );
  return (
    <Scope name="problemsPage">
      <ProblemsClient initialList={initialList} />
    </Scope>
  );
}
