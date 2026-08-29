'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Heart, HeartFill, Bookmark, BookmarkFill } from '@/components/icons';
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

/**
 * Faqat SON — ro'yxat/kartochkalarda ishlatiladi.
 * Yoqtirish amali ataylab faqat startap DETAL sahifasida mavjud: ro'yxatda
 * tasodifiy bosish va toggle bo'roni bo'lmaydi, karta esa sof navigatsiya
 * elementi bo'lib qoladi.
 */
export function LikeCount({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-caption-1 tabular-nums text-slate-500">
      <Heart className="h-3.5 w-3.5" aria-hidden />
      {count}
    </span>
  );
}

export function LikeButton({
  startup,
  onChange,
}: {
  startup: Startup;
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

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={`Yoqtirish — ${count}`}
      className={cn(
        'tappable inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-subhead font-medium tabular-nums transition-colors duration-150 ease-ios',
        liked ? 'bg-rose-50 text-rose-600' : 'bg-fill-tertiary text-slate-600',
      )}
    >
      {liked ? <HeartFill className="h-[17px] w-[17px]" /> : <Heart className="h-[17px] w-[17px]" />}
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
          'material-thick flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150 hover:text-accent-600',
          saved ? 'text-accent-600' : 'text-slate-500',
        )}
      >
        {saved ? (
          <BookmarkFill className="h-[15px] w-[15px]" />
        ) : (
          <Bookmark className="h-[15px] w-[15px]" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label="Saqlash"
      className={cn(
        'tappable inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150 ease-ios',
        saved ? 'bg-accent-50 text-accent-600' : 'bg-fill-tertiary text-slate-600',
      )}
    >
      {saved ? (
        <BookmarkFill className="h-[17px] w-[17px]" />
      ) : (
        <Bookmark className="h-[17px] w-[17px]" />
      )}
    </button>
  );
}
