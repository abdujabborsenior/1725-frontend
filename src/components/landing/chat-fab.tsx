'use client';

import Link from 'next/link';
import { MessageCircleFill } from '@/components/icons';
import { useAuthStore } from '@/store/auth.store';

/**
 * Suzuvchi chat tugmasi (home) — iOS'dagi doiraviy amal tugmasi: tint fon,
 * to'ldirilgan belgi, bosilganda kichrayadi. Halo/gradient/kengayuvchi yozuv
 * YO'Q (iOS'da bunday dekor ishlatilmaydi). Guest bossa register orqali
 * aynan chatga qaytadi (mavjud ?next= oqimi).
 */
export function ChatFab() {
  const { token } = useAuthStore();
  const href = token ? '/messages' : '/register?next=%2Fmessages';

  return (
    <Link
      href={href}
      aria-label="Suhbatni boshlash"
      className="group fixed right-4 z-40 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-8 md:right-8 motion-safe:animate-pop-in"
    >
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-white shadow-lift transition-[background-color,box-shadow,transform] duration-150 ease-ios group-hover:bg-accent-700 group-hover:shadow-glow-accent group-active:scale-95">
        <MessageCircleFill className="h-[26px] w-[26px]" />
      </span>
    </Link>
  );
}
