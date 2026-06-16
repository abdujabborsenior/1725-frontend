'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, FileQuestion, Lightbulb, ChevronRight, Eye, Clock,
  Rocket, Sparkles, Users, MessageCircle, Star, UserPlus,
} from 'lucide-react';
import { problemsApi, solutionsApi, startupsApi, chatApi, usersApi, pollsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { ProblemStatusBadge } from '@/components/ui/badge';
import { StartupCard, StartupCardSkeleton } from '@/components/startups/startup-card';
import { GroupCard } from '@/components/social/group-card';
import { PollCard } from '@/components/polls/poll-card';
import { UserListItem } from '@/components/social/user-list-item';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const HOW_IT_WORKS = [
  { step: '01', title: "Ro'yxatdan o'ting", desc: "Maktab o'quvchisi, talaba yoki oddiy foydalanuvchi sifatida — bir daqiqada." },
  { step: '02', title: 'Ulashing & bog‘laning', desc: "Muammo yuboring, startapingizni namoyish eting, odamlarni kuzating va suhbatlashing." },
  { step: '03', title: 'Yechim & o‘sish', desc: "Hamjamiyat yordamida g'oyalar real mahsulotlarga aylanadi." },
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
        <Link href={href}>
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
    queryKey: ['startups-top-rated'],
    queryFn: () => startupsApi.list({ limit: 4, sort: 'top_rated' }),
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
  const { data: solutionsCount } = useQuery({
    queryKey: ['stat-solutions'],
    queryFn: () => solutionsApi.list({ limit: 1 }),
    staleTime: 60_000,
  });

  const fmt = (n?: number) => (n === undefined ? '—' : n.toLocaleString('uz'));
  const stats = [
    { icon: Rocket, label: 'Startaplar', value: fmt(featuredStartups?.meta.total), color: 'text-accent-600' },
    { icon: FileQuestion, label: 'Muammolar', value: fmt(recentProblems?.meta.total), color: 'text-amber-600' },
    { icon: Lightbulb, label: 'Yechimlar', value: fmt(solutionsCount?.meta.total), color: 'text-iris-600' },
    { icon: Users, label: 'Guruhlar', value: fmt(groups?.length), color: 'text-sky-600' },
  ];

  return (
    <div className="space-y-16 animate-fade-in">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white px-6 py-16 text-center shadow-soft md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-mesh" />
        <div className="pointer-events-none absolute -top-10 left-1/4 h-72 w-72 rounded-full bg-accent-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-1/4 h-72 w-72 rounded-full bg-iris-200/30 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 shadow-soft">
            <span className="flex h-2 w-2 rounded-full bg-accent-500">
              <span className="h-2 w-2 animate-ping rounded-full bg-accent-500" />
            </span>
            <span className="text-sm font-semibold text-brand-800">Yangi: real-vaqt chat va hamjamiyat</span>
          </div>

          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-brand-900 md:text-6xl">
            G‘oyadan <span className="gradient-text-emerald-iris">startapgacha</span>
            <br />birgalikda
          </h1>

          <p className="mx-auto max-w-xl text-lg leading-relaxed text-slate-600">
            StartupHub — o‘quvchilar, talabalar va kreativ insonlar uchun: muammolarni yeching,
            startapingizni ulashing, odamlarni kuzating va real vaqtda suhbatlashing.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
            {token ? (
              <>
                <Link href="/startups"><Button size="xl" variant="accent" className="min-w-[200px]">Vitrinani ko‘rish <ArrowRight className="h-5 w-5" /></Button></Link>
                <Link href="/messages"><Button size="xl" variant="outline" className="min-w-[200px]"><MessageCircle className="h-5 w-5" /> Suhbatlar</Button></Link>
              </>
            ) : (
              <>
                <Link href="/register"><Button size="xl" variant="accent" className="min-w-[200px]">Bepul boshlash <ArrowRight className="h-5 w-5" /></Button></Link>
                <Link href="/login"><Button size="xl" variant="outline" className="min-w-[200px]">Kirish</Button></Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 text-center transition-all hover:shadow-card-hover">
            <Icon className={cn('mx-auto mb-3 h-6 w-6', color)} />
            <p className="text-2xl font-black text-brand-900">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      {/* ── Community groups ─────────────────────────────── */}
      {groups && groups.length > 0 && (
        <section className="space-y-6">
          <SectionHeader
            kicker="Jonli hamjamiyat" icon={MessageCircle}
            title="Hamjamiyat guruhlari"
            subtitle="Real vaqtda suhbatlashing — qo‘shiling va fikr almashing"
            href="/discover" hrefLabel="Barchasi"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.slice(0, 3).map((g) => <GroupCard key={g.id} group={g} />)}
          </div>
        </section>
      )}

      {/* ── Active poll (ovoz berish) ────────────────────── */}
      {activePoll && (
        <section className="space-y-6">
          <SectionHeader
            kicker="Hamjamiyat tanlovi" icon={Star} title="Ovoz berish"
            subtitle="Yoqqan startapingizga ovoz bering — natijani jonli ko‘ring"
            href="/polls" hrefLabel="Barchasi"
          />
          <div className="mx-auto max-w-2xl">
            <PollCard poll={activePoll} />
          </div>
        </section>
      )}

      {/* ── Featured startups ────────────────────────────── */}
      <section className="space-y-6">
        <SectionHeader
          kicker="Vitrina" icon={Rocket} title="Tavsiya etilgan startaplar"
          subtitle="Hamjamiyat ishlab chiqqan ilovalar, saytlar va botlar"
          href="/startups" hrefLabel="Barchasi"
        />
        {startupsLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <StartupCardSkeleton key={i} />)}
          </div>
        ) : featuredStartups && featuredStartups.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredStartups.data.map((s) => <StartupCard key={s.id} startup={s} />)}
          </div>
        ) : (
          <EmptyBox icon={Rocket} title="Tez orada birinchi startaplar" />
        )}
      </section>

      {/* ── Recommended + Who to follow (two columns) ────── */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionHeader kicker="Siz uchun" icon={Star} title="Eng yuqori baholangan" href="/startups?sort=top_rated" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {topRated?.data?.length
              ? topRated.data.map((s) => <StartupCard key={s.id} startup={s} />)
              : Array.from({ length: 2 }).map((_, i) => <StartupCardSkeleton key={i} />)}
          </div>
        </div>

        {/* Who to follow */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-iris-200 bg-iris-50 px-3 py-1">
            <UserPlus className="h-3.5 w-3.5 text-iris-600" />
            <span className="text-xs font-semibold text-iris-700">Kuzatish uchun</span>
          </div>
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
        </div>
      </section>

      {/* ── Recent problems ──────────────────────────────── */}
      <section className="space-y-6">
        <SectionHeader kicker="Jamoaviy aql" icon={FileQuestion} title="So‘nggi muammolar" subtitle="Ochiq va yechim kutayotgan muammolar" href="/problems" hrefLabel="Barchasi" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentProblems?.data
            ? recentProblems.data.map((p) => (
                <Link key={p.id} href={`/problems/${p.id}`}>
                  <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-accent-300 hover:shadow-card-hover">
                    <div className="mb-3 flex items-center gap-2">
                      <ProblemStatusBadge status={p.status} />
                      {p.category && <span className="truncate text-[11px] text-slate-500">{p.category}</span>}
                    </div>
                    <h3 className="mb-3 line-clamp-2 flex-1 text-sm font-semibold text-brand-900 transition-colors group-hover:text-accent-700">{p.title}</h3>
                    <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-slate-600">{p.description}</p>
                    <div className="mt-auto flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {p.viewCount}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}</span>
                    </div>
                  </article>
                </Link>
              ))
            : Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white p-5">
                  <div className="mb-3 h-4 w-16 rounded bg-slate-100" />
                  <div className="mb-2 h-5 w-3/4 rounded bg-slate-100" />
                  <div className="h-4 w-full rounded bg-slate-100" />
                </div>
              ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-brand-900 md:text-3xl">Qanday ishlaydi?</h2>
          <p className="text-sm text-slate-500">Uch oddiy qadam</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-accent-300 hover:shadow-card-hover">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-900">
                <span className="text-base font-black text-accent-400">{step}</span>
              </div>
              <h3 className="mb-2 text-base font-bold text-brand-900">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      {!token && (
        <section className="relative overflow-hidden rounded-[2rem] bg-brand-900 p-8 text-center md:p-12">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-iris-900/40" />
          <div className="relative z-10 space-y-5">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-emerald-iris shadow-glow-accent">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-white md:text-3xl">Bugun hamjamiyatga qo‘shiling</h2>
            <p className="mx-auto max-w-md text-slate-300">G‘oyalaringizni ulashing, odamlarni kuzating va real vaqtda suhbatlashing.</p>
            <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
              <Link href="/register"><Button size="xl" variant="accent">Bepul boshlash <ArrowRight className="h-5 w-5" /></Button></Link>
            </div>
          </div>
        </section>
      )}
      <p className="text-center text-xs text-slate-400">
        {user ? `Xush kelibsiz, ${user.fullName} 👋` : null}
      </p>
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
