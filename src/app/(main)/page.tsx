'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Zap, ArrowRight, Users, FileQuestion,
  Lightbulb, TrendingUp, ChevronRight, Eye, Clock,
} from 'lucide-react';
import { problemsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { PaginatedResponse, Problem } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const STATUS_BADGE: Record<string, string> = {
  pending:      'bg-amber-500/15 text-amber-400 border-amber-500/30',
  open:         'bg-neon-green/10 text-neon-green border-neon-green/30',
  under_review: 'bg-brand-500/15 text-brand-400 border-brand-400/30',
  resolved:     'bg-violet-500/15 text-violet-400 border-violet-500/30',
  rejected:     'bg-red-500/15 text-red-400 border-red-500/30',
};
const STATUS_LABEL: Record<string, string> = {
  pending: 'Kutilmoqda', open: 'Ochiq',
  under_review: "Ko'rib chiqilmoqda", resolved: 'Hal qilindi', rejected: 'Rad etildi',
};

const STATS = [
  { icon: Users,        label: 'Foydalanuvchilar', value: '1,200+', color: 'text-brand-400' },
  { icon: FileQuestion, label: 'Muammolar',         value: '340+',   color: 'text-neon-yellow' },
  { icon: Lightbulb,   label: 'Yechimlar',          value: '890+',   color: 'text-neon-green' },
  { icon: TrendingUp,  label: 'Hal qilingan',        value: '73%',    color: 'text-violet-400' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Ro\'yxatdan o\'ting',
    desc: 'Maktab o\'quvchisi, talaba yoki oddiy foydalanuvchi sifatida ro\'yxatdan o\'ting.',
    color: 'from-brand-500 to-violet-600',
  },
  {
    step: '02',
    title: 'Muammoingizni yuboring',
    desc: 'Duch kelgan muammoni batafsil tasvirlab bering, rasm va video qo\'shing.',
    color: 'from-neon-green/80 to-neon-blue/80',
  },
  {
    step: '03',
    title: 'Yechim oling',
    desc: 'Mutaxassislar va hamjamiyat a\'zolari eng yaxshi yechimni taqdim etadi.',
    color: 'from-amber-500 to-orange-500',
  },
];

export default function LandingPage() {
  const { token } = useAuthStore();

  const { data: recentProblems } = useQuery<PaginatedResponse<Problem>>({
    queryKey: ['problems-landing'],
    queryFn: async () => {
      const res = await problemsApi.list({ limit: 6, status: 'open' });
      return (res.data as { data: PaginatedResponse<Problem> }).data;
    },
    staleTime: 60_000,
  });

  return (
    <div className="space-y-20 animate-fade-in">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative text-center py-16 md:py-24">
        {/* Neon orbs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-brand-500/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-neon-green/15 blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-green/30">
            <span className="h-2 w-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-sm font-semibold text-neon-green">Muammolarni birga hal qilamiz</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
            Muammolaringizni
            <br />
            <span className="gradient-text">yechimga aylantiring</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            StartupHub — maktab o&apos;quvchilari, talabalar va barcha insonlar uchun
            muammo va yechimlarni ulash platformasi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {token ? (
              <>
                <Link href="/problems">
                  <Button size="xl" variant="neon" className="min-w-[180px]">
                    Muammolarni ko&apos;rish <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/problems/create">
                  <Button size="xl" variant="outline" className="min-w-[180px]">
                    Muammo yuborish
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button size="xl" variant="neon" className="min-w-[180px]">
                    Boshlash <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="xl" variant="outline" className="min-w-[180px]">
                    Kirish
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass border border-white/[0.07] rounded-2xl p-5 text-center hover:border-white/15 transition-all">
            <Icon className={cn('h-6 w-6 mx-auto mb-3', color)} />
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Qanday ishlaydi?</h2>
          <p className="text-slate-400 text-sm">Uch oddiy qadam</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {HOW_IT_WORKS.map(({ step, title, desc, color }) => (
            <div key={step} className="relative glass border border-white/[0.07] rounded-3xl p-6 hover:border-white/15 transition-all group">
              <div className={cn(
                'h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5',
                color,
              )}>
                <span className="text-xl font-black text-white">{step}</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who can join ─────────────────────────────────── */}
      <section className="glass border border-white/[0.07] rounded-3xl p-8 md:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Kim ro&apos;yxatdan o&apos;ta oladi?</h2>
          <p className="text-slate-400 text-sm">Barcha yoshdagi insonlar uchun ochiq</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              emoji: '🏫',
              title: 'Maktab o\'quvchilari',
              desc: '1-11 sinf o\'quvchilari uchun. Viloyat, tuman, maktab va sinf ma\'lumotlari bilan.',
              href: '/register/school',
              color: 'border-neon-green/20 hover:border-neon-green/40',
              badge: 'text-neon-green bg-neon-green/10',
            },
            {
              emoji: '🎓',
              title: 'Talabalar',
              desc: '1-6 kurs talabalari uchun. Universitet va kurs ma\'lumotlari bilan.',
              href: '/register/university',
              color: 'border-brand-400/20 hover:border-brand-400/40',
              badge: 'text-brand-400 bg-brand-500/10',
            },
            {
              emoji: '👤',
              title: 'Boshqa insonlar',
              desc: 'Istalgan yoshdagi har qanday inson. Sodda va tez ro\'yxatdan o\'tish.',
              href: '/register',
              color: 'border-violet-400/20 hover:border-violet-400/40',
              badge: 'text-violet-400 bg-violet-500/10',
            },
          ].map(({ emoji, title, desc, href, color, badge }) => (
            <Link key={href} href={href}>
              <div className={cn(
                'glass border rounded-2xl p-5 cursor-pointer transition-all duration-300 h-full',
                color,
              )}>
                <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center text-2xl mb-4', badge)}>
                  {emoji}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{desc}</p>
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  Ro&apos;yxatdan o&apos;tish <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Recent problems ───────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">So&apos;nggi muammolar</h2>
            <p className="text-sm text-slate-500 mt-0.5">Ochiq va yechim kutayotgan muammolar</p>
          </div>
          <Link href="/problems">
            <Button variant="outline" size="sm">
              Barchasini ko&apos;rish <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentProblems?.data
            ? recentProblems.data.map((p) => (
                <Link key={p.id} href={`/problems/${p.id}`}>
                  <article className="glass border border-white/[0.07] rounded-2xl p-5 hover:border-brand-400/30 hover:shadow-card transition-all duration-300 group h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn(
                        'px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border',
                        STATUS_BADGE[p.status],
                      )}>
                        {STATUS_LABEL[p.status]}
                      </span>
                      {p.category && (
                        <span className="text-[11px] text-slate-600 truncate">{p.category}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors line-clamp-2 flex-1 mb-3">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {p.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {p.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </article>
                </Link>
              ))
            : Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass border border-white/[0.07] rounded-2xl p-5 h-36 animate-pulse">
                  <div className="h-4 w-16 rounded bg-white/5 mb-3" />
                  <div className="h-5 w-3/4 rounded bg-white/5 mb-2" />
                  <div className="h-4 w-full rounded bg-white/5" />
                </div>
              ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      {!token && (
        <section className="relative glass-strong border border-brand-400/20 rounded-3xl p-8 md:p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 via-violet-600/10 to-neon-green/5 pointer-events-none" />
          <div className="relative z-10 space-y-5">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-brand">
                <Zap className="h-8 w-8 text-white" fill="white" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Bugun ro&apos;yxatdan o&apos;ting!
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Muammolaringizni ulashing, yechimlar toping va hamjamiyatga hissa qo&apos;shing.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Link href="/register">
                <Button size="xl" variant="neon">
                  Bepul boshlash <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/problems">
                <Button size="xl" variant="secondary">
                  Muammolarni ko&apos;rish
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
