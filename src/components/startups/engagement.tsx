'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Heart, Bookmark } from 'lucide-react';
import { startupsApi, getErrorMessage } from '@/lib/api';
import { patchEntityInQueries } from '@/lib/entity-sync';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import type { Startup } from '@/types';
import toast from 'react-hot-toast';

type Variant = 'card' | 'detail';

function useAuthGuard() {
  const { token } = useAuthStore();
  const router = useRouter();
  return () => {
    if (!token) {
      toast.error('Buning uchun tizimga kiring');
      router.push('/login');
      return false;
    }
    return true;
  };
}

export function LikeButton({
  startup,
  variant = 'detail',
  onChange,
}: {
  startup: Startup;
  variant?: Variant;
  onChange?: (liked: boolean, count: number) => void;
}) {
  const guard = useAuthGuard();
  const qc = useQueryClient();
  const [liked, setLiked] = useState(!!startup.likedByMe);
  const [count, setCount] = useState(startup.likeCount ?? 0);
  const [busy, setBusy] = useState(false);
  const interacted = useRef(false);

  // Auth bilan refetch kelganda (SSR'da flag'lar bo'lmaydi) holatni sinxronlash
  useEffect(() => {
    if (interacted.current) return;
    setLiked(!!startup.likedByMe);
    setCount(startup.likeCount ?? 0);
  }, [startup.likedByMe, startup.likeCount]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy || !guard()) return;
    interacted.current = true;

    // optimistik
    const next = !liked;
    setLiked(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    setBusy(true);
    try {
      const res = await startupsApi.toggleLike(startup.id);
      setLiked(res.liked);
      setCount(res.likeCount);
      // Barcha sahifa keshlarida holat bir xil qolsin
      patchEntityInQueries(qc, startup.id, {
        likedByMe: res.liked,
        likeCount: res.likeCount,
      });
      onChange?.(res.liked, res.likeCount);
    } catch (err) {
      setLiked(!next);
      setCount((c) => Math.max(0, c + (next ? -1 : 1)));
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (variant === 'card') {
    return (
      <button
        onClick={toggle}
        // ko'rinadigan matn (son) accessible name ichida bo'lishi shart
        aria-label={`Yoqtirish — ${count}`}
        // -m-1.5 p-1.5 — vizual o'lcham o'zgarmagan holda tap-maydon ≥24px
        className={cn(
          'inline-flex min-h-6 items-center gap-1 rounded-md text-[11px] font-medium transition-colors -m-1.5 p-1.5',
          liked ? 'text-rose-600' : 'text-slate-500 hover:text-rose-500',
        )}
      >
        <Heart className={cn('h-3.5 w-3.5', liked && 'fill-rose-500 text-rose-500')} />
        {count}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={cn(
        'inline-flex items-center gap-2 h-11 px-4 rounded-xl border font-semibold transition-all btn-lift',
        liked
          ? 'bg-rose-50 border-rose-200 text-rose-600'
          : 'bg-white border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-600',
      )}
    >
      <Heart className={cn('h-4 w-4', liked && 'fill-rose-500 text-rose-500')} />
      {count}
    </button>
  );
}

export function BookmarkButton({
  startup,
  variant = 'detail',
  onChange,
}: {
  startup: Startup;
  variant?: Variant;
  onChange?: (bookmarked: boolean) => void;
}) {
  const guard = useAuthGuard();
  const qc = useQueryClient();
  const [saved, setSaved] = useState(!!startup.bookmarkedByMe);
  const [busy, setBusy] = useState(false);
  const interacted = useRef(false);

  // Auth bilan refetch kelganda holatni sinxronlash (refresh'dan keyin to'g'ri)
  useEffect(() => {
    if (interacted.current) return;
    setSaved(!!startup.bookmarkedByMe);
  }, [startup.bookmarkedByMe]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy || !guard()) return;
    interacted.current = true;

    const next = !saved;
    setSaved(next);
    setBusy(true);
    try {
      const res = await startupsApi.toggleBookmark(startup.id);
      setSaved(res.bookmarked);
      // Barcha sahifa keshlarida holat bir xil qolsin
      patchEntityInQueries(qc, startup.id, { bookmarkedByMe: res.bookmarked });
      onChange?.(res.bookmarked);
      toast.success(res.bookmarked ? 'Saqlandi' : 'Saqlanganlardan olib tashlandi');
    } catch (err) {
      setSaved(!next);
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (variant === 'card') {
    return (
      <button
        onClick={toggle}
        aria-label="Saqlash"
        className={cn(
          'h-8 w-8 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur border border-slate-200 transition-colors',
          saved ? 'text-accent-600' : 'text-slate-400 hover:text-accent-600',
        )}
      >
        <Bookmark className={cn('h-4 w-4', saved && 'fill-accent-500 text-accent-500')} />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label="Saqlash"
      className={cn(
        'inline-flex items-center justify-center h-11 w-11 rounded-xl border transition-all btn-lift',
        saved
          ? 'bg-accent-50 border-accent-200 text-accent-600'
          : 'bg-white border-slate-200 text-slate-600 hover:border-accent-200 hover:text-accent-600',
      )}
    >
      <Bookmark className={cn('h-4 w-4', saved && 'fill-accent-500 text-accent-500')} />
    </button>
  );
}
