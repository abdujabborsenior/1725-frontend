'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Rocket, BarChart3, MessageCircle, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { chatApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const ITEMS: { href: string; label: string; icon: LucideIcon; match: (p: string) => boolean }[] = [
  { href: '/', label: 'Asosiy', icon: Home, match: (p) => p === '/' },
  { href: '/startups', label: 'Startaplar', icon: Rocket, match: (p) => p.startsWith('/startups') },
  { href: '/polls', label: 'Ovoz', icon: BarChart3, match: (p) => p.startsWith('/polls') },
  { href: '/messages', label: 'Suhbat', icon: MessageCircle, match: (p) => p.startsWith('/messages') },
  { href: '/profile', label: 'Profil', icon: User, match: (p) => p.startsWith('/profile') || p.startsWith('/u/') },
];

/** Telegram-uslubidagi mobil pastki navigatsiya (faqat kirgan foydalanuvchilar). */
export function BottomNav() {
  const pathname = usePathname();
  const { token } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['chat-unread'],
    queryFn: () => chatApi.unreadCount(),
    enabled: !!token,
    refetchInterval: 20_000,
  });
  const unread = data?.count ?? 0;

  if (!token) return null;
  // Chat ichida (suhbat ochiq) pastki nav ekranni egallamasin
  if (/^\/messages\/.+/.test(pathname)) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 glass border-t border-slate-200/70 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors',
                active ? 'text-accent-600' : 'text-slate-400 hover:text-brand-900',
              )}
            >
              <span className="relative">
                <Icon className={cn('h-[22px] w-[22px] transition-transform', active && 'scale-110')} />
                {href === '/messages' && unread > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-700 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </span>
              {label}
              {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-accent-500" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
