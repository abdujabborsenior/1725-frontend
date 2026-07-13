'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  User, Mail, MapPin, School, BookOpen, Lightbulb,
  FileQuestion, Eye, Clock, LogOut, Trash2,
  ShieldCheck, Bookmark, Settings,
} from 'lucide-react';
import { profileApi, authApi, startupsApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { Solution } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Avatar } from '@/components/ui/avatar';
import { ProblemStatusBadge } from '@/components/ui/badge';
import { StartupCard } from '@/components/startups/startup-card';
import { ListRowSkeleton } from '@/components/ui/skeleton';
import { ROLE_LABEL, ROLE_BADGE } from '@/lib/constants';
import { FounderBadge } from '@/components/social/founder-badge';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

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
    try { await authApi.logout(refreshToken); } catch { /* ignore */ }
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
    user.age != null && { icon: User, label: 'Yosh', value: String(user.age) },
    user.region && { icon: MapPin, label: 'Viloyat', value: user.region },
    user.district && { icon: MapPin, label: 'Tuman', value: user.district },
    user.school && { icon: School, label: 'Maktab', value: user.school },
    user.grade != null && { icon: School, label: 'Sinf', value: `${user.grade}-sinf` },
    user.university && { icon: BookOpen, label: 'Universitet', value: user.university },
    user.course != null && { icon: BookOpen, label: 'Kurs', value: `${user.course}-kurs` },
  ].filter(Boolean) as { icon: typeof User; label: string; value: string }[];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-brand-900">Profil</h1>

      {/* Profile card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-card">
        <div className="flex items-start gap-5">
          <Avatar src={user.avatarUrl} name={user.fullName} size={80} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-brand-900">{user.fullName}</h2>
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${ROLE_BADGE[user.role]}`}>
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
              {user.isFounder && <FounderBadge />}
              {user.isEmailVerified && (
                <span className="flex items-center gap-1 text-[11px] text-accent-700 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" /> Tasdiqlangan
                </span>
              )}
            </div>
            {user.username && <p className="text-sm text-slate-500">@{user.username}</p>}
            {user.headline && <p className="text-sm font-medium text-brand-800 mt-1">{user.headline}</p>}
            <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {user.email}
            </p>
            {/* Follower / following */}
            <div className="mt-2 flex items-center gap-5">
              <span><span className="font-black text-brand-900">{(user.followerCount ?? 0).toLocaleString('uz')}</span> <span className="text-sm text-slate-500">obunachi</span></span>
              <span><span className="font-black text-brand-900">{(user.followingCount ?? 0).toLocaleString('uz')}</span> <span className="text-sm text-slate-500">obuna</span></span>
            </div>
            {user.username && (
              <Link href={`/u/${user.username}`} className="mt-2 inline-block text-xs font-semibold text-iris-700 hover:underline">
                Ommaviy profilni ko&apos;rish →
              </Link>
            )}
            {!user.username && (
              <Link href="/settings" className="mt-2 inline-block text-xs font-semibold text-accent-700 hover:underline">
                Username o&apos;rnating →
              </Link>
            )}
          </div>
        </div>

        {details.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-2 md:grid-cols-3 gap-4">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide flex items-center gap-1">
                  <Icon className="h-3 w-3" /> {label}
                </span>
                <span className="text-sm font-semibold text-brand-900 truncate">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved startups */}
      {(bookmarks?.data?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-base font-bold text-brand-900 mb-4 flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-accent-600" />
            Saqlangan startaplar
            <span className="text-xs text-slate-400 font-normal">({bookmarks?.meta.total ?? 0})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks?.data.map((s) => (
              <StartupCard key={s.id} startup={s} />
            ))}
          </div>
        </div>
      )}

      {/* My problems */}
      <div>
        <h2 className="text-base font-bold text-brand-900 mb-4 flex items-center gap-2">
          <FileQuestion className="h-4 w-4 text-accent-600" />
          Mening muammolarim
          <span className="text-xs text-slate-400 font-normal">({myProblems?.meta.total ?? 0})</span>
        </h2>

        {myProblems === undefined ? (
          // Yuklanish paytida bo'sh holat chiqib ketmasin — qator skeletonlari
          <ListRowSkeleton rows={3} />
        ) : (myProblems?.data ?? []).length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <FileQuestion className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Hali muammo yubormagansiz</p>
            <Link href="/problems/create" className="mt-4 inline-block">
              <Button size="sm" variant="accent">Muammo qoldirish</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(myProblems?.data ?? []).map((p) => (
              <Link key={p.id} href={`/problems/${p.id}`}>
                <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-accent-300 hover:shadow-card transition-all group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand-900 group-hover:text-accent-700 transition-colors truncate">
                        {p.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{p.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <ProblemStatusBadge status={p.status} className="px-2 py-0.5 text-[10px]" />
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" /> {p.viewCount}</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* My solutions */}
      {mySolutions.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-brand-900 mb-4 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            Mening yechimlarim
            <span className="text-xs text-slate-400 font-normal">({mySolutions.length})</span>
          </h2>
          <div className="space-y-3">
            {mySolutions.map((s) => (
              <Link key={s.id} href={s.problem ? `/problems/${s.problem.id}` : '#'}>
                <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-accent-300 hover:shadow-card transition-all group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {s.problem && (
                        <p className="text-xs text-slate-500 mb-1 truncate">{s.problem.title}</p>
                      )}
                      <p className="text-sm text-slate-700 line-clamp-2">{s.content}</p>
                    </div>
                    {/* Moderatsiya bekor — hamjamiyat "Foydali" bahosi ko'rsatiladi */}
                    <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-accent-200 bg-accent-50 px-2 py-0.5 text-[10px] font-semibold text-accent-700">
                      <Lightbulb className="h-2.5 w-2.5" />
                      {(s.helpfulCount ?? 0).toLocaleString('uz')} foydali
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {/* flex-1 faqat sm+ (row) da: flex-col ichida flex-basis:0 tugma balandligini
          matn balandligigacha yiqitib yuboradi (mobil "ingichka tugma" bugi) */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link href="/settings" className="sm:flex-1">
          <Button variant="outline" size="lg" fullWidth>
            <Settings className="h-4 w-4" /> Sozlamalar
          </Button>
        </Link>
        <Button variant="outline" size="lg" fullWidth onClick={handleLogout} className="sm:flex-1">
          <LogOut className="h-4 w-4" /> Chiqish
        </Button>
        <Button variant="danger" size="lg" fullWidth onClick={() => setShowDeleteConfirm(true)} className="sm:flex-1">
          <Trash2 className="h-4 w-4" /> Hisobni o&apos;chirish
        </Button>
      </div>

      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} className="max-w-sm">
        <div className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="h-7 w-7 text-rose-600" />
        </div>
        <h3 className="text-lg font-bold text-brand-900 text-center mb-2">Hisobni o&apos;chirish</h3>
        <p className="text-sm text-slate-600 text-center leading-relaxed mb-6">
          Hisobingiz 30 kun davomida saqlanib turadi. Shu muddat ichida qayta
          kirganingizda tiklash mumkin.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setShowDeleteConfirm(false)}>
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
