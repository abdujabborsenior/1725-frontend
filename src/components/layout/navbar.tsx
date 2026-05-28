'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, Plus, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { href: '/problems', label: 'Muammolar' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, clearAuth } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearAuth();
    toast.success('Tizimdan chiqdingiz');
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass border-b border-white/[0.06] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href={token ? '/problems' : '/login'} className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-brand group-hover:scale-105 transition-transform">
              <Zap className="h-4.5 w-4.5 text-white" fill="white" />
            </div>
            <span className="text-lg font-black text-white">StartupHub</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  pathname.startsWith(href)
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {token ? (
              <>
                <Link href="/problems/create">
                  <Button size="sm" variant="neon">
                    <Plus className="h-3.5 w-3.5" /> Muammo yuborish
                  </Button>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="h-6 w-6 rounded-lg bg-gradient-brand flex items-center justify-center text-[10px] font-bold text-white">
                    {user?.fullName?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-sm text-slate-200 max-w-[100px] truncate">{user?.fullName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Chiqish"
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
                  <Button size="sm">Ro&apos;yxatdan o&apos;tish</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(p => !p)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl glass border border-white/10 text-slate-300"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/[0.06] px-4 py-4 space-y-2 animate-slide-down">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                {label}
              </Link>
            ))}
            {token ? (
              <>
                <Link href="/problems/create" onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-medium text-neon-green hover:bg-neon-green/5 transition-all">
                  + Muammo yuborish
                </Link>
                <Link href="/profile" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                  <User className="h-4 w-4" /> Profil
                </Link>
                <button onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
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
      </div>
    </header>
  );
}
