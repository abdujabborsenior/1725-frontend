'use client';

import Link from 'next/link';
import { Lightbulb, Rocket, Trophy } from '@/components/icons';
import { LogoMark } from '@/components/brand/logo-mark';
import { cn } from '@/lib/utils';

/* ── Chap brend paneli (faqat lg+) ──────────────────────────────
   iOS/Apple ritmi: tinch to'q sirt, dekorativ nur/gradient YO'Q,
   yirik zich sarlavha va ilova-ikonkasi uslubidagi belgilar.      */
const HIGHLIGHTS = [
  {
    icon: Lightbulb,
    tint: 'bg-amber-500',
    title: 'Muammodan g‘oyaga',
    text: 'Real muammolarni toping va yechim taklif qiling.',
  },
  {
    icon: Rocket,
    tint: 'bg-accent-500',
    title: 'Startaplar vitrinasi',
    text: 'Mahsulotingizni hamjamiyatga taqdim eting.',
  },
  {
    icon: Trophy,
    tint: 'bg-iris-500',
    title: 'Reyting va tan olish',
    text: 'Eng yaxshilar IMDB uslubidagi reytingda.',
  },
];

export function AuthBrandPanel() {
  return (
    <div className="hidden bg-brand-900 lg:flex lg:w-[46%] xl:w-[42%]">
      <div className="flex w-full flex-col justify-between p-10 xl:p-14">
        {/* Logo */}
        <Link href="/" className="tappable inline-flex items-center gap-2.5 self-start">
          <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-white">
            <LogoMark className="h-7 w-7" />
          </span>
          <span className="text-title-2 font-semibold tracking-tight text-white">MYMarkaz</span>
        </Link>

        {/* Sarlavha + xususiyatlar */}
        <div className="max-w-md">
          <h2 className="text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.03em] text-white xl:text-[2.75rem]">
            G‘oyadan startapgacha — bitta platformada.
          </h2>
          <p className="mt-4 text-callout leading-relaxed text-slate-400">
            O‘zbekiston yoshlari uchun muammolar, yechimlar va startaplar ekotizimi. Bilim
            almashing, jamoa quring va g‘oyangizni hayotga tatbiq eting.
          </p>

          <div className="mt-9 space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, tint, title, text }) => (
              <div key={title} className="flex items-start gap-3.5">
                <span
                  className={cn(
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-white',
                    tint,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-subhead font-semibold text-white">{title}</p>
                  <p className="text-footnote text-slate-400">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-footnote text-slate-500">Ma‘lumotlaringiz xavfsiz himoyalangan</p>
      </div>
    </div>
  );
}

/* ── Mobil logo (brend panel ko'rinmaganda) ───────────────────── */
export function AuthMobileLogo() {
  return (
    <Link href="/" className="tappable mb-8 flex items-center justify-center gap-2.5 lg:hidden">
      <LogoMark className="h-10 w-10" />
      <span className="text-title-2 font-semibold tracking-tight text-brand-900">MYMarkaz</span>
    </Link>
  );
}

/* ── Standart auth kartasi — barcha sahifalar uchun yagona uslub ── */
export function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('w-full max-w-md', className)}>
      <AuthMobileLogo />
      <div className="rounded-ios-2xl bg-white p-6 shadow-card sm:p-8">
        <div className="mb-7">
          {eyebrow && (
            <p className="mb-1.5 text-footnote font-semibold uppercase tracking-[0.06em] text-accent-700">
              {eyebrow}
            </p>
          )}
          <h1 className="text-title-1 font-bold tracking-tight text-brand-900">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-subhead leading-relaxed text-slate-500">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
