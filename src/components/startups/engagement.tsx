'use client';

import { useCallback } from 'react';
import { Heart, HeartFill, Bookmark, BookmarkFill } from '@/components/icons';
import { startupsApi } from '@/lib/api';
import { useToggleAction } from '@/lib/use-toggle-action';
import { cn } from '@/lib/utils';
import type { Startup } from '@/types';
import toast from 'react-hot-toast';

type Variant = 'card' | 'detail';

/**
 * Yoqtirish tugmasi — ro'yxatda ham (`card`), detal sahifada ham (`detail`)
 * bir xil ishonchli mantiq bilan: `useToggleAction` niyatni serverga yuboradi
 * (idempotent), tez ketma-ket bosishni yo'qotmaydi va natijani butun React
 * Query keshiga yozadi.
 *
 * `suppressHydrationWarning` — sanoq JONLI server qiymati: SSR HTML kesh'dan
 * (30s) kelishi, klient esa yangi javobni olishi mumkin. React 18 gidratsiyasi
 * uzilishi mumkin bo'lgani uchun bu "text content did not match" beradi
 * (klientniki — to'g'risi). Qiymat tabiiy o'zgaruvchan, bu aynan shu bayroq
 * mo'ljallangan holat; boshqa hech narsa yashirilmaydi (bayroq faqat shu
 * elementga tegishli).
 */
export function LikeButton({
  startup,
  variant = 'detail',
  onChange,
}: {
  startup: Startup;
  variant?: Variant;
  onChange?: (liked: boolean, count: number) => void;
}) {
  const commit = useCallback(
    async (next: boolean) => {
      const res = await startupsApi.toggleLike(startup.id, next);
      return { on: res.liked, count: res.likeCount };
    },
    [startup.id],
  );

  const {
    on: liked,
    count,
    pending,
    toggle,
  } = useToggleAction({
    id: startup.id,
    on: !!startup.likedByMe,
    count: startup.likeCount ?? 0,
    commit,
    fields: { on: 'likedByMe', count: 'likeCount' },
    onChange,
  });

  const label = liked ? `Yoqtirishni olib tashlash — ${count}` : `Yoqtirish — ${count}`;

  /* Karta varianti — meta qatoridagi ixcham amal, lekin haqiqiy 36px tegish
     maydoni bilan. Bosilganda yurak "urib" qo'yadi: ro'yxatda boshqa tasdiq
     (sahifa o'zgarishi, toast) yo'q — javob shu. */
  if (variant === 'card') {
    return (
      <button
        onClick={toggle}
        suppressHydrationWarning
        aria-pressed={liked}
        aria-busy={pending}
        aria-label={label}
        title={label}
        className={cn(
          'tappable relative z-10 -mr-1 inline-flex h-9 items-center gap-1.5 rounded-full px-2.5',
          'text-footnote font-medium tabular-nums transition-colors duration-150 ease-ios',
          liked
            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
            : 'hv-heart text-slate-500 hover:bg-rose-50 hover:text-rose-600',
        )}
      >
        {liked ? (
          <HeartFill key="on" className="heart-pop h-[17px] w-[17px]" />
        ) : (
          <Heart className="h-[17px] w-[17px]" />
        )}
        {count}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      suppressHydrationWarning
      aria-pressed={liked}
      aria-busy={pending}
      aria-label={label}
      className={cn(
        'tappable inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-subhead font-medium tabular-nums transition-colors duration-150 ease-ios',
        liked
          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
          : 'hv-heart bg-fill-tertiary text-slate-600 hover:bg-rose-50 hover:text-rose-600',
      )}
    >
      {liked ? (
        <HeartFill key="on" className="heart-pop h-[17px] w-[17px]" />
      ) : (
        <Heart className="h-[17px] w-[17px]" />
      )}
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
  const commit = useCallback(
    async (next: boolean) => {
      const res = await startupsApi.toggleBookmark(startup.id, next);
      // Saqlash "ko'rinmas" amal (sanoq chiqmaydi) — qisqa banner bilan tasdiq.
      toast.success(res.bookmarked ? 'Saqlandi' : 'Saqlanganlardan olib tashlandi');
      return { on: res.bookmarked };
    },
    [startup.id],
  );

  const { on: saved, pending, toggle } = useToggleAction({
    id: startup.id,
    on: !!startup.bookmarkedByMe,
    commit,
    fields: { on: 'bookmarkedByMe' },
    onChange: (v) => onChange?.(v),
  });

  const label = saved ? 'Saqlanganlardan olib tashlash' : 'Keyinroq uchun saqlash';

  if (variant === 'card') {
    return (
      <button
        onClick={toggle}
        aria-pressed={saved}
        aria-busy={pending}
        aria-label={label}
        title={label}
        className={cn(
          'material-thick tappable flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150',
          saved ? 'text-accent-600' : 'text-slate-600 hover:text-accent-600',
        )}
      >
        {saved ? (
          <BookmarkFill key="on" className="heart-pop h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={saved}
      aria-busy={pending}
      aria-label={label}
      className={cn(
        'tappable inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150 ease-ios',
        saved
          ? 'bg-accent-50 text-accent-600'
          : 'bg-fill-tertiary text-slate-600 hover:bg-accent-50 hover:text-accent-700',
      )}
    >
      {saved ? (
        <BookmarkFill key="on" className="heart-pop h-[17px] w-[17px]" />
      ) : (
        <Bookmark className="h-[17px] w-[17px]" />
      )}
    </button>
  );
}
