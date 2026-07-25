'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ThumbsUp } from '@/components/icons';
import { usersApi, getErrorMessage } from '@/lib/api';
import { patchEntityInQueries } from '@/lib/entity-sync';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

/**
 * Asoschiga ovoz — TOGGLE (bitta endpoint): bosilsa ovoz beradi, qayta bosilsa
 * qaytarib oladi. Guest bosса register orqali aynan shu sahifaga qaytadi.
 */
export function FounderVoteButton({
  userId,
  initialVoted,
  initialCount,
  size = 'md',
  onChange,
}: {
  userId: string;
  initialVoted: boolean;
  initialCount: number;
  size?: 'sm' | 'md';
  onChange?: (voted: boolean, count: number) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user } = useAuthStore();
  const qc = useQueryClient();
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const interacted = useRef(false);

  // Auth bilan refetch kelganda holatni sinxronlash (refresh'dan keyin to'g'ri)
  useEffect(() => {
    if (interacted.current) return;
    setVoted(initialVoted);
    setCount(initialCount);
  }, [initialVoted, initialCount]);

  const isMe = user?.id === userId;

  async function toggle() {
    if (!token) {
      router.push(`/register?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (isMe || busy) return;
    interacted.current = true;

    // Optimistik yangilash — xatoда orqaga qaytariladi
    const prev = { voted, count };
    setVoted(!voted);
    setCount((c) => (voted ? Math.max(c - 1, 0) : c + 1));
    setBusy(true);
    try {
      const res = await usersApi.toggleFounderVote(userId);
      setVoted(res.voted);
      setCount(res.voteCount);
      // Liderbord (votedByMe) va profil (founderVotedByMe) keshlari bir xil qolsin
      patchEntityInQueries(qc, userId, {
        votedByMe: res.voted,
        founderVotedByMe: res.voted,
        founderVoteCount: res.voteCount,
      });
      onChange?.(res.voted, res.voteCount);
    } catch (err) {
      setVoted(prev.voted);
      setCount(prev.count);
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (isMe) {
    // O'ziga ovoz berib bo'lmaydi — faqat hisob ko'rsatiladi
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-fill-tertiary font-semibold text-slate-600',
          size === 'sm' ? 'h-8 px-3 text-footnote' : 'h-10 px-4 text-subhead',
        )}
      >
        <ThumbsUp className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        {count.toLocaleString('uz')} ovoz
      </span>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={voted}
      className={cn(
        'tappable inline-flex items-center gap-1.5 rounded-full border font-semibold transition-all',
        size === 'sm' ? 'h-8 px-3 text-footnote' : 'h-10 px-4 text-subhead',
        voted
          ? 'border-accent-700 bg-accent-700 text-white hover:bg-accent-800'
          : 'border-slate-200 bg-white text-slate-600 hover:text-accent-700',
      )}
    >
      <ThumbsUp
        className={cn(
          size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
          voted && 'fill-current',
        )}
      />
      {voted ? 'Ovoz berilgan' : 'Ovoz berish'}
      <span className={cn('font-bold', voted ? 'text-white/90' : 'text-brand-900')}>
        {count.toLocaleString('uz')}
      </span>
    </button>
  );
}
