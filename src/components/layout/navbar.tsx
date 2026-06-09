'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, Plus, User, LogOut, Menu, X, LayoutDashboard, Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/layout/notification-bell';
import { SearchPalette, openSearchPalette } from '@/components/layout/search-palette';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { href: '/startups',  label: 'Startaplar' },
  { href: '/problems',  label: 'Muammolar' },
  { href: '/solutions', label: 'Yechimlar' },
];

const ADMIN_ROLES = ['superadmin', 'analyzer'];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, refreshToken, clearAuth } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role);

  async function handleLogout() {
    try { await authApi.logout(refreshToken); } catch { /* ignore */ }
    clearAuth();
    toast.success('Tizimdan chiqdingiz');
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-brand-900 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Zap className="h-4 w-4 text-accent-400" fill="currentColor" />
          </div>
          <span className="text-lg font-black text-brand-900">StartupHub</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
                pathname.startsWith(href)
                  ? 'text-brand-900 bg-slate-100'
                  : 'text-slate-600 hover:text-brand-900 hover:bg-slate-50',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={openSearchPalette}
            className="flex items-center gap-2 h-9 pl-3 pr-2 rounded-lg border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Qidirish</span>
            <kbd className="ml-1 text-[10px] font-semibold bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 border border-slate-200">⌘K</kbd>
          </button>
          {token ? (
            <>
              {isAdmin && (
                <Link href="/admin">
                  <Button size="sm" variant="primary">
                    <LayoutDashboard className="h-3.5 w-3.5" /> Admin
                  </Button>
                </Link>
              )}
              <Link href="/problems/create">
                <Button size="sm" variant="accent">
                  <Plus className="h-3.5 w-3.5" /> Muammo yuborish
                </Button>
              </Link>
              <NotificationBell />
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all"
              >
                <div className="h-6 w-6 rounded-md bg-brand-900 flex items-center justify-center text-[10px] font-bold text-white">
                  {user?.fullName?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <span className="text-sm font-medium text-brand-900 max-w-[100px] truncate">{user?.fullName}</span>
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
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-brand-900 hover:bg-slate-50 transition-all">
              {label}
            </Link>
          ))}
          {token ? (
            <>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-brand-900 bg-slate-100 hover:bg-slate-200 transition-all">
                  <LayoutDashboard className="h-4 w-4" /> Admin panel
                </Link>
              )}
              <Link href="/problems/create" onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-accent-700 bg-accent-50 hover:bg-accent-100 transition-all">
                + Muammo yuborish
              </Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all">
                <User className="h-4 w-4" /> Profil
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
