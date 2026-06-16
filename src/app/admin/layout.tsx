'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Rocket, ArrowLeft, Menu, Shield, LogOut,
  Users, FileQuestion, Lightbulb, Star, MessageCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ROLE_LABEL } from '@/lib/constants';
import toast from 'react-hot-toast';

const ADMIN_ROLES = ['superadmin', 'analyzer'];

const NAV = [
  { href: '/admin', label: 'Boshqaruv paneli', icon: LayoutDashboard, exact: true, superadminOnly: false },
  { href: '/admin/startups', label: 'Startaplar', icon: Rocket, exact: false, superadminOnly: false },
  { href: '/admin/reviews', label: 'Sharhlar', icon: Star, exact: false, superadminOnly: false },
  { href: '/admin/problems', label: 'Muammolar', icon: FileQuestion, exact: false, superadminOnly: false },
  { href: '/admin/solutions', label: 'Yechimlar', icon: Lightbulb, exact: false, superadminOnly: false },
  { href: '/admin/users', label: 'Foydalanuvchilar', icon: Users, exact: false, superadminOnly: true },
  { href: '/admin/groups', label: 'Guruhlar', icon: MessageCircle, exact: false, superadminOnly: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, refreshToken, hasHydrated, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = !!user && ADMIN_ROLES.includes(user.role);
  const isSuperadmin = user?.role === 'superadmin';

  useEffect(() => {
    if (hasHydrated && !isAdmin) router.replace('/');
  }, [hasHydrated, isAdmin, router]);

  async function handleLogout() {
    try { await authApi.logout(refreshToken); } catch { /* ignore */ }
    clearAuth();
    router.push('/login');
  }

  if (!hasHydrated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-soft">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Shield className="h-8 w-8 animate-pulse" />
          <p className="text-sm">Tekshirilmoqda…</p>
        </div>
      </div>
    );
  }

  const SidebarContent = (
    <>
      <Link href="/admin" className="flex items-center gap-2.5 px-2 mb-8 group">
        <div className="h-9 w-9 rounded-xl bg-accent-500 flex items-center justify-center shadow-glow-accent">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-black text-white leading-tight">Admin Panel</p>
          <p className="text-[10px] text-slate-400">StartupHub</p>
        </div>
      </Link>

      <nav className="space-y-1 flex-1">
        {NAV.filter((n) => !n.superadminOnly || isSuperadmin).map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 pt-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Saytga qaytish
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="h-4 w-4" /> Chiqish
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2.5 px-2 py-3 rounded-xl bg-white/5">
        <div className="h-8 w-8 rounded-lg bg-accent-500 flex items-center justify-center text-xs font-bold text-white">
          {user?.fullName?.charAt(0).toUpperCase() ?? 'A'}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
          <p className="text-[10px] text-slate-400">{user ? ROLE_LABEL[user.role] : ''}</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-surface-soft">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-brand-900 p-4 z-40">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 flex flex-col bg-brand-900 p-4 animate-slide-down">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-14 flex items-center gap-3 px-4 bg-white/90 backdrop-blur border-b border-slate-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-brand-900"
            aria-label="Menyu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="font-black text-brand-900">Admin Panel</span>
        </header>

        <main className="p-4 md:p-8 max-w-6xl mx-auto animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
