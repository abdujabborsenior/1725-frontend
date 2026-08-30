'use client';

import { useCallback, useState } from 'react';
import { UserPlus, UserCheck } from '@/components/icons';
import { usersApi } from '@/lib/api';
import { useToggleAction } from '@/lib/use-toggle-action';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
  /** O'zingiz bo'lsangiz tugma ko'rsatilmaydi */
  isMe?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  onChange?: (following: boolean, followerCount: number) => void;
}

/**
 * Obuna tugmasi. Mantiq — `useToggleAction`: backend'ning `follow`/`unfollow`
 * endpointlari allaqachon NIYAT asosida (idempotent), shuning uchun mijoz
 * holati eskirgan bo'lsa ham natija foydalanuvchi kutgani bilan bir xil
 * bo'ladi. Tugma so'rov davomida `disabled` qilinmaydi — tez ketma-ket
 * bosishlar navbatlanadi (ilgari ikkinchi bosish jimgina yo'qolardi).
 */
export function FollowButton({
  userId,
  initialFollowing,
  isMe,
  size = 'md',
  className,
  onChange,
}: FollowButtonProps) {
  const [hover, setHover] = useState(false);

  const commit = useCallback(
    async (next: boolean) => {
      const res = next ? await usersApi.follow(userId) : await usersApi.unfollow(userId);
      return { on: res.following, count: res.followerCount };
    },
    [userId],
  );

  const { on: following, pending, toggle } = useToggleAction({
    id: userId,
    on: initialFollowing,
    commit,
    fields: { on: 'isFollowing', count: 'followerCount' },
    onChange,
  });

  if (isMe) return null;

  const sizeCls = size === 'sm' ? 'h-8 gap-1 px-3.5 text-footnote' : 'h-10 gap-1.5 px-5 text-subhead';

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-pressed={following}
      aria-busy={pending}
      className={cn(
        'tappable inline-flex items-center justify-center rounded-full font-semibold',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-500/25',
        following
          ? hover
            ? 'bg-rose-50 text-rose-600'
            : 'bg-fill-tertiary text-brand-900'
          : 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-700',
        sizeCls,
        className,
      )}
    >
      {following ? (
        <UserCheck className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      {following ? (hover ? 'Bekor qilish' : 'Kuzatilmoqda') : 'Obuna bo‘lish'}
    </button>
  );
}
