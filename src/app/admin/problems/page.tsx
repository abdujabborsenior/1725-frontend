'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Check, X, Trash2, ExternalLink, Loader2, FileQuestion, UserPlus,
} from 'lucide-react';
import { problemsApi, usersApi, getErrorMessage } from '@/lib/api';
import { PROBLEM_STATUS_LABEL } from '@/lib/constants';
import type { Problem, ProblemStatus } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { ProblemStatusBadge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

const TABS: { value: ProblemStatus | ''; label: string }[] = [
  { value: '', label: 'Barchasi' },
  { value: 'pending', label: PROBLEM_STATUS_LABEL.pending },
  { value: 'open', label: PROBLEM_STATUS_LABEL.open },
  { value: 'under_review', label: PROBLEM_STATUS_LABEL.under_review },
  { value: 'resolved', label: PROBLEM_STATUS_LABEL.resolved },
  { value: 'rejected', label: PROBLEM_STATUS_LABEL.rejected },
];

export default function AdminProblemsPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const isSuperadmin = user?.role === 'superadmin';
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ProblemStatus | ''>('');
  const [rejectTarget, setRejectTarget] = useState<Problem | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Problem | null>(null);
  const [assignTarget, setAssignTarget] = useState<Problem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-problems', { page, status }],
    queryFn: () => problemsApi.list({ page, limit: 12, status: status || undefined }),
    placeholderData: keepPreviousData,
  });

  const { data: analyzers } = useQuery({
    queryKey: ['analyzers'],
    queryFn: () => usersApi.analyzers(),
    enabled: isSuperadmin && !!assignTarget,
  });

  function invalidate() {
    void qc.invalidateQueries({ queryKey: ['admin-problems'] });
  }

  const approveMut = useMutation({
    mutationFn: (id: string) => problemsApi.approve(id),
    onSuccess: () => { toast.success('Tasdiqlandi'); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
  const rejectMut = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => problemsApi.reject(id, note),
    onSuccess: () => { toast.success('Rad etildi'); setRejectTarget(null); setRejectNote(''); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
  const statusMut = useMutation({
    mutationFn: ({ id, s }: { id: string; s: ProblemStatus }) => problemsApi.updateStatus(id, s),
    onSuccess: () => { toast.success('Holat yangilandi'); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
  const assignMut = useMutation({
    mutationFn: ({ id, analyzerId }: { id: string; analyzerId: string }) => problemsApi.assignAnalyzer(id, analyzerId),
    onSuccess: () => { toast.success('Analizator biriktirildi'); setAssignTarget(null); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => problemsApi.remove(id),
    onSuccess: () => { toast.success('O\'chirildi'); setDeleteTarget(null); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-900">Muammolar moderatsiyasi</h1>
        <p className="text-sm text-slate-500 mt-0.5">Jami {data?.meta.total ?? '—'} ta</p>
      </div>

      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto w-fit max-w-full">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => { setStatus(t.value); setPage(1); }}
            className={cn('px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
              status === t.value ? 'bg-brand-900 text-white' : 'text-slate-600 hover:bg-slate-50')}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 text-slate-300 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <FileQuestion className="h-8 w-8 text-slate-300 mx-auto mb-2" /> Muammolar topilmadi
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((p) => (
              <div key={p.id} className="px-4 sm:px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ProblemStatusBadge status={p.status} />
                      {p.category && <span className="text-[11px] text-slate-400">{p.category}</span>}
                    </div>
                    <p className="text-sm font-semibold text-brand-900 truncate">{p.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.description}</p>
                  </div>
                  <Link href={`/problems/${p.id}`} target="_blank"
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 shrink-0">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {p.status === 'pending' && isSuperadmin && (
                    <>
                      <Button size="sm" variant="accent" loading={approveMut.isPending} onClick={() => approveMut.mutate(p.id)}>
                        <Check className="h-3.5 w-3.5" /> Tasdiqlash
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setRejectTarget(p)}>
                        <X className="h-3.5 w-3.5" /> Rad etish
                      </Button>
                    </>
                  )}
                  {p.status !== 'pending' && p.status !== 'rejected' && (
                    <select
                      value={p.status}
                      onChange={(e) => statusMut.mutate({ id: p.id, s: e.target.value as ProblemStatus })}
                      className="h-8 px-2 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-brand-900 appearance-none cursor-pointer focus:outline-none input-focus"
                    >
                      {(['open', 'under_review', 'resolved'] as ProblemStatus[]).map((s) => (
                        <option key={s} value={s}>{PROBLEM_STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  )}
                  {isSuperadmin && (
                    <button onClick={() => setAssignTarget(p)}
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:border-slate-300 transition-all">
                      <UserPlus className="h-3.5 w-3.5" /> Biriktirish
                    </button>
                  )}
                  {isSuperadmin && (
                    <button onClick={() => setDeleteTarget(p)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all ml-auto">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Oldingi</Button>
          <span className="text-sm text-slate-500 px-2">{page} / {data.meta.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>Keyingi</Button>
        </div>
      )}

      {/* Reject modal */}
      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Muammoni rad etish">
        <Textarea
          label="Sabab (ixtiyoriy)"
          rows={3}
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          placeholder="Nima uchun rad etilmoqda..."
        />
        <div className="flex gap-3 mt-5">
          <Button variant="outline" fullWidth onClick={() => setRejectTarget(null)}>Bekor qilish</Button>
          <Button variant="danger" fullWidth loading={rejectMut.isPending}
            onClick={() => rejectTarget && rejectMut.mutate({ id: rejectTarget.id, note: rejectNote.trim() || undefined })}>
            Rad etish
          </Button>
        </div>
      </Modal>

      {/* Assign modal */}
      <Modal open={!!assignTarget} onClose={() => setAssignTarget(null)} title="Analizator biriktirish">
        {analyzers && analyzers.length > 0 ? (
          <div className="space-y-2">
            {analyzers.map((a) => (
              <button key={a.id}
                onClick={() => assignTarget && assignMut.mutate({ id: assignTarget.id, analyzerId: a.id })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-200 hover:border-accent-300 hover:bg-accent-50/40 transition-all text-left">
                <div className="h-8 w-8 rounded-full bg-brand-900 flex items-center justify-center text-xs font-bold text-accent-400">
                  {a.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-900">{a.fullName}</p>
                  <p className="text-xs text-slate-400">{a.email}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 py-4 text-center">Analizatorlar topilmadi</p>
        )}
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Muammoni o'chirish">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-brand-900">{deleteTarget?.title}</span> muammosini o&apos;chirmoqchimisiz?
        </p>
        <div className="flex gap-3 mt-5">
          <Button variant="outline" fullWidth onClick={() => setDeleteTarget(null)}>Bekor qilish</Button>
          <Button variant="danger" fullWidth loading={deleteMut.isPending}
            onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}>
            <Trash2 className="h-4 w-4" /> O&apos;chirish
          </Button>
        </div>
      </Modal>
    </div>
  );
}
