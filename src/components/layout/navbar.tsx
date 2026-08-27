'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, LogOut, Menu, X, Search, MessageCircle } from '@/components/icons';
import { LogoMark } from '@/components/brand/logo-mark';
import { YechimMark } from '@/components/ai/yechim-mark';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { authApi, chatApi } from '@/lib/api';
import { Avatar } from '@/components/ui/avatar';
import { NotificationBell } from '@/components/layout/notification-bell';
import { SearchPalette, openSearchPalette } from '@/components/layout/search-palette';
import toast from 'react-hot-toast';
import { BILLING_ENABLED } from '@/lib/billing';

// Asosiy navigatsiya. "Ovoz berish" ATAYLAB bu yerda emas — ikkilamchi
// funksiya sifatida footer va bosh sahifaning quyi bo'limida qoladi.
const NAV_LINKS: { href: string; label: string; authOnly?: boolean }[] = [
  { href: '/startups', label: 'Startaplar' },
  { href: '/leaderboard', label: 'Reyting' },
  { href: '/problems', label: 'Muammolar' },
  // Bozor xaritasi — ommaviy: platformaning "nima uchun bu yerdaman"
  // savoliga eng kuchli javobi mehmonlarga ham ochiq turishi kerak.
  { href: '/market', label: 'Bozor' },
  // Shaxsiy sahifa — faqat kirgan foydalanuvchiga ko'rinadi
  { href: '/solutions', label: 'Yechimlarim', authOnly: true },
  { href: '/discover', label: 'Hamjamiyat' },
  // Obuna/to'lov bo'limi VAQTINCHA o'chiq: flag `false` bo'lganda band
  // massivga umuman qo'shilmaydi (navbarда ham, mobil menyuda ham yo'q).
  ...(BILLING_ENABLED ? [{ href: '/pricing', label: 'Tariflar' }] : []),
];

/** iOS badge — nav ikonkasi ustidagi qizil hisob (systemRed). */
function CountBadge({ count, floating }: { count: number; floating?: boolean }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        'flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-caption-2 font-semibold text-white',
        floating && 'absolute -right-1 -top-1 ring-2 ring-white',
      )}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}

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
      <Link href="/messages" className="ios-row">
        <MessageCircle className="h-[22px] w-[22px] text-accent-600" />
        <span className="flex-1 text-body text-brand-900">Suhbatlar</span>
        <CountBadge count={count} />
      </Link>
    );
  }

  return (
    <Link
      href="/messages"
      aria-label="Suhbatlar"
      className={cn(
        'tappable relative flex h-9 w-9 items-center justify-center rounded-full',
        active ? 'text-accent-600' : 'text-slate-600',
      )}
    >
      <MessageCircle className="h-[22px] w-[22px]" />
      <CountBadge count={count} floating />
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, refreshToken, clearAuth } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await authApi.logout(refreshToken);
    } catch {
      /* ignore */
    }
    // socket.io-client faqat shu yerda kerak — dinamik import uni har sahifa
    // bundle'idan chiqarib, chat marshrutlarigagina yuklatadi
    try {
      (await import('@/lib/socket')).disconnectSocket();
    } catch {
      /* ignore */
    }
    clearAuth();
    toast.success('Tizimdan chiqdingiz');
    router.push('/login');
  }

  const links = NAV_LINKS.filter((l) => !l.authOnly || token);

  return (
    <header className="material-bar hairline-b sticky top-0 z-40 w-full">
      <div className="mx-auto flex h-[52px] max-w-6xl items-center gap-3 px-4">
        {/* Logo */}
        <Link href="/" className="tappable flex shrink-0 items-center gap-2">
          <LogoMark className="h-[30px] w-[30px]" />
          <span className="text-title-3 font-semibold tracking-tight text-brand-900">
            MYMarkaz
          </span>
        </Link>

        {/* Desktop nav — iOS segment uslubidagi yumshoq faol holat */}
        <nav className="ml-2 hidden items-center gap-0.5 xl:flex">
          {/* Yechim AI — navigatsiyadagi yagona belgili band: mahsulotning
              aqlli qismi bir qarashda ajralib tursin. */}
          <Link
            href="/ai"
            aria-label="Yechim AI"
            className={cn(
              'flex items-center gap-1.5 whitespace-nowrap rounded-full py-1.5 pl-2 pr-3 text-subhead transition-colors duration-150 ease-ios',
              pathname.startsWith('/ai')
                ? 'bg-fill-tertiary font-semibold text-brand-900'
                : 'font-medium text-slate-500 hover:text-brand-900',
            )}
          >
            <YechimMark size={18} />
            <span>Yechim AI</span>
          </Link>
          {links.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-1.5 text-subhead transition-colors duration-150 ease-ios',
                  active
                    ? 'bg-fill-tertiary font-semibold text-brand-900'
                    : 'font-medium text-slate-500 hover:text-brand-900',
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* Desktop amallar */}
        <div className="hidden items-center gap-1.5 xl:flex">
          <button
            onClick={openSearchPalette}
            aria-label="Qidirish"
            className="ios-search tappable flex h-9 items-center gap-2 px-3 text-slate-500"
          >
            <Search className="h-4 w-4" />
            <span className="text-subhead">Qidirish</span>
            <kbd className="ml-2 rounded-md bg-white/70 px-1.5 py-0.5 text-caption-2 font-medium text-slate-500">
              ⌘K
            </kbd>
          </button>

          {/* Joylash CTA — guest ham ko'radi (bosganda register orqali qaytadi) */}
          <Link
            href="/startups/create"
            className="tappable ml-1 flex h-9 items-center gap-1 rounded-full bg-accent-600 pl-3 pr-4 text-subhead font-semibold text-white active:bg-accent-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.6} /> Startap
          </Link>

          {token ? (
            <>
              <ChatLink />
              <NotificationBell />
              <Link href="/profile" aria-label="Profil" className="tappable ml-0.5 shrink-0">
                <Avatar src={user?.avatarUrl} name={user?.fullName} size={30} />
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Chiqish"
                className="tappable flex h-9 w-9 items-center justify-center rounded-full text-slate-400"
              >
                <LogOut className="h-[19px] w-[19px]" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="tappable px-3 py-1.5 text-subhead font-medium text-accent-700"
              >
                Kirish
              </Link>
              <Link
                href="/register"
                className="tappable flex h-9 shrink-0 items-center whitespace-nowrap rounded-full bg-fill-tertiary px-4 text-subhead font-semibold text-brand-900 active:bg-fill"
              >
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </>
          )}
        </div>

        {/* Mobil amallar */}
        <div className="flex items-center gap-0.5 xl:hidden">
          <button
            onClick={openSearchPalette}
            aria-label="Qidirish"
            className="tappable flex h-9 w-9 items-center justify-center rounded-full text-slate-600"
          >
            <Search className="h-[21px] w-[21px]" />
          </button>
          {token && <ChatLink />}
          {token && <NotificationBell />}
          <button
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Menyu"
            aria-expanded={menuOpen}
            className="tappable flex h-9 w-9 items-center justify-center rounded-full text-brand-900"
          >
            {menuOpen ? <X className="h-[22px] w-[22px]" /> : <Menu className="h-[22px] w-[22px]" />}
          </button>
        </div>
      </div>

      {/* Mobil menyu — iOS inset grouped ro'yxat */}
      {menuOpen && (
        <div className="hairline-t animate-slide-down bg-surface-soft px-4 py-4 xl:hidden">
          <div className="ios-list" onClick={() => setMenuOpen(false)}>
            {/* Yechim AI — ro'yxatning boshida, belgisi bilan */}
            <Link href="/ai" className="ios-row">
              <YechimMark size={22} />
              <span className="flex-1 text-body text-brand-900">Yechim AI</span>
            </Link>
            {links.map(({ href, label }) => (
              <Link key={href} href={href} className="ios-row">
                <span className="flex-1 text-body text-brand-900">{label}</span>
              </Link>
            ))}
          </div>

          <div className="ios-list mt-4" onClick={() => setMenuOpen(false)}>
            {/* Joylash CTA'lari — guest ham ko'radi (register orqali qaytadi) */}
            <Link href="/startups/create" className="ios-row">
              <Plus className="h-[21px] w-[21px] text-accent-600" strokeWidth={2.4} />
              <span className="flex-1 text-body text-accent-700">Startap joylash</span>
            </Link>
            <Link href="/problems/create" className="ios-row">
              <Plus className="h-[21px] w-[21px] text-accent-600" strokeWidth={2.4} />
              <span className="flex-1 text-body text-accent-700">Muammo qoldirish</span>
            </Link>
            {token && <ChatLink mobile />}
          </div>

          {token ? (
            <div className="ios-list mt-4">
              <Link href="/profile" className="ios-row" onClick={() => setMenuOpen(false)}>
                <Avatar src={user?.avatarUrl} name={user?.fullName} size={28} />
                <span className="flex-1 truncate text-body text-brand-900">
                  {user?.username ? `@${user.username}` : 'Profil'}
                </span>
              </Link>
              <button onClick={handleLogout} className="ios-row w-full text-left">
                <span className="flex-1 text-body text-rose-600">Chiqish</span>
              </button>
            </div>
          ) : (
            <div className="ios-list mt-4" onClick={() => setMenuOpen(false)}>
              <Link href="/login" className="ios-row">
                <span className="flex-1 text-body text-accent-700">Kirish</span>
              </Link>
              <Link href="/register" className="ios-row">
                <span className="flex-1 text-body text-accent-700">Ro&apos;yxatdan o&apos;tish</span>
              </Link>
            </div>
          )}
        </div>
      )}

      <SearchPalette />
    </header>
  );
}
