'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Lightbulb } from 'lucide-react';
import { problemsApi, getErrorMessage } from '@/lib/api';
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
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (loading) return;
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!prevLiked);
    setCount(prevCount + (prevLiked ? -1 : 1));
    setLoading(true);
    try {
      const res = await problemsApi.toggleLike(problemId);
      setLiked(res.liked);
      setCount(res.likeCount);
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
          ? 'bg-accent-500 text-white shadow-glow-accent hover:bg-accent-600'
          : 'border border-slate-200 bg-white text-slate-600 hover:border-accent-300 hover:text-accent-700',
        className,
      )}
    >
      <Lightbulb className={cn(sm ? 'h-3.5 w-3.5' : 'h-4 w-4', liked && 'fill-white', 'transition-transform group-active:scale-110')} />
      <span>Foydali</span>
      {count > 0 && (
        <span className={cn('tabular-nums', liked ? 'text-white/90' : 'text-slate-400')}>
          · {count.toLocaleString('uz')}
        </span>
      )}
    </button>
  );
}
