'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Rocket, CheckCircle2, FileEdit, Archive, Plus, ArrowRight,
  Users, FileQuestion, Lightbulb, Eye,
} from 'lucide-react';
import { startupsApi, statisticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { StartupStatusBadge } from '@/components/ui/badge';
import { GrowthChart } from '@/components/admin/growth-chart';
import { Avatar } from '@/components/ui/avatar';
import { ROLE_LABEL } from '@/lib/constants';
import { cn } from '@/lib/utils';

function StatCard({
  icon: Icon, label, value, accent,
}: {
  icon: typeof Rocket;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-card-hover transition-all">
      <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center mb-3', accent)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-black text-brand-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const isSuperadmin = user?.role === 'superadmin';

  const { data: published } = useQuery({
    queryKey: ['admin-startups-count', 'published'],
    queryFn: () => startupsApi.list({ status: 'published', limit: 1 }),
  });
  const { data: draft } = useQuery({
    queryKey: ['admin-startups-count', 'draft'],
    queryFn: () => startupsApi.list({ status: 'draft', limit: 1 }),
  });
  const { data: archived } = useQuery({
    queryKey: ['admin-startups-count', 'archived'],
    queryFn: () => startupsApi.list({ status: 'archived', limit: 1 }),
  });
  const { data: recent } = useQuery({
    queryKey: ['admin-startups-recent'],
    queryFn: () => startupsApi.list({ sort: 'newest', limit: 6 }),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-platform-stats'],
    queryFn: () => statisticsApi.dashboard(),
    enabled: isSuperadmin,
    retry: false,
  });

  const { data: growth } = useQuery({
    queryKey: ['admin-growth'],
    queryFn: () => statisticsApi.growth(30),
    enabled: isSuperadmin,
    retry: false,
  });

  const totalStartups =
    (published?.meta.total ?? 0) +
    (draft?.meta.total ?? 0) +
    (archived?.meta.total ?? 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-900">Boshqaruv paneli</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Xush kelibsiz, {user?.fullName?.split(' ')[0]} 👋
          </p>
        </div>
        <Link href="/admin/startups/new">
          <Button variant="accent">
            <Plus className="h-4 w-4" /> Yangi startap
          </Button>
        </Link>
      </div>

      {/* Startup stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Rocket} label="Jami startaplar" value={totalStartups}
          accent="bg-brand-50 text-brand-700" />
        <StatCard icon={CheckCircle2} label="E'lon qilingan" value={published?.meta.total ?? 0}
          accent="bg-accent-50 text-accent-600" />
        <StatCard icon={FileEdit} label="Qoralama" value={draft?.meta.total ?? 0}
          accent="bg-amber-50 text-amber-600" />
        <StatCard icon={Archive} label="Arxivlangan" value={archived?.meta.total ?? 0}
          accent="bg-slate-100 text-slate-500" />
      </div>

      {/* Platform stats (superadmin only) */}
      {isSuperadmin && stats && (
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Platforma statistikasi
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Foydalanuvchilar" value={stats.userStats.total}
              accent="bg-sky-50 text-sky-600" />
            <StatCard icon={FileQuestion} label="Muammolar" value={stats.problemStats.total}
              accent="bg-violet-50 text-violet-600" />
            <StatCard icon={Lightbulb} label="Yechimlar" value={stats.solutionStats.total}
              accent="bg-amber-50 text-amber-600" />
            <StatCard icon={Eye} label="Muammo ko'rishlari" value={stats.problemStats.totalViews}
              accent="bg-emerald-50 text-emerald-600" />
          </div>
        </div>
      )}

      {/* Growth chart (superadmin) */}
      {isSuperadmin && growth && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="font-bold text-brand-900 mb-1">O&apos;sish dinamikasi</h2>
          <p className="text-xs text-slate-400 mb-4">So&apos;nggi 30 kun</p>
          <GrowthChart
            days={30}
            series={[
              { label: 'Foydalanuvchilar', color: '#0ea5e9', points: growth.userGrowth },
              { label: 'Muammolar', color: '#f59e0b', points: growth.problemGrowth },
              { label: 'Yechimlar', color: '#10b981', points: growth.solutionGrowth },
            ]}
          />
        </div>
      )}

      {/* Recent users + recent problems (superadmin) */}
      {isSuperadmin && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-brand-900">So&apos;nggi foydalanuvchilar</h2>
              <Link href="/admin/users" className="text-xs font-semibold text-accent-700 hover:underline flex items-center gap-1">
                Barchasi <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {stats.recentActivity.recentUsers.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={u.fullName} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-900 truncate">{u.fullName}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <span className="text-[11px] text-slate-400">{ROLE_LABEL[u.role as keyof typeof ROLE_LABEL] ?? u.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-brand-900">So&apos;nggi muammolar</h2>
              <Link href="/admin/problems" className="text-xs font-semibold text-accent-700 hover:underline flex items-center gap-1">
                Barchasi <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {stats.recentActivity.recentProblems.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="h-9 w-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <FileQuestion className="h-4 w-4 text-amber-500" />
                  </span>
                  <p className="flex-1 min-w-0 text-sm font-medium text-brand-900 truncate">{p.title}</p>
                  <span className="text-[11px] text-slate-400 shrink-0">{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent startups */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-brand-900">So&apos;nggi startaplar</h2>
          <Link href="/admin/startups"
            className="text-xs font-semibold text-accent-700 hover:underline flex items-center gap-1">
            Barchasi <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recent && recent.data.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recent.data.map((s) => (
              <Link
                key={s.id}
                href={`/admin/startups/${s.id}/edit`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-surface-soft border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {s.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-brand-900">{s.title.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-900 truncate">{s.title}</p>
                  <p className="text-xs text-slate-400 truncate">{s.tagline || s.category || '—'}</p>
                </div>
                <StartupStatusBadge status={s.status} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-14 text-center">
            <Rocket className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Hozircha startaplar yo&apos;q</p>
            <Link href="/admin/startups/new" className="text-sm font-semibold text-accent-700 hover:underline mt-2 inline-block">
              Birinchisini qo&apos;shing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
