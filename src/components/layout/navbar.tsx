'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Plus, LogOut, Menu, X, Search, MessageCircle,
} from 'lucide-react';
import { LogoMark } from '@/components/brand/logo-mark';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { authApi, chatApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { NotificationBell } from '@/components/layout/notification-bell';
import { SearchPalette, openSearchPalette } from '@/components/layout/search-palette';
import toast from 'react-hot-toast';

const NAV_LINKS: { href: string; label: string; authOnly?: boolean }[] = [
  { href: '/startups',    label: 'Startaplar' },
  { href: '/leaderboard', label: 'Reyting' },
  { href: '/polls',       label: 'Ovoz berish' },
  { href: '/problems',    label: 'Muammolar' },
  // Shaxsiy sahifa — faqat kirgan foydalanuvchiga ko'rinadi
  { href: '/solutions',   label: 'Yechimlarim', authOnly: true },
  { href: '/discover',    label: 'Hamjamiyat' },
];

function ChatLink({ mobile }: { mobile?: boolean }) {
  const { token } = useAuthStore();
  const pathname = usePathname();
  const { data } = useQuery({
    queryKey: ['chat-unread'],
    queryFn: () => chatApi.unreadCount(),
    enabled: !!token,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });
  const count = data?.count ?? 0;
  const active = pathname.startsWith('/messages');

  if (mobile) {
    return (
      <Link
        href="/messages"
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <MessageCircle className="h-4 w-4" /> Suhbatlar
        {count > 0 && (
          <span className="ml-auto min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-accent-700 text-white text-[10px] font-bold">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href="/messages"
      aria-label="Suhbatlar"
      className={cn(
        'relative h-9 w-9 flex items-center justify-center rounded-lg transition-all',
        active ? 'text-brand-900 bg-slate-100' : 'text-slate-500 hover:text-brand-900 hover:bg-slate-100',
      )}
    >
      <MessageCircle className="h-[18px] w-[18px]" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-accent-700 text-white text-[10px] font-bold ring-2 ring-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, refreshToken, clearAuth } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try { await authApi.logout(refreshToken); } catch { /* ignore */ }
    // socket.io-client faqat shu yerda kerak — dinamik import uni har sahifa
    // bundle'idan chiqarib, chat marshrutlarigagina yuklatadi
    try { (await import('@/lib/socket')).disconnectSocket(); } catch { /* ignore */ }
    clearAuth();
    toast.success('Tizimdan chiqdingiz');
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/70">
      {/* Signature gradient hairline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-400/50 to-transparent" />
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <LogoMark className="h-9 w-9 transition-transform group-hover:scale-105" />
          <span className="text-lg font-black tracking-tight text-brand-900">
            MY<span className="gradient-text-emerald-iris">Markaz</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.filter((l) => !l.authOnly || token).map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative whitespace-nowrap px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
                  active
                    ? 'text-brand-900'
                    : 'text-slate-600 hover:text-brand-900 hover:bg-slate-50',
                )}
              >
                {label}
                {active && (
                  <span className="absolute inset-x-3.5 -bottom-px h-0.5 rounded-full bg-accent-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          {token ? (
            <button
              onClick={openSearchPalette}
              className="flex items-center gap-2 h-9 pl-3 pr-2 rounded-lg border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">Qidirish</span>
              <kbd className="ml-1 text-[10px] font-semibold bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 border border-slate-200">⌘K</kbd>
            </button>
          ) : (
            <button
              onClick={openSearchPalette}
              aria-label="Qidirish"
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
          {/* Joylash CTA — guest ham ko'radi (bosganда register orqali qaytadi) */}
          <Link href="/startups/create">
            <Button size="sm" variant="accent">
              <Plus className="h-3.5 w-3.5" /> Startap
            </Button>
          </Link>
          {token ? (
            <>
              <Link href="/problems/create" className="hidden lg:block">
                <Button size="sm" variant="outline">
                  <Plus className="h-3.5 w-3.5" /> Muammo
                </Button>
              </Link>
              <ChatLink />
              <NotificationBell />
              <Link
                href="/profile"
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <Avatar src={user?.avatarUrl} name={user?.fullName} size={28} />
                <span className="text-sm font-semibold text-brand-900 max-w-[110px] truncate">
                  {user?.username ? `@${user.username}` : user?.fullName}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Chiqish"
                className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost">Kirish</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="primary">Ro&apos;yxatdan o&apos;tish</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="md:hidden flex items-center gap-1.5">
          <button
            onClick={openSearchPalette}
            aria-label="Qidirish"
            className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-brand-900 hover:bg-slate-100 transition-all"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          {token && <ChatLink />}
          {token && <NotificationBell />}
          <button
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Menyu"
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-brand-900"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 px-4 py-4 space-y-2 bg-white animate-slide-down">
          {NAV_LINKS.filter((l) => !l.authOnly || token).map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-brand-900 hover:bg-slate-50 transition-all">
              {label}
            </Link>
          ))}
          {/* Joylash CTA'lari — guest ham ko'radi (register orqali qaytadi) */}
          <Link href="/startups/create" onClick={() => setMenuOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-accent-700 bg-accent-50 hover:bg-accent-100 transition-all">
            + Startap joylash
          </Link>
          <Link href="/problems/create" onClick={() => setMenuOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all">
            + Muammo qoldirish
          </Link>
          {token ? (
            <>
              <ChatLink mobile />
              <Link href="/profile" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all">
                <Avatar src={user?.avatarUrl} name={user?.fullName} size={28} />
                {user?.username ? `@${user.username}` : 'Profil'}
              </Link>
              <button onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all">
                Chiqish
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link href="/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" fullWidth size="sm">Kirish</Button>
              </Link>
              <Link href="/register" className="flex-1" onClick={() => setMenuOpen(false)}>
                <Button fullWidth size="sm">Ro&apos;yxatdan o&apos;tish</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      <SearchPalette />
    </header>
  );
}
