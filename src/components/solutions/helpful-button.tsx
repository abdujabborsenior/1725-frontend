'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Lightbulb } from '@/components/icons';
import { solutionsApi, getErrorMessage } from '@/lib/api';
import { patchEntityInQueries } from '@/lib/entity-sync';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

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
  const router = useRouter();
  const pathname = usePathname();
  const { token, user } = useAuthStore();
  const qc = useQueryClient();
  const [helpful, setHelpful] = useState(initialHelpful);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const interacted = useRef(false);

  // Auth bilan refetch kelganda holatni sinxronlash (refresh'dan keyin to'g'ri)
  useEffect(() => {
    if (interacted.current) return;
    setHelpful(initialHelpful);
    setCount(initialCount);
  }, [initialHelpful, initialCount]);

  const isMine = !!user && user.id === ownerId;

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      router.push(`/register?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (isMine || busy) return;
    interacted.current = true;

    const prev = { helpful, count };
    setHelpful(!helpful);
    setCount((c) => (helpful ? Math.max(c - 1, 0) : c + 1));
    setBusy(true);
    try {
      const res = await solutionsApi.toggleHelpful(solutionId);
      setHelpful(res.helpful);
      setCount(res.helpfulCount);
      // Barcha sahifa keshlarida holat bir xil qolsin
      patchEntityInQueries(qc, solutionId, {
        helpfulByMe: res.helpful,
        helpfulCount: res.helpfulCount,
      });
    } catch (err) {
      setHelpful(prev.helpful);
      setCount(prev.count);
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

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
      disabled={busy}
      aria-pressed={helpful}
      title={helpful ? 'Belgini olib tashlash' : 'Yechimni foydali deb belgilash'}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-ios border px-2.5 text-footnote font-semibold transition-all',
        helpful
          ? 'border-accent-400 bg-accent-50 text-accent-700 hover:bg-accent-100'
          : 'border-slate-200 bg-white text-slate-500 hover:text-accent-700',
        className,
      )}
    >
      <Lightbulb className={cn('h-3.5 w-3.5', helpful && 'fill-accent-200')} />
      {helpful ? 'Foydali deb belgilandi' : 'Foydali'}
      {count > 0 && (
        <span className={cn('tabular-nums font-bold', helpful ? 'text-accent-700' : 'text-slate-400')}>
          {count.toLocaleString('uz')}
        </span>
      )}
    </button>
  );
}
