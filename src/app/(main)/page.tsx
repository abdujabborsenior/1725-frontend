'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Zap, ArrowRight, Users, FileQuestion,
  Lightbulb, TrendingUp, ChevronRight, Eye, Clock,
} from 'lucide-react';
import { problemsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { ProblemStatusBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const STATS = [
  { icon: Users,        label: 'Foydalanuvchilar', value: '1,200+', color: 'text-brand-700' },
  { icon: FileQuestion, label: 'Muammolar',         value: '340+',   color: 'text-amber-600' },
  { icon: Lightbulb,    label: 'Yechimlar',         value: '890+',   color: 'text-accent-600' },
  { icon: TrendingUp,   label: 'Hal qilingan',      value: '73%',    color: 'text-violet-600' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: "Ro'yxatdan o'ting",
    desc: "Maktab o'quvchisi, talaba yoki oddiy foydalanuvchi sifatida ro'yxatdan o'ting.",
  },
  {
    step: '02',
    title: 'Muammoingizni yuboring',
    desc: "Duch kelgan muammoni batafsil tasvirlab bering, rasm va video qo'shing.",
  },
  {
    step: '03',
    title: 'Yechim oling',
    desc: "Mutaxassislar va hamjamiyat a'zolari eng yaxshi yechimni taqdim etadi.",
  },
];

export default function LandingPage() {
  const { token } = useAuthStore();

  const { data: recentProblems } = useQuery({
    queryKey: ['problems-landing'],
    queryFn: () => problemsApi.list({ limit: 6, status: 'open' }),
    staleTime: 60_000,
  });

  return (
    <div className="space-y-20 animate-fade-in">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative text-center py-16 md:py-24">
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-accent-100/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-brand-100/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-50 border border-accent-200">
            <span className="h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
            <span className="text-sm font-semibold text-accent-700">Muammolarni birga hal qilamiz</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-brand-900 leading-tight">
            Muammolaringizni
            <br />
            <span className="gradient-text">yechimga aylantiring</span>
          </h1>

          <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            StartupHub — maktab o&apos;quvchilari, talabalar va barcha insonlar uchun
            muammo va yechimlarni ulash platformasi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {token ? (
              <>
                <Link href="/problems">
                  <Button size="xl" variant="accent" className="min-w-[200px]">
                    Muammolarni ko&apos;rish <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/problems/create">
                  <Button size="xl" variant="outline" className="min-w-[200px]">
                    Muammo yuborish
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button size="xl" variant="accent" className="min-w-[200px]">
                    Boshlash <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="xl" variant="outline" className="min-w-[200px]">
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
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 text-center hover:shadow-card-hover transition-all">
            <Icon className={cn('h-6 w-6 mx-auto mb-3', color)} />
            <p className="text-2xl font-black text-brand-900">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-900 mb-2">Qanday ishlaydi?</h2>
          <p className="text-slate-500 text-sm">Uch oddiy qadam</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} className="relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-card-hover hover:border-accent-300 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-brand-900 flex items-center justify-center mb-5">
                <span className="text-base font-black text-accent-400">{step}</span>
              </div>
              <h3 className="text-base font-bold text-brand-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              <ChevronRight className="absolute top-6 right-6 h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Who can join ─────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-900 mb-2">Kim ro&apos;yxatdan o&apos;ta oladi?</h2>
          <p className="text-slate-500 text-sm">Barcha yoshdagi insonlar uchun ochiq</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              emoji: '🏫',
              title: "Maktab o'quvchilari",
              desc: "1-11 sinf o'quvchilari uchun. Viloyat, tuman, maktab va sinf ma'lumotlari bilan.",
              href: '/register/school',
            },
            {
              emoji: '🎓',
              title: 'Talabalar',
              desc: "1-6 kurs talabalari uchun. Universitet va kurs ma'lumotlari bilan.",
              href: '/register/university',
            },
            {
              emoji: '👤',
              title: 'Boshqa insonlar',
              desc: "Istalgan yoshdagi har qanday inson. Sodda va tez ro'yxatdan o'tish.",
              href: '/register',
            },
          ].map(({ emoji, title, desc, href }) => (
            <Link key={href} href={href}>
              <div className="bg-surface-soft border border-slate-200 rounded-xl p-5 hover:border-accent-300 hover:shadow-card transition-all duration-200 h-full">
                <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl mb-4">
                  {emoji}
                </div>
                <h3 className="text-sm font-bold text-brand-900 mb-2">{title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{desc}</p>
                <span className="text-xs font-semibold text-accent-700 flex items-center gap-1">
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
            <h2 className="text-2xl font-bold text-brand-900">So&apos;nggi muammolar</h2>
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
                  <article className="bg-white border border-slate-200 rounded-xl p-5 hover:border-accent-300 hover:shadow-card-hover transition-all duration-200 group h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <ProblemStatusBadge status={p.status} />
                      {p.category && (
                        <span className="text-[11px] text-slate-500 truncate">{p.category}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-brand-900 group-hover:text-accent-700 transition-colors line-clamp-2 flex-1 mb-3">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {p.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-auto">
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
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 h-36 animate-pulse">
                  <div className="h-4 w-16 rounded bg-slate-100 mb-3" />
                  <div className="h-5 w-3/4 rounded bg-slate-100 mb-2" />
                  <div className="h-4 w-full rounded bg-slate-100" />
                </div>
              ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      {!token && (
        <section className="relative bg-brand-900 rounded-2xl p-8 md:p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 pointer-events-none" />
          <div className="relative z-10 space-y-5">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-2xl bg-accent-500 flex items-center justify-center shadow-glow-accent">
                <Zap className="h-8 w-8 text-white" fill="white" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Bugun ro&apos;yxatdan o&apos;ting!
            </h2>
            <p className="text-slate-300 max-w-md mx-auto">
              Muammolaringizni ulashing, yechimlar toping va hamjamiyatga hissa qo&apos;shing.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Link href="/register">
                <Button size="xl" variant="accent">
                  Bepul boshlash <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/problems">
                <Button size="xl" variant="outline" className="!bg-transparent !text-white !border-white/30 hover:!bg-white/10 hover:!border-white/50">
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
