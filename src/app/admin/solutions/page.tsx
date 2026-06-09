'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Check, X, Loader2, Lightbulb, ExternalLink, FileText, Video } from 'lucide-react';
import { solutionsApi, getErrorMessage } from '@/lib/api';
import { SOLUTION_STATUS_LABEL } from '@/lib/constants';
import type { Solution, SolutionStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { SolutionStatusBadge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const TABS: { value: SolutionStatus | ''; label: string }[] = [
  { value: '', label: 'Barchasi' },
  { value: 'pending', label: SOLUTION_STATUS_LABEL.pending },
  { value: 'accepted', label: SOLUTION_STATUS_LABEL.accepted },
  { value: 'rejected', label: SOLUTION_STATUS_LABEL.rejected },
];

export default function AdminSolutionsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<SolutionStatus | ''>('');
  const [target, setTarget] = useState<{ s: Solution; action: 'accepted' | 'rejected' } | null>(null);
  const [note, setNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-solutions', { page, status }],
    queryFn: () => solutionsApi.list({ page, limit: 12, status: status || undefined }),
    placeholderData: keepPreviousData,
  });

  const mut = useMutation({
    mutationFn: ({ id, s, n }: { id: string; s: SolutionStatus; n?: string }) => solutionsApi.updateStatus(id, s, n),
    onSuccess: () => {
      toast.success('Holat yangilandi');
      setTarget(null); setNote('');
      void qc.invalidateQueries({ queryKey: ['admin-solutions'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-900">Yechimlar moderatsiyasi</h1>
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
            <Lightbulb className="h-8 w-8 text-slate-300 mx-auto mb-2" /> Yechimlar topilmadi
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((s) => (
              <div key={s.id} className="px-4 sm:px-5 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="flex items-center gap-2">
                    <SolutionStatusBadge status={s.status} />
                    <span className="text-sm font-medium text-brand-900 truncate max-w-[160px]">
                      {s.submittedBy?.fullName ?? s.fullName}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                  </span>
                </div>

                {s.problem && (
                  <Link href={`/problems/${s.problem.id}`} target="_blank"
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-accent-700 mb-2">
                    <ExternalLink className="h-3 w-3" /> {s.problem.title}
                  </Link>
                )}

                <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">{s.content}</p>

                {(s.presentationUrl || s.videoUrl) && (
                  <div className="flex gap-2 mt-2">
                    {s.presentationUrl && (
                      <a href={s.presentationUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-accent-50 text-accent-700 border border-accent-200">
                        <FileText className="h-3 w-3" /> Taqdimot
                      </a>
                    )}
                    {s.videoUrl && (
                      <a href={s.videoUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-violet-50 text-violet-700 border border-violet-200">
                        <Video className="h-3 w-3" /> Video
                      </a>
                    )}
                  </div>
                )}

                {s.analyzerNote && (
                  <p className="mt-2 text-xs text-slate-500 italic bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    &ldquo;{s.analyzerNote}&rdquo;
                  </p>
                )}

                {s.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="accent" onClick={() => setTarget({ s, action: 'accepted' })}>
                      <Check className="h-3.5 w-3.5" /> Qabul qilish
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setTarget({ s, action: 'rejected' })}>
                      <X className="h-3.5 w-3.5" /> Rad etish
                    </Button>
                  </div>
                )}
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

      <Modal
        open={!!target}
        onClose={() => { setTarget(null); setNote(''); }}
        title={target?.action === 'accepted' ? 'Yechimni qabul qilish' : 'Yechimni rad etish'}
      >
        <Textarea
          label="Izoh (ixtiyoriy)"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Muallifga izoh..."
        />
        <div className="flex gap-3 mt-5">
          <Button variant="outline" fullWidth onClick={() => { setTarget(null); setNote(''); }}>Bekor qilish</Button>
          <Button
            variant={target?.action === 'accepted' ? 'accent' : 'danger'}
            fullWidth
            loading={mut.isPending}
            onClick={() => target && mut.mutate({ id: target.s.id, s: target.action, n: note.trim() || undefined })}
          >
            {target?.action === 'accepted' ? 'Qabul qilish' : 'Rad etish'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
