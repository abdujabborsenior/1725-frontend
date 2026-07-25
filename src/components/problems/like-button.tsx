'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Lightbulb, LightbulbFill } from '@/components/icons';
import { problemsApi, getErrorMessage } from '@/lib/api';
import { patchEntityInQueries } from '@/lib/entity-sync';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props {
  problemId: string;
  initialLiked: boolean;
  initialCount: number;
  size?: 'sm' | 'md';
  className?: string;
  onChange?: (liked: boolean, count: number) => void;
}

export function ProblemLikeButton({
  problemId, initialLiked, initialCount, size = 'md', className, onChange,
}: Props) {
  const { token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const interacted = useRef(false);

  // Server'dan yangilangan holat (auth bilan refetch) — foydalanuvchi hali
  // bosmagan bo'lsa prop'ga ergashamiz (refresh'dan keyin holat to'g'ri turadi).
  useEffect(() => {
    if (interacted.current) return;
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (loading) return;
    interacted.current = true;
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!prevLiked);
    setCount(prevCount + (prevLiked ? -1 : 1));
    setLoading(true);
    try {
      const res = await problemsApi.toggleLike(problemId);
      setLiked(res.liked);
      setCount(res.likeCount);
      // Barcha sahifa keshlarida holat bir xil qolsin (orqaga qaytganda ham)
      patchEntityInQueries(qc, problemId, {
        likedByMe: res.liked,
        likeCount: res.likeCount,
      });
      onChange?.(res.liked, res.likeCount);
    } catch (err) {
      setLiked(prevLiked);
      setCount(prevCount);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const sm = size === 'sm';

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-pressed={liked}
      title="Foydali deb belgilash"
      className={cn(
        'tappable inline-flex items-center rounded-full font-medium',
        sm ? 'h-8 gap-1.5 px-3.5 text-footnote' : 'h-10 gap-2 px-4 text-subhead',
        liked ? 'bg-accent-600 text-white' : 'bg-fill-tertiary text-slate-600',
        className,
      )}
    >
      {liked ? (
        <LightbulbFill className={sm ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      ) : (
        <Lightbulb className={sm ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      )}
      <span>Foydali</span>
      {count > 0 && (
        <span className={cn('tabular-nums', liked ? 'text-white/80' : 'text-slate-400')}>
          · {count.toLocaleString('uz')}
        </span>
      )}
    </button>
  );
}
