'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Plus, Search, Pencil, Trash2, Eye, Sparkles, Send, Archive, Undo2, ExternalLink,
} from 'lucide-react';
import { startupsApi, getErrorMessage } from '@/lib/api';
import { STARTUP_STATUS_LABEL, PLATFORM_ORDER } from '@/lib/constants';
import type { Startup, StartupStatus } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { useDebounce } from '@/lib/use-debounce';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StartupStatusBadge } from '@/components/ui/badge';
import { PlatformIcon } from '@/components/startups/platform';
import toast from 'react-hot-toast';

const STATUS_TABS: { value: StartupStatus | ''; label: string }[] = [
  { value: '', label: 'Barchasi' },
  { value: 'published', label: STARTUP_STATUS_LABEL.published },
  { value: 'draft', label: STARTUP_STATUS_LABEL.draft },
  { value: 'archived', label: STARTUP_STATUS_LABEL.archived },
];

export default function AdminStartupsPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const canDelete = user?.role === 'superadmin';
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StartupStatus | ''>('');
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState<Startup | null>(null);

  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-startups', { page, status, search: debouncedSearch }],
    queryFn: () =>
      startupsApi.list({
        page,
        limit: 10,
        status: status || undefined,
        search: debouncedSearch || undefined,
        sort: 'newest',
      }),
    placeholderData: keepPreviousData,
  });

  function invalidate() {
    void qc.invalidateQueries({ queryKey: ['admin-startups'] });
    void qc.invalidateQueries({ queryKey: ['admin-startups-count'] });
    void qc.invalidateQueries({ queryKey: ['admin-startups-recent'] });
    void qc.invalidateQueries({ queryKey: ['startups'] });
  }

  const setStatusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: StartupStatus }) =>
      startupsApi.setStatus(id, next),
    onSuccess: (res) => {
      toast.success(res.message ?? 'Holat yangilandi');
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => startupsApi.remove(id),
    onSuccess: (res) => {
      toast.success(res.message ?? 'O\'chirildi');
      setToDelete(null);
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-900">Startaplar</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Jami {data?.meta.total ?? '—'} ta startap
          </p>
        </div>
        <Link href="/admin/startups/new">
          <Button variant="accent">
            <Plus className="h-4 w-4" /> Yangi startap
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Qidirish..."
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus transition-all"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => { setStatus(t.value); setPage(1); }}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                status === t.value ? 'bg-brand-900 text-white' : 'text-slate-600 hover:bg-slate-50',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4 animate-pulse">
                <div className="h-10 w-10 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-slate-100 rounded" />
                  <div className="h-3 w-1/4 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-brand-900 font-semibold">Startaplar topilmadi</p>
            <Link href="/admin/startups/new" className="text-sm font-semibold text-accent-700 hover:underline mt-2 inline-block">
              Yangi startap qo&apos;shish
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((s) => {
              const platformTypes = Array.from(new Set(s.platforms.map((p) => p.type)))
                .sort((a, b) => PLATFORM_ORDER.indexOf(a) - PLATFORM_ORDER.indexOf(b));
              return (
                <div key={s.id} className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className="h-11 w-11 rounded-xl bg-surface-soft border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {s.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-brand-900">{s.title.charAt(0)}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-brand-900 truncate">{s.title}</p>
                      {s.isFeatured && <Sparkles className="h-3.5 w-3.5 text-accent-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400 truncate max-w-[160px]">
                        {s.category || s.tagline || '—'}
                      </span>
                      <span className="flex items-center gap-0.5 text-[11px] text-slate-400">
                        <Eye className="h-3 w-3" /> {s.viewCount}
                      </span>
                    </div>
                  </div>

                  {/* Platforms */}
                  <div className="hidden md:flex items-center gap-1">
                    {platformTypes.map((t) => (
                      <span key={t} className="h-6 w-6 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
                        <PlatformIcon type={t} className="h-3 w-3" />
                      </span>
                    ))}
                  </div>

                  <StartupStatusBadge status={s.status} className="hidden sm:inline-flex" />

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {s.status === 'published' ? (
                      <button
                        title="Arxivlash"
                        onClick={() => setStatusMutation.mutate({ id: s.id, next: 'archived' })}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        title="E'lon qilish"
                        onClick={() => setStatusMutation.mutate({ id: s.id, next: 'published' })}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-accent-600 hover:bg-accent-50 transition-all"
                      >
                        {s.status === 'archived' ? <Undo2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                      </button>
                    )}
                    <a
                      href={`/startups/${s.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ko'rish"
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <Link
                      href={`/admin/startups/${s.id}/edit`}
                      title="Tahrirlash"
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-900 hover:bg-slate-100 transition-all"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {canDelete && (
                      <button
                        title="O'chirish"
                        onClick={() => setToDelete(s)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && items.length > 0 && data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Oldingi
          </Button>
          <span className="text-sm text-slate-500 px-2">
            {page} / {data.meta.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>
            Keyingi
          </Button>
        </div>
      )}

      {/* Delete modal */}
      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Startapni o'chirish">
        <p className="text-sm text-slate-600 leading-relaxed">
          <span className="font-semibold text-brand-900">{toDelete?.title}</span> startapini
          butunlay o&apos;chirmoqchimisiz? Bu amalni qaytarib bo&apos;lmaydi.
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" fullWidth onClick={() => setToDelete(null)}>
            Bekor qilish
          </Button>
          <Button
            variant="danger"
            fullWidth
            loading={removeMutation.isPending}
            onClick={() => toDelete && removeMutation.mutate(toDelete.id)}
          >
            <Trash2 className="h-4 w-4" /> O&apos;chirish
          </Button>
        </div>
      </Modal>
    </div>
  );
}
