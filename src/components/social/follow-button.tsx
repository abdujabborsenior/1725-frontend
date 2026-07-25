'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserCheck, Spinner } from '@/components/icons';
import { usersApi, getErrorMessage } from '@/lib/api';
import { patchEntityInQueries } from '@/lib/entity-sync';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
  /** O'zingiz bo'lsangiz tugma ko'rsatilmaydi */
  isMe?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  onChange?: (following: boolean, followerCount: number) => void;
}

export function FollowButton({
  userId,
  initialFollowing,
  isMe,
  size = 'md',
  className,
  onChange,
}: FollowButtonProps) {
  const { token } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [following, setFollowing] = useState(initialFollowing);
  const [hover, setHover] = useState(false);
  const [loading, setLoading] = useState(false);
  const interacted = useRef(false);

  // Auth bilan refetch kelganda holatni sinxronlash (refresh'dan keyin to'g'ri)
  useEffect(() => {
    if (interacted.current) return;
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  if (isMe) return null;

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      router.push('/login');
      return;
    }
    if (loading) return;
    interacted.current = true;
    const prev = following;
    setFollowing(!prev);
    setLoading(true);
    try {
      const res = prev
        ? await usersApi.unfollow(userId)
        : await usersApi.follow(userId);
      setFollowing(res.following);
      // Profil/discover/obunachilar keshlarida holat bir xil qolsin
      patchEntityInQueries(qc, userId, {
        isFollowing: res.following,
        followerCount: res.followerCount,
      });
      onChange?.(res.following, res.followerCount);
    } catch (err) {
      setFollowing(prev);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const sizeCls = size === 'sm' ? 'h-8 gap-1 px-3.5 text-footnote' : 'h-10 gap-1.5 px-5 text-subhead';

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={loading}
      className={cn(
        'tappable inline-flex items-center justify-center rounded-full font-semibold',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-500/25',
        following
          ? hover
            ? 'bg-rose-50 text-rose-600'
            : 'bg-fill-tertiary text-brand-900'
          : 'bg-accent-500 text-white active:bg-accent-600',
        sizeCls,
        className,
      )}
    >
      {loading ? (
        <Spinner className="h-3.5 w-3.5 animate-spin" />
      ) : following ? (
        <UserCheck className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      {following ? (hover ? 'Bekor qilish' : 'Kuzatilmoqda') : 'Obuna bo‘lish'}
    </button>
  );
}
