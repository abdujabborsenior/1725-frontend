'use client';

import { useCallback } from 'react';
import { ThumbsUp, ThumbsUpFill } from '@/components/icons';
import { usersApi } from '@/lib/api';
import { useToggleAction } from '@/lib/use-toggle-action';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

/**
 * Asoschiga ovoz. Mantiq — `useToggleAction`: serverga NIYAT yuboriladi
 * (idempotent), tez ketma-ket bosishlar navbatlanadi, natija barcha
 * keshlarga (liderbord + profil) yoziladi. O'ziga ovoz berib bo'lmaydi.
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
  const { user } = useAuthStore();
  const isMe = user?.id === userId;

  const commit = useCallback(
    async (next: boolean) => {
      const res = await usersApi.toggleFounderVote(userId, next);
      return { on: res.voted, count: res.voteCount };
    },
    [userId],
  );

  const {
    on: voted,
    count,
    pending,
    toggle,
  } = useToggleAction({
    id: userId,
    on: initialVoted,
    count: initialCount,
    commit,
    // Liderbord (`votedByMe`) va profil (`founderVotedByMe`) keshlari
    // bir xil qolishi uchun ikkala nom ham yangilanadi.
    fields: { on: ['votedByMe', 'founderVotedByMe'], count: 'founderVoteCount' },
    onChange,
  });

  const sm = size === 'sm';

  if (isMe) {
    // O'ziga ovoz berib bo'lmaydi — faqat hisob ko'rsatiladi
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-fill-tertiary font-semibold text-slate-600',
          sm ? 'h-8 px-3 text-footnote' : 'h-10 px-4 text-subhead',
        )}
      >
        <ThumbsUp className={sm ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        {count.toLocaleString('uz')} ovoz
      </span>
    );
  }

  return (
    <button
      onClick={toggle}
      suppressHydrationWarning
      aria-busy={pending}
      aria-pressed={voted}
      className={cn(
        'tappable inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors duration-150 ease-ios',
        sm ? 'h-8 px-3 text-footnote' : 'h-10 px-4 text-subhead',
        voted
          ? 'border-accent-700 bg-accent-700 text-white hover:bg-accent-800'
          : 'border-slate-200 bg-white text-slate-600 hover:border-accent-200 hover:text-accent-700',
      )}
    >
      {voted ? (
        <ThumbsUpFill key="on" className={cn('heart-pop', sm ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
      ) : (
        <ThumbsUp className={sm ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      )}
      {voted ? 'Ovoz berilgan' : 'Ovoz berish'}
      <span className={cn('font-bold tabular-nums', voted ? 'text-white/90' : 'text-brand-900')}>
        {count.toLocaleString('uz')}
      </span>
    </button>
  );
}
