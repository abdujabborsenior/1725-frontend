import type { Problem } from '@/types';
import { fetchInitial } from '@/lib/server-api';
import { ProblemDetailClient } from './problem-detail-client';

/** SSR: muammo matni HTML bilan keladi (LCP/CLS) — client flaglarni yangilaydi. */
export const revalidate = 30;

export default async function ProblemDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const initialProblem = await fetchInitial<Problem>(
    `/problems/${encodeURIComponent(params.id)}`,
  );
  return <ProblemDetailClient initialProblem={initialProblem} />;
}
