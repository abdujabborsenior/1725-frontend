'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  FileTextFill,
  Home,
  HomeFill,
  MessageCircle,
  MessageCircleFill,
  Rocket,
  RocketFill,
  User,
  UserFill,
} from '@/components/icons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { chatApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/components/icons';

/* iOS tab bar: faol band TO'LDIRILGAN belgi bilan, nofaol — konturli.
   Aynan shu ikkilik iOS'ning o'ziga xos "his"ini beradi. */
const ITEMS: {
  href: string;
  label: string;
  icon: LucideIcon;
  iconActive: LucideIcon;
  match: (p: string) => boolean;
}[] = [
  { href: '/', label: 'Asosiy', icon: Home, iconActive: HomeFill, match: (p) => p === '/' },
  {
    href: '/startups',
    label: 'Startaplar',
    icon: Rocket,
    iconActive: RocketFill,
    match: (p) => p.startsWith('/startups'),
  },
  {
    href: '/problems',
    label: 'Muammolar',
    icon: FileText,
    iconActive: FileTextFill,
    match: (p) => p.startsWith('/problems'),
  },
  {
    href: '/messages',
    label: 'Suhbat',
    icon: MessageCircle,
    iconActive: MessageCircleFill,
    match: (p) => p.startsWith('/messages'),
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: User,
    iconActive: UserFill,
    match: (p) => p.startsWith('/profile') || p.startsWith('/u/'),
  },
];

/** iOS Tab Bar — translucent material, 0.5px hairline, tint = systemBlue. */
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
      className="material-bar hairline-t fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {ITEMS.map(({ href, label, icon: Icon, iconActive: IconActive, match }) => {
          const active = match(pathname);
          const Glyph = active ? IconActive : Icon;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-[3px] pb-1.5 pt-2 transition-colors duration-150 ease-ios active:opacity-50',
                active ? 'text-accent-600' : 'text-slate-500',
              )}
            >
              <span className="relative">
                <Glyph className="h-[25px] w-[25px]" />
                {href === '/messages' && unread > 0 && (
                  <span className="absolute -right-2.5 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-rose-500 px-1 text-caption-2 font-semibold text-white ring-2 ring-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </span>
              <span className="text-caption-2 font-medium tracking-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
