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
    <div className="flex min-h-0 flex-1 overflow-hidden bg-white md:rounded-3xl md:border md:border-slate-200 md:shadow-soft">
      <aside className={cn('h-full w-full shrink-0 overflow-hidden md:flex md:w-80 md:border-r md:border-slate-200', activeId ? 'hidden' : 'flex')}>
        <ConversationList activeId={activeId} />
      </aside>
      <section className={cn('h-full min-w-0 flex-1 overflow-hidden bg-surface-soft', activeId ? 'flex' : 'hidden md:flex')}>
        {children}
      </section>
    </div>
  );
}
