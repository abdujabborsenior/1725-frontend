'use client';

import { useCallback } from 'react';
import { Lightbulb, LightbulbFill } from '@/components/icons';
import { problemsApi } from '@/lib/api';
import { useToggleAction } from '@/lib/use-toggle-action';
import { cn } from '@/lib/utils';

interface Props {
  problemId: string;
  initialLiked: boolean;
  initialCount: number;
  size?: 'sm' | 'md';
  className?: string;
  onChange?: (liked: boolean, count: number) => void;
}

/**
 * Muammoni "Foydali" deb belgilash. Mantiq — `useToggleAction` (idempotent
 * niyat + navbatlangan bosishlar + kesh sinxronizatsiyasi).
 */
export function ProblemLikeButton({
  problemId, initialLiked, initialCount, size = 'md', className, onChange,
}: Props) {
  const commit = useCallback(
    async (next: boolean) => {
      const res = await problemsApi.toggleLike(problemId, next);
      return { on: res.liked, count: res.likeCount };
    },
    [problemId],
  );

  const {
    on: liked,
    count,
    pending,
    toggle,
  } = useToggleAction({
    id: problemId,
    on: initialLiked,
    count: initialCount,
    commit,
    fields: { on: 'likedByMe', count: 'likeCount' },
    onChange,
  });

  const sm = size === 'sm';

  return (
    <button
      onClick={toggle}
      suppressHydrationWarning
      aria-pressed={liked}
      aria-busy={pending}
      title="Foydali deb belgilash"
      className={cn(
        'tappable inline-flex items-center rounded-full font-medium transition-colors duration-150 ease-ios',
        sm ? 'h-8 gap-1.5 px-3.5 text-footnote' : 'h-10 gap-2 px-4 text-subhead',
        // Bosilgan holat — to'ldirilgan brend kapsulasi + rangdosh nur.
        // Bosilmagani KULRANG PLOMBA emas (kartada 3 tadan takrorlanadi va
        // sahifani kulrang qilib ko'rsatardi), oq sirt + hairline: tinch,
        // lekin kursorda brend tintiga kiradi va chiroq "yonadi".
        liked
          ? 'hv-sheen bg-accent-600 text-white shadow-[0_4px_12px_-5px_rgba(0,113,227,0.6)] hover:shadow-[0_8px_18px_-6px_rgba(0,113,227,0.8)]'
          : 'hv-bulb bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-accent-50 hover:text-accent-700 hover:ring-accent-200',
        className,
      )}
    >
      {liked ? (
        <LightbulbFill key="on" className={cn('heart-pop', sm ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
      ) : (
        <Lightbulb className={sm ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      )}
      <span>Foydali</span>
      {count > 0 && (
        <span className={cn('tabular-nums', liked ? 'text-white/80' : 'text-slate-500')}>
          · {count.toLocaleString('uz')}
        </span>
      )}
    </button>
  );
}
