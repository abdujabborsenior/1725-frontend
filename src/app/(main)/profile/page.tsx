'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
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
} from '@/components/icons';
import { profileApi, authApi, startupsApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { Solution } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Avatar } from '@/components/ui/avatar';
import { ProblemStatusPill } from '@/components/ui/badge';
import { StartupCard } from '@/components/startups/startup-card';
import { ListRowSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/page-header';
import { ROLE_LABEL, ROLE_BADGE } from '@/lib/constants';
import { FounderBadge } from '@/components/social/founder-badge';
import { timeAgo } from '@/lib/date';
import toast from 'react-hot-toast';

/**
 * Shaxsiy profil — iOS Sozlamalar/Kontaktlar ritmida:
 * markazlashgan avatar-sarlavha, inset-grouped ro'yxatlar, amallar esa
 * iOS'dagi kabi alohida guruhlarda (destruktiv — qizil, markazda).
 */
export default function ProfilePage() {
  const router = useRouter();
  const { user, token, refreshToken, hasHydrated, clearAuth } = useAuthStore();
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
    toast.success('Tizimdan chiqdingiz');
    router.push('/login');
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await authApi.deleteAccount();
      clearAuth();
      toast.success("Hisob o'chirishga yuborildi. 30 kun ichida qayta tiklash mumkin.");
      router.push('/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  if (!user) return null;

  const details = [
    user.age != null && { icon: User, tint: 'bg-slate-400', label: 'Yosh', value: String(user.age) },
    user.region && { icon: MapPin, tint: 'bg-emerald-400', label: 'Viloyat', value: user.region },
    user.district && { icon: MapPin, tint: 'bg-emerald-400', label: 'Tuman', value: user.district },
    user.school && { icon: School, tint: 'bg-iris-500', label: 'Maktab', value: user.school },
    user.grade != null && { icon: School, tint: 'bg-iris-500', label: 'Sinf', value: `${user.grade}-sinf` },
    user.university && { icon: BookOpen, tint: 'bg-accent-500', label: 'Universitet', value: user.university },
    user.course != null && { icon: BookOpen, tint: 'bg-accent-500', label: 'Kurs', value: `${user.course}-kurs` },
  ].filter(Boolean) as { icon: typeof User; tint: string; label: string; value: string }[];

  const problems = myProblems?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Sarlavha + sozlamalar (iOS: o'ngda tishli g'ildirak) */}
      <header className="flex items-start justify-between gap-4">
        <h1 className="text-large-title font-bold tracking-tight text-brand-900">Profil</h1>
        <Link
          href="/settings"
          aria-label="Sozlamalar"
          className="tappable mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-fill-tertiary text-slate-600"
        >
          <Settings className="h-[21px] w-[21px]" />
        </Link>
      </header>

      {/* ── Shaxs kartasi — iOS Kontaktlar: markazda avatar va ism ─────── */}
      <section className="rounded-ios-2xl bg-white px-6 pb-6 pt-8 text-center shadow-card">
        <Avatar src={user.avatarUrl} name={user.fullName} size={96} className="mx-auto" />

        <h2 className="mt-4 text-title-1 font-semibold tracking-tight text-brand-900">
          {user.fullName}
        </h2>

        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-subhead text-slate-500">
          {user.username && <span>@{user.username}</span>}
          {user.isEmailVerified && (
            <span className="inline-flex items-center gap-1 text-accent-600">
              <CheckCircleFill className="h-4 w-4" />
            </span>
          )}
        </div>

        {user.headline && <p className="mt-2 text-callout text-slate-600">{user.headline}</p>}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-caption-1 font-medium ${ROLE_BADGE[user.role]}`}
          >
            {ROLE_LABEL[user.role] ?? user.role}
          </span>
          {user.isFounder && <FounderBadge />}
        </div>

        {/* Sanoqlar — ustunli iOS bloki */}
        <div className="mx-auto mt-6 grid max-w-xs grid-cols-2 overflow-hidden rounded-ios-lg bg-surface-soft [&>*:nth-child(2)]:border-l [&>*]:border-slate-200">
          <div className="px-4 py-3">
            <p className="text-title-2 font-semibold tabular-nums text-brand-900">
              {(user.followerCount ?? 0).toLocaleString('uz')}
            </p>
            <p className="text-footnote text-slate-500">obunachi</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-title-2 font-semibold tabular-nums text-brand-900">
              {(user.followingCount ?? 0).toLocaleString('uz')}
            </p>
            <p className="text-footnote text-slate-500">obuna</p>
          </div>
        </div>

        {user.username ? (
          <Link
            href={`/u/${user.username}`}
            className="tappable mt-5 inline-flex items-center gap-0.5 text-body font-medium text-accent-700"
          >
            Ommaviy profilni ko&apos;rish
            <ChevronRight className="h-[15px] w-[15px]" strokeWidth={3} />
          </Link>
        ) : (
          <Link
            href="/settings"
            className="tappable mt-5 inline-flex items-center gap-0.5 text-body font-medium text-accent-700"
          >
            Username o&apos;rnating
            <ChevronRight className="h-[15px] w-[15px]" strokeWidth={3} />
          </Link>
        )}
      </section>

      {/* ── Ma'lumotlar — inset grouped list ───────────────────────────── */}
      {details.length > 0 && (
        <section>
          <h2 className="ios-section-header">Ma&apos;lumotlar</h2>
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
              <span className="flex-1 text-body text-brand-900">Email</span>
              <span className="max-w-[55%] truncate text-body text-slate-500">{user.email}</span>
            </div>
          </div>
        </section>
      )}

      {/* ── Saqlangan startaplar ───────────────────────────────────────── */}
      {(bookmarks?.data?.length ?? 0) > 0 && (
        <section>
          <h2 className="ios-section-header">
            Saqlangan startaplar · {bookmarks?.meta.total ?? 0}
          </h2>
          <div className="grid-rise grid grid-cols-1 gap-5 sm:grid-cols-2">
            {bookmarks?.data.map((s) => <StartupCard key={s.id} startup={s} />)}
          </div>
        </section>
      )}

      {/* ── Mening muammolarim — iOS ro'yxati ──────────────────────────── */}
      <section>
        <h2 className="ios-section-header">Mening muammolarim · {myProblems?.meta.total ?? 0}</h2>

        {myProblems === undefined ? (
          <ListRowSkeleton rows={3} />
        ) : problems.length === 0 ? (
          <EmptyState
            icon={<FileText />}
            title="Hali muammo yubormagansiz"
            action={
              <Link
                href="/problems/create"
                className="tappable flex h-10 items-center rounded-full bg-accent-600 px-5 text-subhead font-semibold text-white active:bg-accent-700"
              >
                Muammo qoldirish
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
                      <Eye className="h-3.5 w-3.5" /> {p.viewCount}
                    </span>
                    <span className="truncate">
                      {timeAgo(p.createdAt)}
                    </span>
                  </span>
                </span>
                <ProblemStatusPill status={p.status} className="shrink-0" />
                <ChevronRight className="h-[15px] w-[15px] shrink-0 text-slate-300" strokeWidth={3} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Mening yechimlarim ─────────────────────────────────────────── */}
      {mySolutions.length > 0 && (
        <section>
          <h2 className="ios-section-header">Mening yechimlarim · {mySolutions.length}</h2>
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
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-50 px-2.5 py-1 text-caption-1 font-medium text-accent-700">
                  <Lightbulb className="h-3 w-3" />
                  {(s.helpfulCount ?? 0).toLocaleString('uz')}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Amallar — iOS Sozlamalar guruhi (destruktiv alohida) ───────── */}
      <section className="space-y-5 pt-1">
        <div className="ios-list">
          <Link href="/settings" className="ios-row">
            <span className="flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[7px] bg-slate-400 text-white">
              <Settings className="h-[17px] w-[17px]" />
            </span>
            <span className="flex-1 text-body text-brand-900">Sozlamalar</span>
            <ChevronRight className="h-[15px] w-[15px] shrink-0 text-slate-300" strokeWidth={3} />
          </Link>
          <button onClick={handleLogout} className="ios-row w-full text-left">
            <span className="flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[7px] bg-amber-500 text-white">
              <LogOut className="h-[17px] w-[17px]" />
            </span>
            <span className="flex-1 text-body text-brand-900">Chiqish</span>
          </button>
        </div>

        <div className="ios-list">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="ios-row w-full justify-center text-center"
          >
            <span className="text-body text-rose-600">Hisobni o&apos;chirish</span>
          </button>
        </div>
        <p className="px-4 text-footnote text-slate-500">
          Hisob 30 kun ichida qayta kirilsa to&apos;liq tiklanadi.
        </p>
      </section>

      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} className="max-w-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[13px] bg-rose-50">
          <Trash2 className="h-7 w-7 text-rose-600" />
        </div>
        <h3 className="mb-2 text-center text-title-3 font-semibold text-brand-900">
          Hisobni o&apos;chirish
        </h3>
        <p className="mb-6 text-center text-subhead leading-relaxed text-slate-500">
          Hisobingiz 30 kun davomida saqlanib turadi. Shu muddat ichida qayta kirganingizda tiklash
          mumkin.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setShowDeleteConfirm(false)}>
            Bekor qilish
          </Button>
          <Button variant="danger" fullWidth loading={deleting} onClick={handleDeleteAccount}>
            O&apos;chirish
          </Button>
        </div>
      </Modal>
    </div>
  );
}
