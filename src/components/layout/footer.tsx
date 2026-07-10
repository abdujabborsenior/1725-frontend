import Link from 'next/link';
import { ArrowUpRight, Heart } from 'lucide-react';
import { LogoMark } from '@/components/brand/logo-mark';

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Platforma',
    links: [
      { label: 'Startaplar vitrinasi', href: '/startups' },
      { label: 'Top startaplar', href: '/leaderboard' },
      { label: 'Muammolar', href: '/problems' },
      { label: 'Ovoz berish', href: '/polls' },
      { label: 'Yechimlarim', href: '/solutions' },
    ],
  },
  {
    title: 'Hamjamiyat',
    links: [
      { label: 'Odamlarni kashf etish', href: '/discover' },
      { label: 'Guruhlar', href: '/discover' },
      { label: 'Suhbatlar', href: '/messages' },
      { label: 'Profil', href: '/profile' },
    ],
  },
  {
    title: 'Boshlash',
    links: [
      { label: 'Startap nima?', href: '/#startap-nima' },
      { label: 'Ro‘yxatdan o‘tish', href: '/register' },
      { label: 'Kirish', href: '/login' },
      { label: 'Muammo yuborish', href: '/problems/create' },
    ],
  },
];

/**
 * Footer — mobil va desktopда bir xil ko'rinadi (2026-07-10: avval `hidden
 * md:block` edi — mobilда umuman yo'q edi). Sirt yumshoq emerald gradient bilan
 * boyitilgan; mobilда fixed bottom-nav ostida qolmasligi uchun pastki padding.
 */
export function Footer() {
  return (
    <footer className="relative mt-10 overflow-hidden border-t border-accent-100/80 bg-gradient-to-b from-white to-accent-50/70 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      {/* Signature emerald hairline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent" />
      {/* Pastki yumshoq emerald nur — rang uyg'unligi, shovqinsiz */}
      <div className="pointer-events-none absolute -bottom-28 left-1/2 h-56 w-[38rem] -translate-x-1/2 rounded-full bg-accent-400/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-10 md:gap-8 md:px-6 md:py-12 lg:grid-cols-5">
        {/* Brand */}
        <div className="col-span-2">
          <Link href="/" className="group inline-flex items-center gap-2.5">
            <LogoMark className="h-9 w-9 transition-transform group-hover:scale-105" />
            <span className="text-lg font-black tracking-tight text-brand-900">
              MY<span className="gradient-text-emerald-iris">Markaz</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
            G‘oyadan startapgacha — birgalikda. O‘quvchilar, talabalar va kreativ yoshlar uchun
            muammoni yechib, jamoa qurib, mahsulot yaratish maydoni.
          </p>
        </div>

        {/* Link columns */}
        {COLS.map((col) => (
          <div key={col.title}>
            <h2 className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-700">
              <span className="h-1 w-1 rounded-full bg-accent-500" aria-hidden />
              {col.title}
            </h2>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-1 text-sm text-slate-600 transition-colors hover:text-accent-700"
                  >
                    {l.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative border-t border-accent-100/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row md:px-6">
          <p>© {new Date().getFullYear()} MYMarkaz · Barcha huquqlar himoyalangan</p>
          <p className="inline-flex items-center gap-1.5">
            O‘zbekistonda yoshlar uchun yaratildi
            <Heart className="h-3.5 w-3.5 fill-accent-500 text-accent-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
