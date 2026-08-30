'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from '@/components/icons';
import { notificationsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { notificationMeta, notificationTarget } from '@/lib/notification-meta';
import type { AppNotification } from '@/types';
import { timeAgo } from '@/lib/date';

export function NotificationBell() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: unread } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => notificationsApi.unreadCount(),
    enabled: !!token,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const { data: list, isLoading } = useQuery({
    queryKey: ['notifications-recent'],
    queryFn: () => notificationsApi.list({ limit: 8 }),
    enabled: !!token && open,
  });

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const count = unread?.count ?? 0;

  async function markAll() {
    await notificationsApi.markAllRead();
    void qc.invalidateQueries({ queryKey: ['notifications-unread'] });
    void qc.invalidateQueries({ queryKey: ['notifications-recent'] });
  }

  async function openNotification(n: AppNotification) {
    setOpen(false);
    // getById — aynan shu bildirishnomani serverdan olamiz (yangi link bilan) va
    // o'qilgan deb belgilaymiz; shunda doim to'g'ri manzilga o'tamiz.
    let link = n.link;
    try {
      link = (await notificationsApi.getById(n.id)).link;
    } catch {
      if (!n.isRead) await notificationsApi.markRead(n.id).catch(() => undefined);
    }
    void qc.invalidateQueries({ queryKey: ['notifications-unread'] });
    void qc.invalidateQueries({ queryKey: ['notifications-recent'] });
    void qc.invalidateQueries({ queryKey: ['notifications'] });
    // Noma'lum/yaroqsiz havolada 404 chiqmasligi uchun xavfsiz manzilga aylantiramiz
    const target = notificationTarget(link);
    if (target) router.push(target);
  }

  if (!token) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Bildirishnomalar"
        className="tappable relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600"
      >
        <Bell className="h-[22px] w-[22px]" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-caption-2 font-semibold text-white ring-2 ring-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="material-menu absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] origin-top-right animate-scale-in overflow-hidden rounded-ios-lg shadow-modal ring-1 ring-black/[0.06]">
          <div className="hairline-b flex items-center justify-between gap-2 px-4 py-2.5">
            <span className="text-subhead font-semibold text-brand-900">Bildirishnomalar</span>
            {count > 0 && (
              <button
                onClick={markAll}
                className="tappable inline-flex items-center gap-1 text-footnote font-medium text-accent-700"
              >
                <CheckCheck className="h-4 w-4" /> Barchasini o&apos;qildim
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 px-4 py-3.5">
                    <div className="skeleton h-[29px] w-[29px] shrink-0 rounded-[7px]" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="skeleton h-3.5 w-1/2 rounded-md" />
                      <div className="skeleton h-3 w-3/4 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : list && list.data.length > 0 ? (
              list.data.map((n) => {
                const meta = notificationMeta(n.type);
                const Icon = meta.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => openNotification(n)}
                    className={cn(
                      'hairline-b flex w-full items-start gap-3 px-4 py-3 text-left hv-row',
                      !n.isRead && 'bg-accent-50/50 hover:bg-accent-50',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[7px]',
                        meta.color,
                      )}
                    >
                      <Icon className="h-[17px] w-[17px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-subhead font-medium text-brand-900">
                        {n.title}
                      </span>
                      {n.body && (
                        <span className="line-clamp-2 block text-footnote text-slate-500">{n.body}</span>
                      )}
                      <span className="mt-0.5 block text-caption-2 text-slate-500">
                        {timeAgo(n.createdAt)}
                      </span>
                    </span>
                    {!n.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <Bell className="mx-auto mb-2 h-8 w-8 text-accent-300" />
                <p className="text-subhead text-slate-500">Bildirishnomalar yo&apos;q</p>
              </div>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="hairline-t block px-4 py-3 text-center text-subhead font-medium text-accent-700 hv-row"
          >
            Barchasini ko&apos;rish
          </Link>
        </div>
      )}
    </div>
  );
}
