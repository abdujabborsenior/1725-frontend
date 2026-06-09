'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Bell, CheckCheck, CheckCircle2, XCircle, Sparkles, Info,
} from 'lucide-react';
import { notificationsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import type { AppNotification, NotificationType } from '@/types';
import { Pagination } from '@/components/ui/pagination';
import { formatDistanceToNow } from 'date-fns';

const TYPE_META: Record<NotificationType, { icon: typeof Bell; color: string }> = {
  problem_approved:  { icon: CheckCircle2, color: 'text-accent-600 bg-accent-50' },
  problem_rejected:  { icon: XCircle,      color: 'text-rose-600 bg-rose-50' },
  solution_accepted: { icon: Sparkles,     color: 'text-violet-600 bg-violet-50' },
  solution_rejected: { icon: XCircle,      color: 'text-rose-600 bg-rose-50' },
  system:            { icon: Info,         color: 'text-sky-600 bg-sky-50' },
};

export default function NotificationsPage() {
  const { token, hasHydrated } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (hasHydrated && !token) router.replace('/login');
  }, [hasHydrated, token, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationsApi.list({ page, limit: 20 }),
    enabled: !!token,
    placeholderData: keepPreviousData,
  });

  function invalidate() {
    void qc.invalidateQueries({ queryKey: ['notifications'] });
    void qc.invalidateQueries({ queryKey: ['notifications-unread'] });
    void qc.invalidateQueries({ queryKey: ['notifications-recent'] });
  }

  async function markAll() {
    await notificationsApi.markAllRead();
    invalidate();
  }

  async function open(n: AppNotification) {
    if (!n.isRead) {
      await notificationsApi.markRead(n.id).catch(() => undefined);
      invalidate();
    }
    if (n.link) router.push(n.link);
  }

  const items = data?.data ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Bildirishnomalar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Jami {data?.meta.total ?? '—'} ta</p>
        </div>
        <button
          onClick={markAll}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:text-brand-900 hover:border-slate-300 transition-all"
        >
          <CheckCheck className="h-4 w-4" /> Barchasini o&apos;qildim
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 px-5 py-4 animate-pulse">
                <div className="h-9 w-9 rounded-lg bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 bg-slate-100 rounded" />
                  <div className="h-3 w-3/4 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <Bell className="h-9 w-9 text-slate-300 mx-auto mb-3" />
            <p className="text-brand-900 font-semibold">Bildirishnomalar yo&apos;q</p>
            <p className="text-sm text-slate-500 mt-1">
              Yangiliklar shu yerda paydo bo&apos;ladi
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((n) => {
              const meta = TYPE_META[n.type] ?? TYPE_META.system;
              const Icon = meta.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => open(n)}
                  className={cn(
                    'w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors',
                    !n.isRead && 'bg-accent-50/40',
                  )}
                >
                  <span className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', meta.color)}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-brand-900">{n.title}</span>
                    {n.body && <span className="block text-sm text-slate-600 mt-0.5">{n.body}</span>}
                    <span className="block text-[11px] text-slate-400 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </span>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-accent-500 mt-1.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!isLoading && items.length > 0 && (
        <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} />
      )}
    </div>
  );
}
