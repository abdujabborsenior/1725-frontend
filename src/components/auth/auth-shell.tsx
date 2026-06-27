'use client';

import Link from 'next/link';
import { Rocket, Lightbulb, Trophy, Users, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Chap brend paneli (faqat lg+) — jiddiy, zamonaviy showcase ── */
const HIGHLIGHTS = [
  { icon: Lightbulb, title: 'Muammodan g‘oyaga', text: 'Real muammolarni toping va yechim taklif qiling.' },
  { icon: Rocket, title: 'Startaplar vitrinasi', text: 'Mahsulotingizni hamjamiyatga taqdim eting.' },
  { icon: Trophy, title: 'Reyting va tan olish', text: 'Eng yaxshilar IMDB uslubidagi reytingda.' },
];

export function AuthBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-brand-900 lg:flex lg:w-[46%] xl:w-[42%]">
      {/* Fon: mesh + aurora + grid */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-900 to-[#0c1f3a]" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-[30rem] w-[30rem] animate-aurora rounded-full bg-accent-500/20 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-[28rem] w-[28rem] animate-aurora rounded-full bg-iris-500/20 blur-[100px] [animation-delay:-6s]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
        {/* Logo */}
        <Link href="/" className="group inline-flex items-center gap-3 self-start">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-emerald-iris shadow-glow-accent transition-transform group-hover:scale-105">
            <Rocket className="h-[22px] w-[22px] text-white" />
          </span>
          <span className="text-2xl font-black tracking-tight text-white">
            Startup<span className="gradient-text-emerald-iris">Hub</span>
          </span>
        </Link>

        {/* Sarlavha + xususiyatlar */}
        <div className="max-w-md">
          <h2 className="text-3xl font-black leading-tight text-white xl:text-4xl">
            G‘oyadan startapgacha —{' '}
            <span className="gradient-text-emerald-iris">bitta platformada.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            O‘zbekiston yoshlari uchun muammolar, yechimlar va startaplar
            ekotizimi. Bilim almashing, jamoa quring va g‘oyangizni hayotga
            tatbiq eting.
          </p>

          <div className="mt-9 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-accent-300 backdrop-blur">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="text-xs text-slate-400">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer ishonch belgisi */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-accent-400" />
          Ma‘lumotlaringiz xavfsiz himoyalangan
          <Users className="ml-4 h-4 w-4 text-iris-400" />
          Minglab foydalanuvchi
        </div>
      </div>
    </div>
  );
}

/* ── Mobil logo (brend panel ko'rinmaganda) ───────────────────── */
export function AuthMobileLogo() {
  return (
    <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-emerald-iris shadow-glow-accent">
        <Rocket className="h-[22px] w-[22px] text-white" />
      </span>
      <span className="text-2xl font-black tracking-tight text-brand-900">
        Startup<span className="gradient-text-emerald-iris">Hub</span>
      </span>
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
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-7 shadow-card backdrop-blur-sm sm:p-8">
        <div className="mb-7">
          {eyebrow && (
            <span className="mb-3 inline-flex items-center rounded-full border border-accent-200 bg-accent-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-700">
              {eyebrow}
            </span>
          )}
          <h1 className="text-2xl font-black text-brand-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
