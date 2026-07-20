'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Lightbulb } from 'lucide-react';
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
        'group inline-flex items-center font-semibold rounded-full transition-all btn-lift',
        sm ? 'h-8 gap-1.5 px-3 text-xs' : 'h-10 gap-2 px-4 text-sm',
        liked
          ? 'bg-accent-700 text-white hover:bg-accent-800'
          : 'border border-slate-200 bg-white text-slate-600 hover:border-accent-300 hover:text-accent-700',
        className,
      )}
    >
      <Lightbulb className={cn(sm ? 'h-3.5 w-3.5' : 'h-4 w-4', liked && 'fill-white', 'transition-transform group-active:scale-110')} />
      <span>Foydali</span>
      {count > 0 && (
        <span className={cn('tabular-nums', liked ? 'text-white/90' : 'text-slate-500')}>
          · {count.toLocaleString('uz')}
        </span>
      )}
    </button>
  );
}
