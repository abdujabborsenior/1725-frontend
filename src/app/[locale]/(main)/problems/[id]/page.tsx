import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Problem } from '@/types';
import type { AppLocale } from '@/i18n/routing';
import { fetchInitial } from '@/lib/server-api';
import { breadcrumbJsonLd, pageMetadata, problemJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { ProblemDetailClient } from './problem-detail-client';
import { Scope } from '@/i18n/scope';

type Params = { locale: AppLocale; id: string };

/** Sahifa bilan AYNI so'rov — Next uni bitta fetch'ga birlashtiradi (dedupe). */
function loadProblem(id: string) {
  return fetchInitial<Problem>(`/problems/${encodeURIComponent(id)}`);
}

export async function generateMetadata({
  params: { locale, id },
}: {
  params: Params;
}): Promise<Metadata> {
  // `fetchInitial` tilni `getLocale()` dan oladi — statik render saqlanishi
  // uchun (sarlavhalarga murojaat bo'lmasin) til shu yerda ham o'rnatiladi.
  setRequestLocale(locale);
  const path = `/problems/${id}`;
  const problem = await loadProblem(id);

  if (!problem) {
    const t = await getTranslations({ locale, namespace: 'meta.problems.detail' });
    return pageMetadata({
      locale,
      path,
      title: t('notFoundTitle'),
      description: t('notFoundDescription'),
      noindex: true,
    });
  }

  return pageMetadata({
    locale,
    path,
    title: problem.title,
    description: problem.description,
    // Ulashish kartasi uchun muammoning o'z rasmi (faqat absolyut URL)
    image: problem.imageUrls.find((u) => /^https?:\/\//i.test(u)) ?? null,
    type: 'article',
  });
}

/** SSR: muammo matni HTML bilan keladi (LCP/CLS) — client flaglarni yangilaydi. */
export const revalidate = 30;

export default async function ProblemDetailPage({
  params: { locale, id },
}: {
  params: Params;
}) {
  setRequestLocale(locale);
  const initialProblem = await loadProblem(id);
  // Strukturali ma'lumot — faqat SSR'da kontent kelgan bo'lsa (bo'sh/yolg'on
  // markup Google'da "spammy" deb baholanadi)
  const t = await getTranslations({ locale, namespace: 'nav.links' });
  return (
    <Scope name="problemDetail">
      {initialProblem && (
        <JsonLd
          data={[
            problemJsonLd(locale, {
              id: initialProblem.id,
              title: initialProblem.title,
              description: initialProblem.description,
              createdAt: initialProblem.createdAt,
              updatedAt: initialProblem.updatedAt,
              likeCount: initialProblem.likeCount,
              viewCount: initialProblem.viewCount,
              imageUrls: initialProblem.imageUrls,
              author: initialProblem.submittedBy
                ? {
                    fullName: initialProblem.submittedBy.fullName,
                    username: initialProblem.submittedBy.username ?? null,
                  }
                : null,
              solutionCount: initialProblem.solutions?.length ?? 0,
            }),
            breadcrumbJsonLd(locale, [
              { name: t('problems'), path: '/problems' },
              { name: initialProblem.title, path: `/problems/${initialProblem.id}` },
            ]),
          ]}
        />
      )}
      <ProblemDetailClient initialProblem={initialProblem} />
    </Scope>
  );
}
