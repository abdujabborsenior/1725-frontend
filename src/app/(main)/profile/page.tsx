'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  User, Mail, MapPin, School, BookOpen,
  FileQuestion, Eye, Clock, LogOut, Trash2,
  ShieldCheck, Calendar,
} from 'lucide-react';
import { profileApi, authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { PaginatedResponse, Problem, User as UserType } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

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
const ROLE_LABEL: Record<string, string> = {
  superadmin: 'Superadmin', analyzer: 'Analizator',
  school_student: "Maktab o'quvchisi", university_student: 'Talaba', user: 'Foydalanuvchi',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user: storeUser, token, clearAuth } = useAuthStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: me } = useQuery<UserType>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await profileApi.me();
      return (res.data as { data: UserType }).data;
    },
    enabled: !!token,
    initialData: storeUser ?? undefined,
  });

  const { data: myProblems } = useQuery<PaginatedResponse<Problem>>({
    queryKey: ['my-problems'],
    queryFn: async () => {
      const res = await profileApi.myProblems({ limit: 10 });
      return (res.data as { data: PaginatedResponse<Problem> }).data;
    },
    enabled: !!token,
  });

  useEffect(() => { if (!token) router.replace('/login'); }, [token, router]);

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearAuth();
    toast.success('Tizimdan chiqdingiz');
    router.push('/login');
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await profileApi.deleteAccount();
      clearAuth();
      toast.success('Hisob o\'chirishga yuborildi. 30 kun ichida qayta tiklash mumkin.');
      router.push('/login');
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setDeleting(false);
    }
  }

  const user = me ?? storeUser;
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Profil</h1>

      {/* Profile card */}
      <div className="glass-strong border border-white/[0.08] rounded-3xl p-6 md:p-8">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-2xl bg-gradient-brand flex items-center justify-center text-3xl font-black text-white flex-shrink-0 shadow-glow-brand">
            {user.fullName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-white">{user.fullName}</h2>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-500/15 text-brand-400 border border-brand-400/30">
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
              {user.isEmailVerified && (
                <span className="flex items-center gap-1 text-[11px] text-neon-green">
                  <ShieldCheck className="h-3.5 w-3.5" /> Tasdiqlangan
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {user.email}
            </p>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {format(new Date(user.createdAt), 'dd.MM.yyyy')} da ro&apos;yxatdan o&apos;tgan
            </p>
          </div>
        </div>

        {/* Details */}
        {(user.region || user.age) && (
          <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-2 md:grid-cols-3 gap-4">
            {user.age && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <User className="h-3 w-3" /> Yosh
                </span>
                <span className="text-sm font-semibold text-slate-200">{user.age}</span>
              </div>
            )}
            {user.region && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Viloyat
                </span>
                <span className="text-sm font-semibold text-slate-200">{user.region}</span>
              </div>
            )}
            {user.district && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-600 uppercase tracking-wide">Tuman</span>
                <span className="text-sm font-semibold text-slate-200">{user.district}</span>
              </div>
            )}
            {user.school && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <School className="h-3 w-3" /> Maktab
                </span>
                <span className="text-sm font-semibold text-slate-200">{user.school}</span>
              </div>
            )}
            {user.grade && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-600 uppercase tracking-wide">Sinf</span>
                <span className="text-sm font-semibold text-slate-200">{user.grade}-sinf</span>
              </div>
            )}
            {user.university && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> Universitet
                </span>
                <span className="text-sm font-semibold text-slate-200 truncate">{user.university}</span>
              </div>
            )}
            {user.course && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-600 uppercase tracking-wide">Kurs</span>
                <span className="text-sm font-semibold text-slate-200">{user.course}-kurs</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* My problems */}
      <div>
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <FileQuestion className="h-4 w-4 text-brand-400" />
          Mening muammolarim
          <span className="text-xs text-slate-600 font-normal">
            ({myProblems?.meta.total ?? 0})
          </span>
        </h2>

        {(myProblems?.data ?? []).length === 0 ? (
          <div className="glass border border-white/[0.07] rounded-2xl p-10 text-center">
            <FileQuestion className="h-10 w-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Hali muammo yubormaganmiz</p>
            <Link href="/problems/create" className="mt-4 inline-block">
              <Button size="sm" variant="neon">Muammo yuborish</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(myProblems?.data ?? []).map((p) => (
              <Link key={p.id} href={`/problems/${p.id}`}>
                <div className="glass border border-white/[0.07] rounded-2xl p-4 hover:border-brand-400/20 transition-all group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                        {p.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{p.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={cn('px-2 py-0.5 rounded-lg text-[10px] font-semibold border', STATUS_BADGE[p.status])}>
                        {STATUS_LABEL[p.status]}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-600">
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

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button variant="outline" size="md" onClick={handleLogout} className="flex-1">
          <LogOut className="h-4 w-4" /> Chiqish
        </Button>
        <Button
          variant="danger"
          size="md"
          onClick={() => setShowDeleteConfirm(true)}
          className="flex-1"
        >
          <Trash2 className="h-4 w-4" /> Hisobni o&apos;chirish
        </Button>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-sm glass-strong border border-red-500/20 rounded-3xl p-6 shadow-card animate-slide-up">
            <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-7 w-7 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Hisobni o&apos;chirish</h3>
            <p className="text-sm text-slate-400 text-center leading-relaxed mb-6">
              Hisobingiz 30 kun davomida saqlanib turadi.
              Shu muddat ichida qayta kirganingizda tiklash mumkin.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowDeleteConfirm(false)}>
                Bekor qilish
              </Button>
              <Button variant="danger" fullWidth loading={deleting} onClick={handleDeleteAccount}>
                O&apos;chirish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
