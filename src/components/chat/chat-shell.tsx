'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConversationList } from './conversation-list';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

export function ChatShell({
  activeId,
  children,
}: {
  activeId?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && !token) router.replace('/login');
  }, [hasHydrated, token, router]);

  return (
    // Balandlik ota-layoutdan (h-dvh flex) keladi — sahifa scroll bo'lmaydi,
    // faqat ichki ro'yxat/xabarlar scroll (Telegram). Mobil full-bleed, desktop karta.
    //
    // RAMKA (2026-08-31): desktopda oyna `shadow-card` (0 1px 2px / 4%) bilan
    // chizilardi — #F2F2F7 sahifa fonida u amalda ko'rinmasdi va o'ng panel
    // (fon rangi ham AYNAN #F2F2F7 edi) sahifaga qo'shilib ketardi. Endi
    // `surface-window`: 1px hairline halqa + haqiqiy ko'tarilish soyasi →
    // oyna ikkala holatda ham (suhbat tanlanmagan va ochiq) aniq ajraladi.
    <div className="flex min-h-0 flex-1 overflow-hidden bg-white surface-window-md md:rounded-[22px]">
      <aside className={cn('h-full w-full shrink-0 overflow-hidden md:flex md:w-[21rem] md:border-r md:border-separator/50', activeId ? 'hidden' : 'flex')}>
        <ConversationList activeId={activeId} />
      </aside>
      <section className={cn('h-full min-w-0 flex-1 overflow-hidden bg-surface-soft', activeId ? 'flex' : 'hidden md:flex')}>
        {children}
      </section>
    </div>
  );
}
