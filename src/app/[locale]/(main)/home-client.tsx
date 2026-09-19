'use client';

import { Link } from '@/i18n/navigation';
import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
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
import { CountUp } from '@/components/landing/count-up';
import { HeroVisual } from '@/components/landing/hero-visual';
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

/* Matnlar — lug'atda (`home.how.steps.<key>.{title,desc}`) */
const HOW_IT_WORKS = [
  { step: '1', key: 'describe' },
  { step: '2', key: 'gather' },
  { step: '3', key: 'launch' },
] as const;

/* Matnlar — lug'atda (`home.whatIs.cards.<key>.{title,body}`) */
const WHAT_IS = [
  { icon: Lightbulb, tint: 'bg-amber-500', key: 'startup' },
  { icon: Compass, tint: 'bg-accent-500', key: 'founder' },
  { icon: Zap, tint: 'bg-iris-500', key: 'now' },
] as const;

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
      className="tappable group inline-flex shrink-0 items-center gap-0.5 text-callout font-medium text-accent-700 transition-colors duration-150 hover:text-accent-800"
    >
      {children}
      <ChevronRight
        className="h-[13px] w-[13px] transition-transform duration-200 ease-ios group-hover:translate-x-0.5 motion-reduce:transition-none"
        strokeWidth={3}
      />
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
  const t = useTranslations('home');
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-1.5 text-title-1 font-semibold tracking-tight text-brand-900 md:text-[2.125rem]">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-subhead text-slate-500">{subtitle}</p>}
      </div>
      {href && <MoreLink href={href}>{hrefLabel ?? t('seeAll')}</MoreLink>}
    </div>
  );
}

export function HomeClient() {
  const t = useTranslations('home');
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
    { icon: Rocket, key: 'startups', value: featuredStartups?.meta.total },
    { icon: FileText, key: 'problems', value: recentProblems?.meta.total },
    { icon: Vote, key: 'polls', value: polls?.length },
    { icon: Users, key: 'groups', value: groups?.length },
  ] as const;

  return (
    <div className="space-y-16 md:space-y-24">
      {/* ── Hero ─────────────────────────────────────────────────────────
          Apple mahsulot sahifasi ritmi: tinch oq sirt, yirik va zich
          sarlavha, bitta asosiy amal + bitta oddiy havola. Dekor yo'q. */}
      <section className="-mx-4 bg-white px-4 pb-14 pt-12 text-center md:mx-0 md:rounded-ios-3xl md:px-6 md:pb-20 md:pt-16 lg:text-left">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,444px)] lg:gap-10">
          <div>
            <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] text-brand-900 md:text-[4.5rem] lg:text-[3.25rem] xl:text-[3.75rem]">
              {/* Ikki ustunli maketda sarlavha o'zi tabiiy o'raladi */}
              {t.rich('hero.title', { br: () => <br className="lg:hidden" /> })}
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-title-3 font-normal leading-snug text-slate-500 md:mt-6 lg:mx-0">
              {t('hero.lead')}
            </p>

            <div
              className="hero-enter mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start"
              style={{ '--enter-delay': '0.18s' } as CSSProperties}
            >
              {token ? (
                <>
                  <Link
                    href="/startups"
                    className="tappable cta-fill flex h-[50px] min-w-[200px] items-center justify-center rounded-full bg-accent-600 px-7 text-body font-medium text-white active:bg-accent-700"
                  >
                    {t('hero.showcase')}
                  </Link>
                  <Link
                    href="/messages"
                    className="tappable cta-fill cta-fill-gray flex h-[50px] min-w-[200px] items-center justify-center gap-2 rounded-full bg-fill-tertiary px-7 text-body font-medium text-brand-900 active:bg-fill"
                  >
                    <MessageCircle className="h-[19px] w-[19px]" /> {t('hero.messages')}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="tappable cta-fill flex h-[50px] min-w-[200px] items-center justify-center rounded-full bg-accent-600 px-7 text-body font-medium text-white active:bg-accent-700"
                  >
                    {t('start')}
                  </Link>
                  <a
                    href="#startap-nima"
                    className="tappable cta-ghost inline-flex h-[50px] items-center justify-center gap-1 rounded-full px-5 text-body font-medium text-accent-700"
                  >
                    {t('hero.whatIs')}
                    <ChevronRight className="cta-arrow h-[15px] w-[15px]" strokeWidth={3} />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Vizual — stock rasm emas, mahsulotning o'zi (DOM, rasm fayli yo'q) */}
          <div className="mt-2 lg:mt-0">
            <HeroVisual />
          </div>
        </div>

        {/* Nimalar quriladi — marquee */}
        <div
          className="hero-enter mx-auto mt-14 max-w-5xl"
          style={{ '--enter-delay': '0.34s' } as CSSProperties}
        >
          <p className="mb-3 text-footnote text-slate-500">{t('hero.building')}</p>
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
          {stats.map(({ icon: Icon, key, value }) => (
            <div key={key} className="px-5 py-6 text-center">
              <Icon className="mx-auto mb-2.5 h-[22px] w-[22px] text-slate-400" />
              <p className="text-title-1 font-semibold tabular-nums text-brand-900">
                <CountUp value={value} />
                {value !== undefined && '+'}
              </p>
              <p className="mt-0.5 text-footnote text-slate-500">{t(`stats.${key}`)}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── Startap nima? Startapper kim? ───────────────────────────────── */}
      <LazySection id="startap-nima" className="cv-auto scroll-mt-24 space-y-8" minHeight={520}>
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t('whatIs.eyebrow')}</Eyebrow>
          <h2 className="mt-2 text-title-1 font-semibold tracking-tight text-brand-900 md:text-[2.5rem]">
            {t('whatIs.title')}
          </h2>
          <p className="mt-3 text-callout text-slate-500">
            {t('whatIs.subtitle')}
          </p>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {WHAT_IS.map(({ icon: Icon, tint, key }) => (
            <RevealItem key={key}>
              <div className="h-full rounded-ios-2xl bg-white p-6">
                {/* iOS ilova ikonkasi uslubidagi rangli kvadrat */}
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-[11px] text-white ${tint}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-1.5 text-title-3 font-semibold text-brand-900">
                  {t(`whatIs.cards.${key}.title`)}
                </h3>
                <p className="text-subhead leading-relaxed text-slate-500">
                  {t(`whatIs.cards.${key}.body`)}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </LazySection>

      {/* ── Sizni nima to'xtatib turibdi? (e'tirozlar) ──────────────────── */}
      <LazySection className="cv-auto space-y-8" minHeight={520}>
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t('doubts.eyebrow')}</Eyebrow>
          <h2 className="mt-2 text-title-1 font-semibold tracking-tight text-brand-900 md:text-[2.5rem]">
            {t('doubts.title')}
          </h2>
          <p className="mt-3 text-callout text-slate-500">
            {t('doubts.subtitle')}
          </p>
        </Reveal>
        <Reveal>
          <Doubts />
        </Reveal>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-title-3 font-semibold text-brand-900">{t('doubts.verdict')}</p>
          <p className="mt-1 text-subhead text-slate-500">{t('doubts.verdictNote')}</p>
        </Reveal>
      </LazySection>

      {/* ── Hamjamiyat guruhlari ────────────────────────────────────────── */}
      {groups && groups.length > 0 && (
        <LazySection className="cv-auto space-y-6" minHeight={420}>
          <Reveal>
            <SectionHeader
              eyebrow={t('groups.eyebrow')}
              title={t('groups.title')}
              subtitle={t('groups.subtitle')}
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
            eyebrow={t('featured.eyebrow')}
            title={t('featured.title')}
            subtitle={t('featured.subtitle')}
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
          <EmptyBox icon={Rocket} title={t('featured.empty')} />
        )}
      </LazySection>

      {/* ── Top reyting + kuzatish tavsiyalari ──────────────────────────── */}
      <LazySection className="cv-auto grid grid-cols-1 gap-8 lg:grid-cols-3" minHeight={520}>
        <div className="space-y-6 lg:col-span-2">
          <Reveal>
            <SectionHeader
              eyebrow={t('top.eyebrow')}
              title={t('top.title')}
              subtitle={t('top.subtitle')}
              href="/leaderboard"
              hrefLabel={t('top.more')}
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
            <h2 className="ios-section-header">{t('follow.title')}</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="ios-list" style={{ '--row-inset': '3.75rem' } as CSSProperties}>
              {suggestions && suggestions.length > 0 ? (
                suggestions.map((u) => <UserListItem key={u.id} user={u} />)
              ) : (
                <p className="px-4 py-8 text-center text-subhead text-slate-500">
                  {t('follow.loading')}
                </p>
              )}
              <Link
                href="/discover"
                className="ios-row justify-center text-callout font-medium text-accent-700"
              >
                {t('follow.more')}
              </Link>
            </div>
          </Reveal>
        </div>
      </LazySection>

      {/* ── So'nggi muammolar ───────────────────────────────────────────── */}
      <LazySection className="cv-auto space-y-6" minHeight={520}>
        <Reveal>
          <SectionHeader
            eyebrow={t('problems.eyebrow')}
            title={t('problems.title')}
            subtitle={t('problems.subtitle')}
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
          <Eyebrow>{t('how.eyebrow')}</Eyebrow>
          <h2 className="mt-2 text-title-1 font-semibold tracking-tight text-brand-900 md:text-[2.5rem]">
            {t('how.title')}
          </h2>
          <p className="mt-3 text-callout text-slate-500">
            {t('how.subtitle')}
          </p>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ step, key }) => (
            <RevealItem key={step}>
              <div className="h-full rounded-ios-2xl bg-white p-6">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-accent-600 text-callout font-semibold text-white">
                  {step}
                </div>
                <h3 className="mb-1.5 text-title-3 font-semibold text-brand-900">
                  {t(`how.steps.${key}.title`)}
                </h3>
                <p className="text-subhead leading-relaxed text-slate-500">
                  {t(`how.steps.${key}.desc`)}
                </p>
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
              eyebrow={t('polls.eyebrow')}
              title={t('polls.title')}
              subtitle={t('polls.subtitle')}
              href="/polls"
              hrefLabel={t('polls.more')}
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
          {/* Sirt ATAYLAB brend ko'ki (accent-900) — ilgari bu yagona qora
              slab edi va sahifadan "chiqib" turardi (2026-08-29 direktivasi). */}
          <section className="rounded-ios-3xl bg-accent-900 px-6 py-14 text-center md:px-12 md:py-20">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-title-1 font-semibold tracking-tight text-white md:text-[2.5rem]">
                {t('cta.title')}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-callout leading-relaxed text-accent-100">
                {t('cta.text')}
              </p>
              {/* Juftlik teng: ikkalasi ham 52px kapsula, ikkilamchisining
                  chegarasi TINCH holatda ham ko'rinadi (yalang'och havola emas). */}
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="tappable cta-fill cta-fill-light inline-flex h-[52px] items-center justify-center rounded-full bg-white px-8 text-body font-semibold text-accent-800"
                >
                  {t('start')}
                </Link>
                <Link
                  href="/login"
                  className="tappable cta-ghost cta-ghost-dark inline-flex h-[52px] items-center justify-center gap-1 rounded-full px-7 text-body font-medium text-white"
                >
                  {t('cta.login')}
                  <ChevronRight className="cta-arrow h-[15px] w-[15px]" strokeWidth={3} />
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {user && (
        <p className="text-center text-footnote text-slate-500">
          {t('welcome', { name: user.fullName })}
        </p>
      )}

    </div>
  );
}

function EmptyBox({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="rounded-ios-xl bg-white py-16 text-center">
      <Icon className="mx-auto mb-3 h-10 w-10 text-accent-300" />
      <p className="text-callout font-medium text-brand-900">{title}</p>
    </div>
  );
}
