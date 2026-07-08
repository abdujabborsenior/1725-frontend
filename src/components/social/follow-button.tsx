'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { usersApi, getErrorMessage } from '@/lib/api';
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
  const [following, setFollowing] = useState(initialFollowing);
  const [hover, setHover] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isMe) return null;

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      router.push('/login');
      return;
    }
    if (loading) return;
    const prev = following;
    setFollowing(!prev);
    setLoading(true);
    try {
      const res = prev
        ? await usersApi.unfollow(userId)
        : await usersApi.follow(userId);
      setFollowing(res.following);
      onChange?.(res.following, res.followerCount);
    } catch (err) {
      setFollowing(prev);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const sizeCls = size === 'sm' ? 'h-8 px-3 text-xs gap-1' : 'h-10 px-5 text-sm gap-1.5';

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-150 btn-lift',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40',
        following
          ? hover
            ? 'bg-rose-50 text-rose-600 border border-rose-200'
            : 'bg-white text-brand-900 border border-slate-200'
          : 'bg-accent-700 text-white border border-transparent hover:bg-accent-800',
        sizeCls,
        className,
      )}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : following ? (
        <UserCheck className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      {following ? (hover ? 'Bekor qilish' : 'Kuzatilmoqda') : 'Obuna bo‘lish'}
    </button>
  );
}
