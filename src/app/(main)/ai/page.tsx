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
 *
 * Sarlavha ATAYLAB ixcham: sahifaning asosiy qahramoni — konsolning o'zi,
 * bo'sh holatdagi katta mark esa kirish taassurotini beradi.
 */
export default function AiPage() {
  return (
    <div className="mx-auto max-w-3xl">
      {/* Sahifa yorlig'i ATAYLAB kichik: qahramon — konsolning o'zi.
          Katta sarlavha bo'sh holatning ichida (mark bilan birga) turadi,
          shuning uchun bu yerda faqat "qayerdaman?" javobi bo'lishi kerak. */}
      <header className="mb-4 flex items-center gap-2">
        <YechimMark size={20} className="ai-open-mark" />
        <h1 className="text-subhead font-semibold tracking-tight text-slate-500">Yechim AI</h1>
      </header>

      <Suspense fallback={null}>
        <AiConsole />
      </Suspense>
    </div>
  );
}
