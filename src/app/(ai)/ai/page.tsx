import { Suspense } from 'react';
import type { Metadata } from 'next';

import { AiWorkspace } from '@/components/ai/ai-workspace';

export const metadata: Metadata = {
  title: 'Yechim AI — muammoingizga yechim topadi',
  description:
    'Muammoingizni yozing yoki aytib bering — Yechim AI MYMarkaz platformasidagi loyihalar orasidan sizga mos yechimni topib beradi.',
};

/**
 * Yechim AI sahifasi — butun ekran Studio'ga beriladi.
 * `useSearchParams` ishlatilgani uchun Suspense chegarasi majburiy (Next 14).
 */
export default function AiPage() {
  return (
    <Suspense fallback={null}>
      <AiWorkspace />
    </Suspense>
  );
}
