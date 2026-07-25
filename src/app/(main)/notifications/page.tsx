'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Bell, CheckCheck } from '@/components/icons';
import { notificationsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { notificationMeta, notificationTarget } from '@/lib/notification-meta';
import type { AppNotification } from '@/types';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState, PageHeader } from '@/components/ui/page-header';
import { formatDistanceToNow } from 'date-fns';

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
    // getById — serverdan aynan shu bildirishnomani (yangi link bilan) olamiz va
    // o'qilgan deb belgilaymiz; shunda doim to'g'ri manzilga o'tamiz.
    let link = n.link;
    try {
      link = (await notificationsApi.getById(n.id)).link;
    } catch {
      if (!n.isRead) await notificationsApi.markRead(n.id).catch(() => undefined);
    }
    invalidate();
    // Noma'lum/yaroqsiz havolada 404 chiqmasligi uchun xavfsiz manzilga aylantiramiz
    const target = notificationTarget(link);
    if (target) router.push(target);
  }

  const items = data?.data ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Bildirishnomalar"
        subtitle={`Jami ${data?.meta.total ?? '—'} ta`}
        action={
          <button
            onClick={markAll}
            className="tappable inline-flex h-9 items-center gap-1.5 rounded-full bg-fill-tertiary px-3.5 text-subhead font-medium text-slate-600"
          >
            <CheckCheck className="h-4 w-4" /> O&apos;qildim
          </button>
        }
      />

      {isLoading ? (
        <div className="ios-list" style={{ ['--row-inset' as string]: '3.75rem' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 px-4 py-3.5">
              <div className="skeleton h-[29px] w-[29px] shrink-0 rounded-[7px]" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/2 rounded-md" />
                <div className="skeleton h-3 w-3/4 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Bell />}
          title="Bildirishnomalar yo'q"
          description="Yangiliklar shu yerda paydo bo'ladi"
        />
      ) : (
        <div className="ios-list" style={{ ['--row-inset' as string]: '3.75rem' }}>
            {items.map((n) => {
              const meta = notificationMeta(n.type);
              const Icon = meta.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => open(n)}
                  className={cn('ios-row w-full items-start text-left', !n.isRead && 'bg-accent-50/50')}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[7px]',
                      meta.color,
                    )}
                  >
                    <Icon className="h-[17px] w-[17px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-body text-brand-900">{n.title}</span>
                    {n.body && (
                      <span className="mt-0.5 block text-subhead text-slate-500">{n.body}</span>
                    )}
                    <span className="mt-1 block text-caption-1 text-slate-400">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </span>
                  {!n.isRead && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                  )}
                </button>
              );
            })}
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} />
      )}
    </div>
  );
}
