'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  MapPin,
  School,
  BookOpen,
  Lightbulb,
  FileText,
  Eye,
  LogOut,
  Trash2,
  CheckCircleFill,
  Settings,
  ChevronRight,
  Wallet,
  MailOpen,
  Briefcase,
} from '@/components/icons';
import {
  profileApi,
  authApi,
  startupsApi,
  founderApi,
  investorsApi,
  getErrorMessage,
} from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { navigateAfterAuthChange } from '@/lib/auth-navigation';
import type { Solution } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Avatar } from '@/components/ui/avatar';
import { ProblemStatusPill } from '@/components/ui/badge';
import { StartupCard } from '@/components/startups/startup-card';
import { ListRowSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/page-header';
import { ROLE_BADGE, regionKey } from '@/lib/constants';
import { VerifiedBadge } from '@/components/social/verified-badge';
import { FounderBadge } from '@/components/social/founder-badge';
import { useDateFormat } from '@/lib/date';
import { useFormatNumber } from '@/lib/format';
import { BILLING_ENABLED } from '@/lib/billing';
import toast from 'react-hot-toast';

/**
 * Shaxsiy profil — iOS Sozlamalar/Kontaktlar ritmida:
 * markazlashgan avatar-sarlavha, inset-grouped ro'yxatlar, amallar esa
 * iOS'dagi kabi alohida guruhlarda (destruktiv — qizil, markazda).
 */
export function MyProfileClient() {
  const t = useTranslations('profile');
  const tn = useTranslations('nav');
  const tl = useTranslations('labels');
  const tr = useTranslations('regions');
  const tc = useTranslations('common');
  const { timeAgo } = useDateFormat();
  const fmt = useFormatNumber();
  const router = useRouter();
  const { user, token, refreshToken, hasHydrated, clearAuth } = useAuthStore();

  /**
   * Kelgan bog'lanish so'rovlari va investor profili.
   *
   * Ikkalasi ham JIM: yozuv bo'lmasa profil sahifasi bugungidek ko'rinadi
   * (qator umuman chizilmaydi). Shu tufayli venture bo'limi mavjud
   * foydalanuvchi tajribasiga hech narsa qo'shmaydi va hech narsa olmaydi.
   */
  const { data: pendingIntros } = useQuery({
    queryKey: ['founder-pending'],
    queryFn: () => founderApi.pendingCount(),
    enabled: !!token,
    staleTime: 60_000,
  });
  const { data: investorMe } = useQuery({
    queryKey: ['investor-me'],
    queryFn: () => investorsApi.me(),
    enabled: !!token,
    staleTime: 60_000,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (hasHydrated && !token) router.replace('/login');
  }, [hasHydrated, token, router]);

  const { data: myProblems } = useQuery({
    queryKey: ['my-problems'],
    queryFn: () => profileApi.myProblems({ limit: 20 }),
    enabled: !!token,
  });

  const { data: mySolutionsRaw } = useQuery({
    queryKey: ['my-solutions'],
    queryFn: () => profileApi.mySolutions({ limit: 50 }),
    enabled: !!token,
  });

  const { data: bookmarks } = useQuery({
    queryKey: ['my-bookmarks'],
    queryFn: () => startupsApi.myBookmarks({ limit: 12 }),
    enabled: !!token,
  });

  const mySolutions: Solution[] = (mySolutionsRaw?.data ?? []).filter(
    (s) => s.submittedById === user?.id,
  );

  async function handleLogout() {
    try {
      await authApi.logout(refreshToken);
    } catch {
      /* ignore */
    }
    clearAuth();
    toast.success(tn('loggedOut'));
    // Router Cache'ni bekor qilamiz — kirgan davrida keshlangan himoyalangan
    // sahifalar chiqqandan keyin ham ko'rinib qolmasin.
    navigateAfterAuthChange('/login');
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await authApi.deleteAccount();
      clearAuth();
      toast.success(t('delete.done'));
      navigateAfterAuthChange('/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  if (!user) return null;

  // Viloyat bazada kanonik (o'zbekcha) qiymat — ko'rsatishda joriy tilga
  const userRegionKey = regionKey(user.region);
  const details = [
    user.age != null && { icon: User, tint: 'bg-iris-500', label: t('details.age'), value: String(user.age) },
    user.region && { icon: MapPin, tint: 'bg-emerald-400', label: t('details.region'), value: userRegionKey ? tr(userRegionKey) : user.region },
    user.district && { icon: MapPin, tint: 'bg-emerald-400', label: t('details.district'), value: user.district },
    user.school && { icon: School, tint: 'bg-iris-500', label: t('details.school'), value: user.school },
    user.grade != null && { icon: School, tint: 'bg-iris-500', label: t('details.grade'), value: t('details.gradeValue', { grade: String(user.grade) }) },
    user.university && { icon: BookOpen, tint: 'bg-accent-500', label: t('details.university'), value: user.university },
    user.course != null && { icon: BookOpen, tint: 'bg-accent-500', label: t('details.course'), value: t('details.courseValue', { course: String(user.course) }) },
  ].filter(Boolean) as { icon: typeof User; tint: string; label: string; value: string }[];

  const problems = myProblems?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Sarlavha + sozlamalar (iOS: o'ngda tishli g'ildirak) */}
      <header className="flex items-start justify-between gap-4">
        <h1 className="text-large-title font-bold tracking-tight text-brand-900">{t('title')}</h1>
        <Link
          href="/settings"
          aria-label={t('settings')}
          className="tappable hv-pop mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-accent-50 text-accent-600 hover:bg-accent-100"
        >
          <Settings className="h-[21px] w-[21px]" />
        </Link>
      </header>

      {/* ── Shaxs kartasi — iOS Kontaktlar: markazda avatar va ism ─────── */}
      <section className="rounded-ios-2xl bg-white px-6 pb-6 pt-8 text-center shadow-card">
        <Avatar src={user.avatarUrl} name={user.fullName} size={96} className="mx-auto" />

        <h2 className="mt-4 flex items-center justify-center gap-1.5 text-title-1 font-semibold tracking-tight text-brand-900">
          {user.fullName}
          {user.isVerified && <VerifiedBadge size={20} />}
        </h2>

        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-subhead text-slate-500">
          {user.username && <span>@{user.username}</span>}
          {user.isEmailVerified && (
            <span
              title={t('emailVerified')}
              aria-label={t('emailVerified')}
              className="inline-flex items-center gap-1 text-accent-600"
            >
              <CheckCircleFill className="h-4 w-4" />
            </span>
          )}
        </div>

        {user.headline && <p className="mt-2 text-callout text-slate-600">{user.headline}</p>}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-caption-1 font-medium ${ROLE_BADGE[user.role]}`}
          >
            {tl.has(`role.${user.role}`) ? tl(`role.${user.role}`) : user.role}
          </span>
          {user.isFounder && <FounderBadge />}
        </div>

        {/* Sanoqlar — ustunli iOS bloki */}
        <div className="mx-auto mt-6 grid max-w-xs grid-cols-2 overflow-hidden rounded-ios-lg bg-surface-soft [&>*:nth-child(2)]:border-l [&>*]:border-slate-200">
          <div className="px-4 py-3">
            <p className="text-title-2 font-semibold tabular-nums text-brand-900">
              {fmt(user.followerCount ?? 0)}
            </p>
            <p className="text-footnote text-slate-500">
              {t('followers', { count: user.followerCount ?? 0 })}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-title-2 font-semibold tabular-nums text-brand-900">
              {fmt(user.followingCount ?? 0)}
            </p>
            <p className="text-footnote text-slate-500">
              {t('following', { count: user.followingCount ?? 0 })}
            </p>
          </div>
        </div>

        {user.username ? (
          <Link
            href={`/u/${user.username}`}
            className="tappable mt-5 inline-flex items-center gap-0.5 text-body font-medium text-accent-700"
          >
            {t('viewPublic')}
            <ChevronRight className="h-[15px] w-[15px]" strokeWidth={3} />
          </Link>
        ) : (
          <Link
            href="/settings"
            className="tappable mt-5 inline-flex items-center gap-0.5 text-body font-medium text-accent-700"
          >
            {t('setUsername')}
            <ChevronRight className="h-[15px] w-[15px]" strokeWidth={3} />
          </Link>
        )}
      </section>

      {/* ── Ma'lumotlar — inset grouped list ───────────────────────────── */}
      {details.length > 0 && (
        <section>
          <h2 className="ios-section-header">{t('details.title')}</h2>
          <div className="ios-list" style={{ ['--row-inset' as string]: '3.5rem' }}>
            {details.map(({ icon: Icon, tint, label, value }) => (
              <div key={label} className="ios-row">
                <span
                  className={`flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[7px] text-white ${tint}`}
                >
                  <Icon className="h-[17px] w-[17px]" />
                </span>
                <span className="flex-1 text-body text-brand-900">{label}</span>
                <span className="max-w-[55%] truncate text-body text-slate-500">{value}</span>
              </div>
            ))}
            <div className="ios-row">
              <span className="flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[7px] bg-accent-500 text-white">
                <User className="h-[17px] w-[17px]" />
              </span>
              <span className="flex-1 text-body text-brand-900">{t('details.email')}</span>
              <span className="max-w-[55%] truncate text-body text-slate-500">{user.email}</span>
            </div>
          </div>
        </section>
      )}

      {/* ── Saqlangan startaplar ───────────────────────────────────────── */}
      {(bookmarks?.data?.length ?? 0) > 0 && (
        <section>
          <h2 className="ios-section-header">
            {t('saved', { n: fmt(bookmarks?.meta.total ?? 0) })}
          </h2>
          <div className="grid-rise grid grid-cols-1 gap-5 sm:grid-cols-2">
            {bookmarks?.data.map((s) => <StartupCard key={s.id} startup={s} />)}
          </div>
        </section>
      )}

      {/* ── Mening muammolarim — iOS ro'yxati ──────────────────────────── */}
      <section>
        <h2 className="ios-section-header">
          {t('problems.title', { n: fmt(myProblems?.meta.total ?? 0) })}
        </h2>

        {myProblems === undefined ? (
          <ListRowSkeleton rows={3} />
        ) : problems.length === 0 ? (
          <EmptyState
            icon={<FileText />}
            title={t('problems.empty')}
            action={
              <Link
                href="/problems/create"
                className="tappable flex h-10 items-center rounded-full bg-accent-600 px-5 text-subhead font-semibold text-white active:bg-accent-700"
              >
                {t('problems.create')}
              </Link>
            }
          />
        ) : (
          <div className="ios-list">
            {problems.map((p) => (
              <Link key={p.id} href={`/problems/${p.id}`} className="ios-row">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body text-brand-900">{p.title}</span>
                  <span className="mt-0.5 flex items-center gap-2 text-footnote text-slate-500">
                    <span className="flex items-center gap-1 tabular-nums">
                      <Eye className="h-3.5 w-3.5" /> {fmt(p.viewCount)}
                    </span>
                    <span className="truncate">
                      {timeAgo(p.createdAt)}
                    </span>
                  </span>
                </span>
                <ProblemStatusPill status={p.status} className="shrink-0" />
                <ChevronRight className="ios-chevron h-[15px] w-[15px] shrink-0 text-slate-300" strokeWidth={3} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Mening yechimlarim ─────────────────────────────────────────── */}
      {mySolutions.length > 0 && (
        <section>
          <h2 className="ios-section-header">
            {t('solutions.title', { n: fmt(mySolutions.length) })}
          </h2>
          <div className="ios-list">
            {mySolutions.map((s) => (
              <Link
                key={s.id}
                href={s.problem ? `/problems/${s.problem.id}` : '#'}
                className="ios-row"
              >
                <span className="min-w-0 flex-1">
                  {s.problem && (
                    <span className="block truncate text-footnote text-slate-500">
                      {s.problem.title}
                    </span>
                  )}
                  <span className="line-clamp-2 block text-body text-brand-900">{s.content}</span>
                </span>
                {/* Moderatsiya bekor — hamjamiyat "Foydali" bahosi ko'rsatiladi */}
                <span
                  title={t('solutions.helpful', {
                    count: s.helpfulCount ?? 0,
                    n: fmt(s.helpfulCount ?? 0),
                  })}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-50 px-2.5 py-1 text-caption-1 font-medium text-accent-700"
                >
                  <Lightbulb className="h-3 w-3" />
                  {fmt(s.helpfulCount ?? 0)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Amallar — iOS Sozlamalar guruhi (destruktiv alohida) ───────── */}
      <section className="space-y-5 pt-1">
        <div className="ios-list">
          {/* Obuna — VAQTINCHA o'chiq bo'lim (flag `false` bo'lsa qator umuman yo'q) */}
          {BILLING_ENABLED && (
            <Link href="/billing" className="ios-row">
              <span className="flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[7px] bg-accent-600 text-white">
                <Wallet className="h-[17px] w-[17px]" />
              </span>
              <span className="flex-1 text-body text-brand-900">{t('actions.billing')}</span>
              <ChevronRight className="ios-chevron h-[15px] w-[15px] shrink-0 text-slate-300" strokeWidth={3} />
            </Link>
          )}
          {/* Bog'lanish so'rovlari — faqat kelgan bo'lsa ko'rinadi */}
          {(pendingIntros?.count ?? 0) > 0 && (
            <Link href="/profile/intro-requests" className="ios-row">
              <span className="flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[7px] bg-indigo-500 text-white">
                <MailOpen className="h-[17px] w-[17px]" />
              </span>
              <span className="flex-1 text-body text-brand-900">
                {t('actions.introRequests')}
              </span>
              <span className="rounded-full bg-accent-600 px-2 py-0.5 text-caption-2 font-semibold text-white">
                {pendingIntros?.count}
              </span>
              <ChevronRight className="ios-chevron h-[15px] w-[15px] shrink-0 text-slate-300" strokeWidth={3} />
            </Link>
          )}
          {/* Investor kabineti — profil ochgan foydalanuvchilarga */}
          {investorMe?.profile && (
            <Link href="/investor" className="ios-row">
              <span className="flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[7px] bg-indigo-600 text-white">
                <Briefcase className="h-[17px] w-[17px]" />
              </span>
              <span className="flex-1 text-body text-brand-900">{t('actions.investor')}</span>
              {(investorMe.newMatches ?? 0) > 0 && (
                <span className="rounded-full bg-accent-600 px-2 py-0.5 text-caption-2 font-semibold text-white">
                  {investorMe.newMatches}
                </span>
              )}
              <ChevronRight className="ios-chevron h-[15px] w-[15px] shrink-0 text-slate-300" strokeWidth={3} />
            </Link>
          )}
          <Link href="/settings" className="ios-row">
            <span className="flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[7px] bg-slate-400 text-white">
              <Settings className="h-[17px] w-[17px]" />
            </span>
            <span className="flex-1 text-body text-brand-900">{t('actions.settings')}</span>
            <ChevronRight className="ios-chevron h-[15px] w-[15px] shrink-0 text-slate-300" strokeWidth={3} />
          </Link>
          <button onClick={handleLogout} className="ios-row w-full text-left">
            <span className="flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[7px] bg-amber-500 text-white">
              <LogOut className="h-[17px] w-[17px]" />
            </span>
            <span className="flex-1 text-body text-brand-900">{t('actions.logout')}</span>
          </button>
        </div>

        <div className="ios-list">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="ios-row w-full justify-center text-center"
          >
            <span className="text-body text-rose-600">{t('actions.deleteAccount')}</span>
          </button>
        </div>
        <p className="px-4 text-footnote text-slate-500">
          {t('actions.deleteNote')}
        </p>
      </section>

      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} className="max-w-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[13px] bg-rose-50">
          <Trash2 className="h-7 w-7 text-rose-600" />
        </div>
        <h3 className="mb-2 text-center text-title-3 font-semibold text-brand-900">
          {t('delete.title')}
        </h3>
        <p className="mb-6 text-center text-subhead leading-relaxed text-slate-500">
          {t('delete.text')}
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setShowDeleteConfirm(false)}>
            {tc('cancel')}
          </Button>
          <Button variant="danger" fullWidth loading={deleting} onClick={handleDeleteAccount}>
            {t('delete.confirm')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
