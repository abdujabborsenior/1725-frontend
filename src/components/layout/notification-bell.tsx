'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell, CheckCheck, CheckCircle2, XCircle, Sparkles, Info, Loader2,
} from 'lucide-react';
import { notificationsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import type { AppNotification, NotificationType } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const TYPE_META: Record<NotificationType, { icon: typeof Bell; color: string }> = {
  problem_approved:  { icon: CheckCircle2, color: 'text-accent-600 bg-accent-50' },
  problem_rejected:  { icon: XCircle,      color: 'text-rose-600 bg-rose-50' },
  solution_accepted: { icon: Sparkles,     color: 'text-violet-600 bg-violet-50' },
  solution_rejected: { icon: XCircle,      color: 'text-rose-600 bg-rose-50' },
  system:            { icon: Info,         color: 'text-sky-600 bg-sky-50' },
};

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
    if (!n.isRead) {
      await notificationsApi.markRead(n.id).catch(() => undefined);
      void qc.invalidateQueries({ queryKey: ['notifications-unread'] });
      void qc.invalidateQueries({ queryKey: ['notifications-recent'] });
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  if (!token) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Bildirishnomalar"
        className="relative h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-brand-900 hover:bg-slate-100 transition-all"
      >
        <Bell className="h-[18px] w-[18px]" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold ring-2 ring-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-modal overflow-hidden animate-slide-down z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-bold text-brand-900">Bildirishnomalar</span>
            {count > 0 && (
              <button
                onClick={markAll}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-700 hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Barchasini o&apos;qildim
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="h-5 w-5 text-slate-300 animate-spin" />
              </div>
            ) : list && list.data.length > 0 ? (
              list.data.map((n) => {
                const meta = TYPE_META[n.type] ?? TYPE_META.system;
                const Icon = meta.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => openNotification(n)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0',
                      !n.isRead && 'bg-accent-50/40',
                    )}
                  >
                    <span className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', meta.color)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-brand-900 truncate">{n.title}</span>
                      {n.body && <span className="block text-xs text-slate-500 line-clamp-2">{n.body}</span>}
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </span>
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-accent-500 mt-1.5 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <Bell className="h-7 w-7 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Bildirishnomalar yo&apos;q</p>
              </div>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-center text-xs font-semibold text-brand-900 hover:bg-slate-50 border-t border-slate-100 transition-colors"
          >
            Barchasini ko&apos;rish
          </Link>
        </div>
      )}
    </div>
  );
}
