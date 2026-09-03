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
import { navigateAfterAuthChange } from '@/lib/auth-navigation';
import { authApi, chatApi } from '@/lib/api';
import { Avatar } from '@/components/ui/avatar';
import { VerifiedBadge } from '@/components/social/verified-badge';
import { NotificationBell } from '@/components/layout/notification-bell';
import { SearchPalette, openSearchPalette } from '@/components/layout/search-palette';
import { AdaptiveNav, type NavItem } from '@/components/layout/adaptive-nav';
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
        'tappable hv-pop relative flex h-9 w-9 items-center justify-center rounded-full',
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
    navigateAfterAuthChange('/login');
  }

  const links = NAV_LINKS.filter((l) => !l.authOnly || token);

  // Yechim AI — navigatsiyadagi yagona belgili band: mahsulotning aqlli qismi
  // bir qarashda ajralib tursin. Ro'yxatning boshida turadi.
  const navItems: NavItem[] = [
    { href: '/ai', label: 'Yechim AI', icon: <YechimMark size={18} /> },
    ...links.map(({ href, label }) => ({ href, label })),
  ];

  return (
    <header className="material-bar hairline-b sticky top-0 z-40 w-full">
      {/* Navbar konteyneri sahifa kontentidan (max-w-6xl) KENGROQ: bu sirt
          elementi va unda logo + bandlar + amallar turadi. Bandlar esa mavjud
          joyga qarab `AdaptiveNav` bilan o'zi moslashadi. */}
      <div className="mx-auto flex h-[52px] max-w-7xl items-center gap-3 px-4 2xl:max-w-[1400px]">
        {/* Logo */}
        <Link href="/" className="hv-logo tappable flex shrink-0 items-center gap-2">
          <LogoMark className="h-[30px] w-[30px]" />
          <span className="text-title-3 font-semibold tracking-tight text-brand-900">
            MYMarkaz
          </span>
        </Link>

        {/*
          Desktop nav — sig'ganicha ko'rsatadi, qolganini «•••» menyusiga yig'adi.
          Qat'iy band ro'yxati o'rniga HAQIQIY o'lchov: band qo'shilganda ham
          (masalan to'lov bo'limi yoqilsa "Tariflar") navbar toshib ketmaydi.
        */}
        <AdaptiveNav items={navItems} pathname={pathname} />

        {/* Mobilda amallarni o'ngga suradigan bo'shliq (desktopda nav o'zi cho'ziladi) */}
        <div className="flex-1 xl:hidden" />

        {/* Desktop amallar */}
        <div className="hidden items-center gap-1.5 xl:flex">
          <button
            onClick={openSearchPalette}
            aria-label="Qidirish"
            className="ios-search tappable flex h-9 items-center gap-2 px-3 text-slate-500"
          >
            <Search className="h-4 w-4" />
            {/* "Qidirish" so'zi keng ekranda — tor desktopda ikonka + ⌘K
                o'zi tushunarli va navigatsiyaga joy bo'shatadi. */}
            <span className="hidden text-subhead 2xl:inline">Qidirish</span>
            <kbd className="rounded-md bg-white px-1.5 py-0.5 text-caption-2 font-medium text-slate-600 2xl:ml-2">
              ⌘K
            </kbd>
          </button>

          {/* Joylash CTA — guest ham ko'radi (bosganda register orqali qaytadi) */}
          <Link
            href="/startups/create"
            className="hv-sheen tappable ml-1 flex h-9 items-center gap-1 rounded-full bg-accent-600 pl-3 pr-4 text-subhead font-semibold text-white hover:shadow-[0_10px_24px_-12px_rgba(0,113,227,0.8)] active:bg-accent-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.6} /> Startap
          </Link>

          {token ? (
            <>
              <ChatLink />
              <NotificationBell />
              <Link href="/profile" aria-label="Profil" className="hv-avatar ml-0.5 shrink-0">
                <Avatar src={user?.avatarUrl} name={user?.fullName} size={30} />
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Chiqish"
                className="tappable hv-pop flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-600"
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
                className="tappable flex h-9 shrink-0 items-center whitespace-nowrap rounded-full bg-accent-50 px-4 text-subhead font-semibold text-accent-700 hover:bg-accent-100 active:bg-accent-200"
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
            className="tappable hv-pop flex h-9 w-9 items-center justify-center rounded-full text-slate-600"
          >
            <Search className="h-[21px] w-[21px]" />
          </button>
          {token && <ChatLink />}
          {token && <NotificationBell />}
          <button
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Menyu"
            aria-expanded={menuOpen}
            className="tappable hv-pop flex h-9 w-9 items-center justify-center rounded-full text-brand-900"
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
            {links.map(({ href, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className="ios-row"
                >
                  {/* Faol bo'lim mobil menyuda ham ko'rinadi (desktop bilan
                      izchil: brend tinti + qalinroq vazn) */}
                  <span
                    className={cn(
                      'flex-1 text-body',
                      active ? 'font-semibold text-accent-700' : 'text-brand-900',
                    )}
                  >
                    {label}
                  </span>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />}
                </Link>
              );
            })}
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
                <span className="flex min-w-0 flex-1 items-center gap-1 text-body text-brand-900">
                  <span className="truncate">
                    {user?.username ? `@${user.username}` : 'Profil'}
                  </span>
                  {user?.isVerified && <VerifiedBadge size={14} />}
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
