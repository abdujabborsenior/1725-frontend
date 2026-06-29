import Link from 'next/link';
import { Rocket, ArrowUpRight, Heart } from 'lucide-react';

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

export function Footer() {
  return (
    <footer className="relative mt-10 hidden overflow-hidden border-t border-slate-200 bg-white/70 md:block">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/50 to-transparent" />
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 lg:grid-cols-5">
        {/* Brand */}
        <div className="col-span-2">
          <Link href="/" className="group inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-emerald-iris shadow-glow-accent transition-transform group-hover:scale-105">
              <Rocket className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-brand-900">
              Startup<span className="gradient-text-emerald-iris">Hub</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            G‘oyadan startapgacha — birgalikda. O‘quvchilar, talabalar va kreativ yoshlar uchun
            muammoni yechib, jamoa qurib, mahsulot yaratish maydoni.
          </p>
        </div>

        {/* Link columns */}
        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-900">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-accent-700"
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

      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} StartupHub · Barcha huquqlar himoyalangan</p>
          <p className="inline-flex items-center gap-1.5">
            O‘zbekistonda yoshlar uchun yaratildi
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
