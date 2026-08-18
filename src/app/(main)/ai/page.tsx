import { Suspense } from 'react';
import type { Metadata } from 'next';

import { AiConsole } from '@/components/ai/ai-console';
import { YechimMark } from '@/components/ai/yechim-mark';

export const metadata: Metadata = {
  title: 'Yechim AI — muammoingizga yechim topadi',
  description:
    'Muammoingizni yozing yoki aytib bering — Yechim AI MYMarkaz platformasidagi loyihalar orasidan sizga mos yechimni topib beradi.',
};

/**
 * Yechim AI sahifasi.
 *
 * Sarlavha server komponentida (SSR bilan darhol keladi — LCP matn),
 * interaktiv qism esa `AiConsole` klientida. `useSearchParams` ishlatilgani
 * uchun Suspense chegarasi majburiy (Next 14 app router).
 */
export default function AiPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6 flex items-center gap-3.5">
        <YechimMark size={44} />
        <div className="min-w-0">
          <h1 className="text-large-title font-bold tracking-tight text-brand-900">
            Yechim AI
          </h1>
          <p className="mt-0.5 text-subhead text-slate-500">
            Muammoingizga platformadagi tayyor yechimni topadi
          </p>
        </div>
      </header>

      <Suspense fallback={null}>
        <AiConsole />
      </Suspense>
    </div>
  );
}
