'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

/**
 * Home sahifadagi suzuvchi chat tugmasi — o'ng-past burchak signature elementi.
 * Shaffof navy glass sirt + sekin "nafas oluvchi" halo (jonli suhbat signali) +
 * desktop hover'da yozuvga kengayuvchi pill. Harakat faqat transform/opacity
 * (arzon) va `motion-safe` — reduced-motion'da to'liq tinch. Guest bossa
 * register orqali aynan chatga qaytadi (mavjud ?next= oqimi).
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
      {/* Nafas oluvchi halo — tugma orqasida kengayib so'nadi */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-accent-400/50 motion-safe:animate-fab-ring"
      />
      <span className="relative flex h-14 items-center rounded-full border border-white/15 bg-brand-900/85 px-[15px] text-white shadow-lift backdrop-blur-md transition-all duration-200 group-hover:bg-brand-900 group-hover:shadow-glow-accent group-active:scale-95">
        <span className="relative flex items-center justify-center">
          <MessageCircle className="h-6 w-6 text-accent-400" />
          {/* Jonli (live) nuqta */}
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent-400 ring-2 ring-brand-900" />
        </span>
        {/* Desktop hover'da ochiluvchi yozuv */}
        <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-200 group-hover:ml-2.5 group-hover:max-w-[180px] group-hover:opacity-100 md:block">
          Suhbatni boshlash
        </span>
      </span>
    </Link>
  );
}
