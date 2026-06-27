'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, FileQuestion, ChevronRight, Rocket, Sparkles, Users,
  MessageCircle, Star, UserPlus, Lightbulb, Compass, Zap, Heart, Trophy,
} from 'lucide-react';
import { problemsApi, startupsApi, chatApi, usersApi, pollsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { ProblemCard } from '@/components/problems/problem-card';
import { StartupCard, StartupCardSkeleton } from '@/components/startups/startup-card';
import { LeaderboardMini } from '@/components/startups/leaderboard-mini';
import { GroupCard } from '@/components/social/group-card';
import { PollCard } from '@/components/polls/poll-card';
import { UserListItem } from '@/components/social/user-list-item';
import { Reveal, RevealGroup, RevealItem } from '@/components/landing/reveal';
import { CountUp } from '@/components/landing/count-up';
import { Doubts } from '@/components/landing/doubts';
import { Marquee } from '@/components/landing/marquee';
import { cn } from '@/lib/utils';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Muammoni yozing',
    desc: 'Sizni yoki atrofingizdagilarni qiynayotgan biror muammoni baham ko‘ring. Eng yaxshi g‘oyalar shu yerdan boshlanadi.',
  },
  {
    step: '02',
    title: 'Jamoa va fikr to‘plang',
    desc: 'Hamjamiyatdan jonli fikr oling, fikrdosh toping va real vaqtda suhbatlashib yechim ustida ishlang.',
  },
  {
    step: '03',
    title: 'Startapga aylantiring',
    desc: 'G‘oyangizni vitrinaga qo‘ying, ovoz yig‘ing va uni odamlar foydalanadigan real mahsulotga o‘stiring.',
  },
];

const WHAT_IS = [
  {
    icon: Lightbulb,
    title: 'Startap nima?',
    body: 'Startap — shunchaki biznes emas. Bu real muammoni yangicha, tez va arzon hal qiladigan g‘oya. U kichik boshlanadi — daftardagi chizma yoki telefondagi eslatmadan. Muhimi: u kimningdir hayotini biror joyda osonlashtiradi.',
  },
  {
    icon: Compass,
    title: 'Startapper kim?',
    body: 'Startapper — diplom yoki katta sarmoya kutib o‘tirmaydigan odam. U atrofdagi muammoni ko‘radi-da, «buni men hal qilaman» deydi. Maktab o‘quvchisimisiz, talabami yoki endigina izlanayotgan yoshmisiz — farqi yo‘q. Yagona shart — boshlash jur’ati.',
  },
  {
    icon: Zap,
    title: 'Nega aynan hozir?',
    body: 'Chunki tajriba kitobdan emas, harakatdan keladi. Bu yerda g‘oyani sinab ko‘rish, jonli fikr olish va jamoa topish — hammasi bir joyda va bepul. Eng yaxshi payt har doim — hozir.',
  },
];

function SectionHeader({
  kicker, icon: Icon, title, subtitle, href, hrefLabel,
}: {
  kicker: string; icon: React.ElementType; title: string; subtitle?: string;
  href?: string; hrefLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-3 py-1">
          <Icon className="h-3.5 w-3.5 text-accent-600" />
          <span className="text-xs font-semibold text-accent-700">{kicker}</span>
        </div>
        <h2 className="text-2xl font-bold text-brand-900 md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="flex-none">
          <Button variant="outline" size="sm">
            {hrefLabel ?? 'Barchasi'} <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}

export default function LandingPage() {
  const { token, user } = useAuthStore();

  const { data: featuredStartups, isLoading: startupsLoading } = useQuery({
    queryKey: ['startups-landing'],
    queryFn: () => startupsApi.list({ limit: 8, sort: 'featured' }),
    staleTime: 60_000,
  });
  const { data: topRated } = useQuery({
    queryKey: ['startups-leaderboard-home'],
    queryFn: () => startupsApi.leaderboard({ limit: 6, period: 'all' }),
    staleTime: 60_000,
  });
  const { data: recentProblems } = useQuery({
    queryKey: ['problems-landing'],
    queryFn: () => problemsApi.list({ limit: 6, status: 'open' }),
    staleTime: 60_000,
  });
  const { data: groups } = useQuery({
    queryKey: ['home-groups'],
    queryFn: () => chatApi.publicGroups(5),
    staleTime: 60_000,
  });
  const { data: suggestions } = useQuery({
    queryKey: ['home-suggestions'],
    queryFn: () => usersApi.suggestions(5),
    staleTime: 60_000,
  });
  const { data: polls } = useQuery({
    queryKey: ['home-polls'],
    queryFn: () => pollsApi.list(),
    staleTime: 60_000,
  });
  const activePoll = polls?.find((p) => !p.isClosed) ?? polls?.[0];

  const stats = [
    { icon: Rocket, label: 'Startaplar', value: featuredStartups?.meta.total, color: 'text-accent-600' },
    { icon: FileQuestion, label: 'Muammolar', value: recentProblems?.meta.total, color: 'text-amber-600' },
    { icon: Sparkles, label: 'Ovoz berishlar', value: polls?.length, color: 'text-iris-600' },
    { icon: Users, label: 'Guruhlar', value: groups?.length, color: 'text-sky-600' },
  ];

  return (
    <div className="space-y-20 md:space-y-28">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative -mx-4 overflow-hidden rounded-b-[2.5rem] border-b border-slate-200/70 px-4 pb-16 pt-10 md:mx-0 md:rounded-[2.5rem] md:border md:px-6 md:pb-24 md:pt-20">
        {/* Animatsiyalangan aurora fon */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="pointer-events-none absolute inset-0 -z-10 grid-pattern" />
        <div className="pointer-events-none absolute -left-24 -top-24 -z-10 h-[28rem] w-[28rem] animate-aurora rounded-full bg-accent-300/30 blur-[90px]" />
        <div className="pointer-events-none absolute -right-24 top-10 -z-10 h-[26rem] w-[26rem] animate-aurora rounded-full bg-iris-300/30 blur-[90px] [animation-delay:-6s]" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 -z-10 h-72 w-72 animate-aurora rounded-full bg-emerald-200/30 blur-[80px] [animation-delay:-10s]" />

        {/* Suzuvchi belgilar (faqat katta ekran) */}
        <FloatingChip className="left-[6%] top-[18%]" icon={Lightbulb} label="G‘oya" tone="accent" delay="0s" />
        <FloatingChip className="right-[7%] top-[26%]" icon={Rocket} label="Startap" tone="iris" delay="-2s" />
        <FloatingChip className="left-[9%] bottom-[14%]" icon={Users} label="Jamoa" tone="sky" delay="-4s" />
        <FloatingChip className="right-[8%] bottom-[18%]" icon={MessageCircle} label="Suhbat" tone="accent" delay="-3s" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 shadow-soft backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
            </span>
            <span className="text-xs font-semibold text-brand-800 md:text-sm">
              Yangi — real-vaqt chat, hamjamiyat va ovoz berish
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06 }}
            className="mt-6 text-[2.6rem] font-black leading-[1.04] tracking-tight text-brand-900 md:text-7xl"
          >
            Bugun — g‘oya.
            <br />
            Ertaga — <span className="gradient-text-animated">startap.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.14 }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg"
          >
            StartupHub — o‘quvchilar, talabalar va kreativ yoshlar yig‘iladigan maydon.
            Sizni qiynayotgan muammoni yozing, yechimini hamjamiyat bilan quring, jamoa toping
            va g‘oyangizni real mahsulotga aylantiring. Bu yo‘lda yolg‘iz emassiz.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            {token ? (
              <>
                <Link href="/startups">
                  <Button size="xl" variant="accent" className="group min-w-[210px]">
                    Vitrinani ko‘rish
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button size="xl" variant="outline" className="min-w-[210px]">
                    <MessageCircle className="h-5 w-5" /> Suhbatlar
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button size="xl" variant="accent" className="group min-w-[210px]">
                    Bepul boshlash
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
                <a href="#startap-nima">
                  <Button size="xl" variant="outline" className="min-w-[210px]">
                    <Lightbulb className="h-5 w-5" /> Startap nima?
                  </Button>
                </a>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500"
          >
            <span className="inline-flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-accent-500" /> Butunlay bepul
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Ro‘yxatdan o‘tish 1 daqiqa
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-iris-500" /> Jonli hamjamiyat
            </span>
          </motion.div>
        </div>

        {/* Nimalar quriladi — marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="relative z-10 mx-auto mt-12 max-w-4xl"
        >
          <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Hamjamiyat shu yerda nimalar quryapti
          </p>
          <Marquee />
        </motion.div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <RevealGroup className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <RevealItem key={label}>
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 text-center transition-all hover:-translate-y-1 hover:border-accent-200 hover:shadow-card-hover">
              <Icon className={cn('mx-auto mb-3 h-6 w-6 transition-transform group-hover:scale-110', color)} />
              <p className="text-3xl font-black text-brand-900">
                <CountUp value={value} />
                {value !== undefined && '+'}
              </p>
              <p className="mt-1 text-xs text-slate-500">{label}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* ── Startap nima? Startapper kim? ────────────────── */}
      <section id="startap-nima" className="scroll-mt-24 space-y-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-iris-200 bg-iris-50 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-iris-600" />
            <span className="text-xs font-semibold text-iris-700">Bu savollar sizni o‘ylantiryaptimi?</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-brand-900 md:text-4xl">
            Startap nima? <span className="gradient-text-emerald-iris">Startapper</span> kim?
          </h2>
          <p className="mt-3 text-slate-600">
            Keling, soddagina qilib tushuntiramiz — ortiqcha atamalarsiz, hayotiy tilda.
          </p>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {WHAT_IS.map(({ icon: Icon, title, body }) => (
            <RevealItem key={title}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-1 hover:border-accent-200 hover:shadow-card-hover">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-emerald-iris opacity-[0.07] blur-2xl transition-opacity group-hover:opacity-[0.14]" />
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-emerald-iris text-white shadow-glow-accent">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-brand-900">{title}</h3>
                <p className="text-[15px] leading-relaxed text-slate-600">{body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ── Sizni nima to'xtatib turibdi? (e'tirozlar) ───── */}
      <section className="space-y-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
            <Zap className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700">Halol gaplashamiz</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-brand-900 md:text-4xl">
            Sizni nima to‘xtatib turibdi?
          </h2>
          <p className="mt-3 text-slate-600">
            Har bir boshlovchining ko‘nglidan o‘tadigan shubhalar. Ustiga bosing — birga ko‘rib chiqamiz.
          </p>
        </Reveal>
        <Reveal>
          <Doubts />
        </Reveal>
      </section>

      {/* ── Community groups ─────────────────────────────── */}
      {groups && groups.length > 0 && (
        <section className="space-y-6">
          <Reveal>
            <SectionHeader
              kicker="Jonli hamjamiyat" icon={MessageCircle}
              title="Hamjamiyat guruhlari"
              subtitle="Real vaqtda suhbatlashing — qo‘shiling va fikr almashing"
              href="/discover" hrefLabel="Barchasi"
            />
          </Reveal>
          <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.slice(0, 3).map((g) => <RevealItem key={g.id}><GroupCard group={g} /></RevealItem>)}
          </RevealGroup>
        </section>
      )}

      {/* ── Active poll ──────────────────────────────────── */}
      {activePoll && (
        <section className="space-y-6">
          <Reveal>
            <SectionHeader
              kicker="Hamjamiyat tanlovi" icon={Star} title="Ovoz berish"
              subtitle="Yoqqan startapingizga ovoz bering — natijani jonli ko‘ring"
              href="/polls" hrefLabel="Barchasi"
            />
          </Reveal>
          <Reveal className="mx-auto max-w-2xl">
            <PollCard poll={activePoll} />
          </Reveal>
        </section>
      )}

      {/* ── Featured startups ────────────────────────────── */}
      <section className="space-y-6">
        <Reveal>
          <SectionHeader
            kicker="Vitrina" icon={Rocket} title="Tavsiya etilgan startaplar"
            subtitle="Hamjamiyat ishlab chiqqan ilovalar, saytlar va botlar"
            href="/startups" hrefLabel="Barchasi"
          />
        </Reveal>
        {startupsLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <StartupCardSkeleton key={i} />)}
          </div>
        ) : featuredStartups && featuredStartups.data.length > 0 ? (
          <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredStartups.data.map((s) => <RevealItem key={s.id}><StartupCard startup={s} /></RevealItem>)}
          </RevealGroup>
        ) : (
          <EmptyBox icon={Rocket} title="Tez orada birinchi startaplar" />
        )}
      </section>

      {/* ── Top rated + Who to follow ────────────────────── */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Reveal>
            <SectionHeader kicker="Reyting taxtasi" icon={Trophy} title="Top startaplar" subtitle="IMDB uslubidagi vaznli reyting bo‘yicha yetakchilar" href="/leaderboard" hrefLabel="To‘liq reyting" />
          </Reveal>
          <Reveal delay={0.06}>
            {topRated?.data?.length ? (
              <LeaderboardMini entries={topRated.data} />
            ) : (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <StartupCardSkeleton key={i} />
                ))}
              </div>
            )}
          </Reveal>
        </div>

        <div className="space-y-4">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-iris-200 bg-iris-50 px-3 py-1">
              <UserPlus className="h-3.5 w-3.5 text-iris-600" />
              <span className="text-xs font-semibold text-iris-700">Kuzatish uchun</span>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-soft">
              {suggestions && suggestions.length > 0 ? (
                suggestions.map((u) => <UserListItem key={u.id} user={u} />)
              ) : (
                <p className="px-3 py-8 text-center text-sm text-slate-400">Tavsiyalar yuklanmoqda…</p>
              )}
              <Link href="/discover" className="block px-3 py-3 text-center text-xs font-semibold text-iris-700 hover:underline">
                Ko‘proq odamlarni topish →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Recent problems ──────────────────────────────── */}
      <section className="space-y-6">
        <Reveal>
          <SectionHeader kicker="Jamoaviy aql" icon={FileQuestion} title="So‘nggi muammolar" subtitle="Ochiq va yechim kutayotgan muammolar" href="/problems" hrefLabel="Barchasi" />
        </Reveal>
        <RevealGroup className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentProblems?.data
            ? recentProblems.data.map((p) => (
                <RevealItem key={p.id}><ProblemCard problem={p} compact /></RevealItem>
              ))
            : Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white p-5">
                  <div className="mb-3 h-4 w-16 rounded bg-slate-100" />
                  <div className="mb-2 h-5 w-3/4 rounded bg-slate-100" />
                  <div className="h-4 w-full rounded bg-slate-100" />
                </div>
              ))}
        </RevealGroup>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="space-y-10">
        <Reveal className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-3 py-1">
            <Compass className="h-3.5 w-3.5 text-accent-600" />
            <span className="text-xs font-semibold text-accent-700">Yo‘l xaritasi</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-brand-900 md:text-4xl">Qanday ishlaydi?</h2>
          <p className="mt-3 text-slate-600">G‘oyadan startapgacha — uch oddiy qadam.</p>
        </Reveal>
        <RevealGroup className="relative grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Bog'lovchi chiziq (desktop) */}
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-[2.75rem] hidden h-px bg-gradient-to-r from-accent-200 via-iris-200 to-accent-200 md:block" />
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <RevealItem key={step}>
              <div className="group relative h-full rounded-3xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-1 hover:border-accent-300 hover:shadow-card-hover">
                <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-900 ring-4 ring-white transition-transform group-hover:scale-105">
                  <span className="text-lg font-black text-accent-400">{step}</span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-brand-900">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      {!token && (
        <Reveal>
          <section className="relative -mx-4 overflow-hidden rounded-[2.5rem] bg-brand-900 px-6 py-14 text-center md:mx-0 md:px-12 md:py-20">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-iris-900/50" />
            <div className="pointer-events-none absolute inset-0 grid-pattern-dark" />
            <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 animate-aurora rounded-full bg-accent-500/20 blur-[80px]" />
            <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 animate-aurora rounded-full bg-iris-500/20 blur-[80px] [animation-delay:-7s]" />
            <div className="relative z-10 mx-auto max-w-2xl space-y-6">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 animate-float items-center justify-center rounded-2xl bg-gradient-emerald-iris shadow-glow-accent">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                G‘oyangiz boshlanishini kutyapti
              </h2>
              <p className="mx-auto max-w-md text-slate-300">
                Bugun ro‘yxatdan o‘ting, birinchi muammongizni yozing va o‘zingizga o‘xshagan
                yoshlar bilan birga ishni boshlang. Bir qadam — hammasining boshlanishi.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 pt-1 sm:flex-row">
                <Link href="/register">
                  <Button size="xl" variant="accent" className="group min-w-[210px]">
                    Bepul boshlash
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="xl" variant="outline" className="min-w-[160px] border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30">
                    Kirish
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {user && (
        <p className="text-center text-xs text-slate-400">
          Xush kelibsiz, {user.fullName} 👋
        </p>
      )}
    </div>
  );
}

/* ── Hero suzuvchi belgisi ─────────────────────────────── */
function FloatingChip({
  className, icon: Icon, label, tone, delay,
}: {
  className: string; icon: React.ElementType; label: string;
  tone: 'accent' | 'iris' | 'sky'; delay: string;
}) {
  const tones = {
    accent: 'text-accent-600',
    iris: 'text-iris-600',
    sky: 'text-sky-600',
  };
  return (
    <div
      style={{ animationDelay: delay }}
      className={cn(
        'pointer-events-none absolute z-0 hidden animate-float items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3.5 py-2 shadow-soft backdrop-blur lg:flex',
        className,
      )}
    >
      <Icon className={cn('h-4 w-4', tones[tone])} />
      <span className="text-sm font-bold text-brand-800">{label}</span>
    </div>
  );
}

function EmptyBox({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-surface-soft py-14 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <p className="font-semibold text-brand-900">{title}</p>
    </div>
  );
}
