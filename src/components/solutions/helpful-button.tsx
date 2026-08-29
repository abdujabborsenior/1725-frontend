'use client';

import { useCallback } from 'react';
import { Lightbulb, LightbulbFill } from '@/components/icons';
import { solutionsApi } from '@/lib/api';
import { useToggleAction } from '@/lib/use-toggle-action';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

/**
 * Yechimni "Foydali" deb belgilash — toggle (bitta endpoint).
 * Muammo "Foydali" tugmasidan farqli uslub: to'liq pill emas, yumshoq chip;
 * belgilangan holat solid emas, soft-fill. O'z yechimida faqat hisob ko'rinadi.
 */
export function SolutionHelpfulButton({
  solutionId,
  ownerId,
  initialHelpful,
  initialCount,
  className,
}: {
  solutionId: string;
  ownerId: string | null;
  initialHelpful: boolean;
  initialCount: number;
  className?: string;
}) {
  const { user } = useAuthStore();
  const isMine = !!user && user.id === ownerId;

  const commit = useCallback(
    async (next: boolean) => {
      const res = await solutionsApi.toggleHelpful(solutionId, next);
      return { on: res.helpful, count: res.helpfulCount };
    },
    [solutionId],
  );

  const {
    on: helpful,
    count,
    pending,
    toggle,
  } = useToggleAction({
    id: solutionId,
    on: initialHelpful,
    count: initialCount,
    commit,
    fields: { on: 'helpfulByMe', count: 'helpfulCount' },
  });

  if (isMine) {
    // O'z yechimini belgilab bo'lmaydi — faqat nechta odam foydali degani
    if (count === 0) return null;
    return (
      <span
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-ios bg-fill-tertiary px-2.5 text-footnote font-semibold text-slate-600',
          className,
        )}
      >
        <Lightbulb className="h-3.5 w-3.5 text-accent-600" />
        {count.toLocaleString('uz')} kishi foydali dedi
      </span>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={helpful}
      aria-busy={pending}
      title={helpful ? 'Belgini olib tashlash' : 'Yechimni foydali deb belgilash'}
      className={cn(
        'tappable inline-flex h-8 items-center gap-1.5 rounded-ios border px-2.5 text-footnote font-semibold transition-colors duration-150 ease-ios',
        helpful
          ? 'border-accent-400 bg-accent-50 text-accent-700 hover:bg-accent-100'
          : 'border-slate-200 bg-white text-slate-500 hover:border-accent-200 hover:text-accent-700',
        className,
      )}
    >
      {helpful ? (
        <LightbulbFill key="on" className="heart-pop h-3.5 w-3.5" />
      ) : (
        <Lightbulb className="h-3.5 w-3.5" />
      )}
      {helpful ? 'Foydali deb belgilandi' : 'Foydali'}
      {count > 0 && (
        <span className={cn('tabular-nums font-bold', helpful ? 'text-accent-700' : 'text-slate-500')}>
          {count.toLocaleString('uz')}
        </span>
      )}
    </button>
  );
}
