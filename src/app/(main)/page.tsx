'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronRight,
  Compass,
  FileText,
  Lightbulb,
  MessageCircle,
  Rocket,
  Users,
  Vote,
  Zap,
} from '@/components/icons';
import { problemsApi, startupsApi, chatApi, usersApi, pollsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import dynamic from 'next/dynamic';
import { Reveal, RevealGroup, RevealItem } from '@/components/landing/reveal';
import { AiLauncher } from '@/components/ai/ai-launcher';
import { ChatFab } from '@/components/landing/chat-fab';
import { CountUp } from '@/components/landing/count-up';
import { Marquee } from '@/components/landing/marquee';
import { LazySection } from '@/components/landing/lazy-section';

/* Below-fold kartalar — alohida chunk'larda (next/dynamic): boshlang'ich JS
   kichik qoladi, kod LazySection viewport'ga yaqinlashganda yuklanadi. */
const ProblemCard = dynamic(() =>
  import('@/components/problems/problem-card').then((m) => m.ProblemCard),
);
const StartupCard = dynamic(() =>
  import('@/components/startups/startup-card').then((m) => m.StartupCard),
);
const LeaderboardMini = dynamic(() =>
  import('@/components/startups/leaderboard-mini').then((m) => m.LeaderboardMini),
);
const GroupCard = dynamic(() =>
  import('@/components/social/group-card').then((m) => m.GroupCard),
);
const PollCard = dynamic(() => import('@/components/polls/poll-card').then((m) => m.PollCard));
const UserListItem = dynamic(() =>
  import('@/components/social/user-list-item').then((m) => m.UserListItem),
);
const Doubts = dynamic(() => import('@/components/landing/doubts').then((m) => m.Doubts));

/* Yengil lokal skelet — StartupCardSkeleton'ni statik import qilmaslik uchun */
function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-ios-xl bg-white">
      <div className="skeleton h-28" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-4 w-2/3 rounded-md" />
        <div className="skeleton h-3 w-full rounded-md" />
      </div>
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Muammoni yozing',
    desc: 'Sizni yoki atrofingizdagilarni qiynayotgan biror muammoni baham ko‘ring. Eng yaxshi g‘oyalar shu yerdan boshlanadi.',
  },
  {
    step: '2',
    title: 'Jamoa va fikr to‘plang',
    desc: 'Hamjamiyatdan jonli fikr oling, fikrdosh toping va real vaqtda suhbatlashib yechim ustida ishlang.',
  },
  {
    step: '3',
    title: 'Startapga aylantiring',
    desc: 'G‘oyangizni vitrinaga qo‘ying, ovoz yig‘ing va uni odamlar foydalanadigan real mahsulotga o‘stiring.',
  },
];

const WHAT_IS = [
  {
    icon: Lightbulb,
    tint: 'bg-amber-500',
    title: 'Startap nima?',
    body: 'Startap — shunchaki biznes emas. Bu real muammoni yangicha, tez va arzon hal qiladigan g‘oya. U kichik boshlanadi — daftardagi chizma yoki telefondagi eslatmadan. Muhimi: u kimningdir hayotini biror joyda osonlashtiradi.',
  },
  {
    icon: Compass,
    tint: 'bg-accent-500',
    title: 'Startapper kim?',
    body: 'Startapper — diplom yoki katta sarmoya kutib o‘tirmaydigan odam. U atrofdagi muammoni ko‘radi-da, «buni men hal qilaman» deydi. Maktab o‘quvchisimisiz, talabami yoki endigina izlanayotgan yoshmisiz — farqi yo‘q. Yagona shart — boshlash jur’ati.',
  },
  {
    icon: Zap,
    tint: 'bg-iris-500',
    title: 'Nega aynan hozir?',
    body: 'Chunki tajriba kitobdan emas, harakatdan keladi. Bu yerda g‘oyani sinab ko‘rish, jonli fikr olish va jamoa topish — hammasi bir joyda va bepul. Eng yaxshi payt har doim — hozir.',
  },
];

/** Apple uslubidagi "eyebrow" — pill emas, faqat kichik rangli matn (restraint). */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-accent-700">
      {children}
    </p>
  );
}

/** Apple'ning signature havolasi: ko'k matn + chevron. */
function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="tappable inline-flex shrink-0 items-center gap-0.5 text-callout font-medium text-accent-700"
    >
      {children}
      <ChevronRight className="h-[13px] w-[13px]" strokeWidth={3} />
    </Link>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  href,
  hrefLabel,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-1.5 text-title-1 font-semibold tracking-tight text-brand-900 md:text-[2.125rem]">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-subhead text-slate-500">{subtitle}</p>}
      </div>
      {href && <MoreLink href={href}>{hrefLabel ?? 'Barchasi'}</MoreLink>}
    </div>
  );
}

export default function LandingPage() {
  const { token, user } = useAuthStore();

  const { data: featuredStartups, isLoading: startupsLoading } = useQuery({
    queryKey: ['startups-landing'],
    queryFn: () => startupsApi.list({ limit: 6, sort: 'featured' }),
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
    { icon: Rocket, label: 'Startaplar', value: featuredStartups?.meta.total },
    { icon: FileText, label: 'Muammolar', value: recentProblems?.meta.total },
    { icon: Vote, label: 'Ovoz berishlar', value: polls?.length },
    { icon: Users, label: 'Guruhlar', value: groups?.length },
  ];

  return (
    <div className="space-y-16 md:space-y-24">
      {/* ── Hero ─────────────────────────────────────────────────────────
          Apple mahsulot sahifasi ritmi: tinch oq sirt, yirik va zich
          sarlavha, bitta asosiy amal + bitta oddiy havola. Dekor yo'q. */}
      <section className="-mx-4 bg-white px-4 pb-14 pt-12 text-center md:mx-0 md:rounded-ios-3xl md:px-6 md:pb-20 md:pt-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] text-brand-900 md:text-[4.5rem]">
            G‘oyadan
            <br />
            biznes loyihagacha.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-title-3 font-normal leading-snug text-slate-500 md:mt-6">
            MYMarkaz — o‘quvchilar, talabalar va kreativ yoshlar yig‘iladigan maydon. Muammoni
            yozing, yechimini hamjamiyat bilan quring, jamoa toping va g‘oyangizni real mahsulotga
            aylantiring.
          </p>

          <div
            className="hero-enter mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
            style={{ '--enter-delay': '0.18s' } as CSSProperties}
          >
            {token ? (
              <>
                <Link
                  href="/startups"
                  className="tappable cta-fill flex h-[50px] min-w-[200px] items-center justify-center rounded-full bg-accent-600 px-7 text-body font-medium text-white active:bg-accent-700"
                >
                  Vitrinani ko‘rish
                </Link>
                <Link
                  href="/messages"
                  className="tappable cta-fill cta-fill-gray flex h-[50px] min-w-[200px] items-center justify-center gap-2 rounded-full bg-fill-tertiary px-7 text-body font-medium text-brand-900 active:bg-fill"
                >
                  <MessageCircle className="h-[19px] w-[19px]" /> Suhbatlar
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="tappable cta-fill flex h-[50px] min-w-[200px] items-center justify-center rounded-full bg-accent-600 px-7 text-body font-medium text-white active:bg-accent-700"
                >
                  Bepul boshlash
                </Link>
                <a
                  href="#startap-nima"
                  className="tappable cta-ghost inline-flex h-[50px] items-center justify-center gap-1 rounded-full px-5 text-body font-medium text-accent-700"
                >
                  Startap nima?
                  <ChevronRight className="cta-arrow h-[15px] w-[15px]" strokeWidth={3} />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Nimalar quriladi — marquee */}
        <div
          className="hero-enter mx-auto mt-14 max-w-4xl"
          style={{ '--enter-delay': '0.34s' } as CSSProperties}
        >
          <p className="mb-3 text-footnote text-slate-400">Hamjamiyat shu yerda nimalar quryapti</p>
          <Marquee />
        </div>
      </section>

      {/* ── Yechim AI — mahsulotning aqlli kirish nuqtasi ───────────────
          Hero'dan keyingi BIRINCHI blok: foydalanuvchi "nima qilaman?" degan
          savolga javobni darhol shu yerdan oladi. */}
      <Reveal>
        <AiLauncher />
      </Reveal>

      {/* ── Stats — iOS grouped karta, ustunlar orasida hairline ────────── */}
      <Reveal>
        {/* Ustunlar orasida iOS ajratkichi — mobilda 2×2, desktopda 1×4 */}
        <div
          className={[
            'grid grid-cols-2 overflow-hidden rounded-ios-xl bg-white md:grid-cols-4',
            '[&>*]:border-slate-200',
            '[&>*:nth-child(even)]:border-l [&>*:nth-child(n+3)]:border-t',
            'md:[&>*:nth-child(n+2)]:border-l md:[&>*:nth-child(n+3)]:border-t-0',
          ].join(' ')}
        >
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="px-5 py-6 text-center">
              <Icon className="mx-auto mb-2.5 h-[22px] w-[22px] text-slate-400" />
              <p className="text-title-1 font-semibold tabular-nums text-brand-900">
                <CountUp value={value} />
                {value !== undefined && '+'}
              </p>
              <p className="mt-0.5 text-footnote text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── Startap nima? Startapper kim? ───────────────────────────────── */}
      <LazySection id="startap-nima" className="cv-auto scroll-mt-24 space-y-8" minHeight={520}>
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Bu savollar sizni o‘ylantiryaptimi?</Eyebrow>
          <h2 className="mt-2 text-title-1 font-semibold tracking-tight text-brand-900 md:text-[2.5rem]">
            Startap nima? Startapper kim?
          </h2>
          <p className="mt-3 text-callout text-slate-500">
            Keling, soddagina qilib tushuntiramiz — ortiqcha atamalarsiz, hayotiy tilda.
          </p>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {WHAT_IS.map(({ icon: Icon, tint, title, body }) => (
            <RevealItem key={title}>
              <div className="h-full rounded-ios-2xl bg-white p-6">
                {/* iOS ilova ikonkasi uslubidagi rangli kvadrat */}
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-[11px] text-white ${tint}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-1.5 text-title-3 font-semibold text-brand-900">{title}</h3>
                <p className="text-subhead leading-relaxed text-slate-500">{body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </LazySection>

      {/* ── Sizni nima to'xtatib turibdi? (e'tirozlar) ──────────────────── */}
      <LazySection className="cv-auto space-y-8" minHeight={520}>
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Halol gaplashamiz</Eyebrow>
          <h2 className="mt-2 text-title-1 font-semibold tracking-tight text-brand-900 md:text-[2.5rem]">
            Nega bugun boshlamasliging kerak?
          </h2>
          <p className="mt-3 text-callout text-slate-500">
            Mana — o‘zingizga aytadigan eng keng tarqalgan to‘rtta sabab. Ustiga bosing va halol
            javob bering: qaysi biri rostdan ham to‘xtatishga arziydi?
          </p>
        </Reveal>
        <Reveal>
          <Doubts />
        </Reveal>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-title-3 font-semibold text-brand-900">Bittasi ham emas.</p>
          <p className="mt-1 text-subhead text-slate-500">Shuning uchun eng to‘g‘ri kun — bugun.</p>
        </Reveal>
      </LazySection>

      {/* ── Hamjamiyat guruhlari ────────────────────────────────────────── */}
      {groups && groups.length > 0 && (
        <LazySection className="cv-auto space-y-6" minHeight={420}>
          <Reveal>
            <SectionHeader
              eyebrow="Jonli hamjamiyat"
              title="Hamjamiyat guruhlari"
              subtitle="Real vaqtda suhbatlashing — qo‘shiling va fikr almashing"
              href="/discover"
            />
          </Reveal>
          <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.slice(0, 3).map((g) => (
              <RevealItem key={g.id}>
                <GroupCard group={g} />
              </RevealItem>
            ))}
          </RevealGroup>
        </LazySection>
      )}

      {/* ── Tavsiya etilgan startaplar ──────────────────────────────────── */}
      <LazySection className="cv-auto space-y-6" minHeight={520}>
        <Reveal>
          <SectionHeader
            eyebrow="Vitrina"
            title="Tavsiya etilgan startaplar"
            subtitle="Hamjamiyat ishlab chiqqan ilovalar, saytlar va botlar"
            href="/startups"
          />
        </Reveal>
        {startupsLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : featuredStartups && featuredStartups.data.length > 0 ? (
          <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredStartups.data.map((s) => (
              <RevealItem key={s.id}>
                <StartupCard startup={s} />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <EmptyBox icon={Rocket} title="Tez orada birinchi startaplar" />
        )}
      </LazySection>

      {/* ── Top reyting + kuzatish tavsiyalari ──────────────────────────── */}
      <LazySection className="cv-auto grid grid-cols-1 gap-8 lg:grid-cols-3" minHeight={520}>
        <div className="space-y-6 lg:col-span-2">
          <Reveal>
            <SectionHeader
              eyebrow="Reyting taxtasi"
              title="Top startaplar"
              subtitle="IMDB uslubidagi vaznli reyting bo‘yicha yetakchilar"
              href="/leaderboard"
              hrefLabel="To‘liq reyting"
            />
          </Reveal>
          <Reveal delay={0.06}>
            {topRated?.data?.length ? (
              <LeaderboardMini entries={topRated.data} />
            ) : (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            )}
          </Reveal>
        </div>

        <div className="space-y-3">
          <Reveal>
            <h2 className="ios-section-header">Kuzatish uchun</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="ios-list" style={{ '--row-inset': '3.75rem' } as CSSProperties}>
              {suggestions && suggestions.length > 0 ? (
                suggestions.map((u) => <UserListItem key={u.id} user={u} />)
              ) : (
                <p className="px-4 py-8 text-center text-subhead text-slate-500">
                  Tavsiyalar yuklanmoqda…
                </p>
              )}
              <Link
                href="/discover"
                className="ios-row justify-center text-callout font-medium text-accent-700"
              >
                Ko‘proq odamlarni topish
              </Link>
            </div>
          </Reveal>
        </div>
      </LazySection>

      {/* ── So'nggi muammolar ───────────────────────────────────────────── */}
      <LazySection className="cv-auto space-y-6" minHeight={520}>
        <Reveal>
          <SectionHeader
            eyebrow="Jamoaviy aql"
            title="So‘nggi muammolar"
            subtitle="Ochiq va yechim kutayotgan muammolar"
            href="/problems"
          />
        </Reveal>
        <RevealGroup className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentProblems?.data
            ? recentProblems.data.map((p) => (
                <RevealItem key={p.id}>
                  <ProblemCard problem={p} compact />
                </RevealItem>
              ))
            : Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2 rounded-ios-xl bg-white p-5">
                  <div className="skeleton h-4 w-16 rounded-md" />
                  <div className="skeleton h-5 w-3/4 rounded-md" />
                  <div className="skeleton h-4 w-full rounded-md" />
                </div>
              ))}
        </RevealGroup>
      </LazySection>

      {/* ── Qanday ishlaydi ─────────────────────────────────────────────── */}
      <LazySection className="cv-auto space-y-8" minHeight={520}>
        <Reveal className="text-center">
          <Eyebrow>Yo‘l xaritasi</Eyebrow>
          <h2 className="mt-2 text-title-1 font-semibold tracking-tight text-brand-900 md:text-[2.5rem]">
            Qanday ishlaydi?
          </h2>
          <p className="mt-3 text-callout text-slate-500">
            G‘oyadan startapgacha — uch oddiy qadam.
          </p>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <RevealItem key={step}>
              <div className="h-full rounded-ios-2xl bg-white p-6">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-accent-600 text-callout font-semibold text-white">
                  {step}
                </div>
                <h3 className="mb-1.5 text-title-3 font-semibold text-brand-900">{title}</h3>
                <p className="text-subhead leading-relaxed text-slate-500">{desc}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </LazySection>

      {/* ── Ovoz berish (ikkilamchi — asosiy navigatsiyada emas) ────────── */}
      {activePoll && (
        <LazySection className="cv-auto space-y-6" minHeight={420}>
          <Reveal>
            <SectionHeader
              eyebrow="Hamjamiyat tanlovi"
              title="Ovoz berish"
              subtitle="Yoqqan startapingizga ovoz bering — natijani jonli ko‘ring"
              href="/polls"
              hrefLabel="Barcha so‘rovnomalar"
            />
          </Reveal>
          <Reveal className="mx-auto max-w-2xl">
            <PollCard poll={activePoll} />
          </Reveal>
        </LazySection>
      )}

      {/* ── Yakuniy CTA ─────────────────────────────────────────────────── */}
      {!token && (
        <Reveal>
          <section className="rounded-ios-3xl bg-brand-900 px-6 py-14 text-center md:px-12 md:py-20">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-title-1 font-semibold tracking-tight text-white md:text-[2.5rem]">
                G‘oyangiz boshlanishini kutyapti
              </h2>
              <p className="mx-auto mt-3 max-w-md text-callout leading-relaxed text-slate-300">
                Bugun ro‘yxatdan o‘ting, birinchi muammongizni yozing va o‘zingizga o‘xshagan
                yoshlar bilan birga ishni boshlang. Bir qadam — hammasining boshlanishi.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/register"
                  className="tappable cta-fill cta-fill-light flex h-[50px] min-w-[200px] items-center justify-center rounded-full bg-white px-7 text-body font-medium text-brand-900"
                >
                  Bepul boshlash
                </Link>
                <Link
                  href="/login"
                  className="tappable cta-ghost cta-ghost-dark inline-flex h-[50px] items-center justify-center gap-1 rounded-full px-5 text-body font-medium text-accent-400"
                >
                  Kirish
                  <ChevronRight className="cta-arrow h-[15px] w-[15px]" strokeWidth={3} />
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {user && (
        <p className="text-center text-footnote text-slate-400">
          Xush kelibsiz, {user.fullName}
        </p>
      )}

      {/* Suzuvchi chat tugmasi — suhbatni shu yerdan boshlash */}
      <ChatFab />
    </div>
  );
}

function EmptyBox({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="rounded-ios-xl bg-white py-16 text-center">
      <Icon className="mx-auto mb-3 h-10 w-10 text-slate-300" />
      <p className="text-callout font-medium text-brand-900">{title}</p>
    </div>
  );
}
