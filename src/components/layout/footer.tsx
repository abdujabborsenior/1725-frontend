import Link from 'next/link';
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
      { label: 'Muammo qoldirish', href: '/problems/create' },
    ],
  },
];

/**
 * Footer — Apple uslubida: tinch kulrang sirt, mayda tipografiya, hairline
 * ajratkichlar. Dekorativ gradient/nur YO'Q. Mobilda ham ko'rinadi (pastki
 * tab bar ostida qolmasligi uchun qo'shimcha padding).
 */
export function Footer() {
  return (
    <footer className="hairline-t mt-10 bg-surface-soft pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-9 px-4 py-10 md:gap-8 md:px-6 md:py-12 lg:grid-cols-5">
        {/* Brand */}
        <div className="col-span-2">
          <Link href="/" className="tappable inline-flex items-center gap-2">
            <LogoMark className="h-7 w-7" />
            <span className="text-callout font-semibold tracking-tight text-brand-900">
              MYMarkaz
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-footnote leading-relaxed text-slate-500">
            G‘oyadan startapgacha — birgalikda. O‘quvchilar, talabalar va kreativ yoshlar uchun
            muammoni yechib, jamoa qurib, mahsulot yaratish maydoni.
          </p>
        </div>

        {/* Havola ustunlari */}
        {COLS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="mb-2.5 text-footnote font-semibold text-brand-900">{col.title}</h2>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-footnote text-slate-500 transition-colors duration-150 hover:text-accent-700"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="hairline-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-1.5 px-4 py-5 text-caption-1 text-slate-500 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <p>© {new Date().getFullYear()} MYMarkaz · Barcha huquqlar himoyalangan</p>
          <p>O‘zbekistonda yoshlar uchun yaratildi</p>
        </div>
      </div>
    </footer>
  );
}
