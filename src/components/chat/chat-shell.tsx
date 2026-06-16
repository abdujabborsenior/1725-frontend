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
    <div className="flex h-[calc(100vh-9rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft animate-fade-in">
      <aside className={cn('h-full w-full shrink-0 overflow-hidden md:flex md:w-80 md:border-r md:border-slate-200', activeId ? 'hidden' : 'flex')}>
        <ConversationList activeId={activeId} />
      </aside>
      <section className={cn('h-full min-w-0 flex-1 overflow-hidden bg-surface-soft', activeId ? 'flex' : 'hidden md:flex')}>
        {children}
      </section>
    </div>
  );
}
