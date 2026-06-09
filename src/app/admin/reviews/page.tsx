'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Trash2, Loader2, Star, ExternalLink } from 'lucide-react';
import { startupsApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { StarRating } from '@/components/startups/rating';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { StartupReview } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const isSuperadmin = user?.role === 'superadmin';
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<StartupReview | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', page],
    queryFn: () => startupsApi.adminReviews({ page, limit: 15 }),
    placeholderData: keepPreviousData,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => startupsApi.adminDeleteReview(id),
    onSuccess: () => {
      toast.success('Sharh o\'chirildi');
      setTarget(null);
      void qc.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-900">Sharhlar moderatsiyasi</h1>
        <p className="text-sm text-slate-500 mt-0.5">Jami {data?.meta.total ?? '—'} ta</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 text-slate-300 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Star className="h-8 w-8 text-slate-300 mx-auto mb-2" /> Sharhlar yo&apos;q
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((r) => (
              <div key={r.id} className="px-4 sm:px-5 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-surface-soft border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {r.startup?.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.startup.logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Star className="h-4 w-4 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {r.startup && (
                        <Link href={`/startups/${r.startup.slug}`} target="_blank"
                          className="text-sm font-semibold text-brand-900 hover:text-accent-700 inline-flex items-center gap-1">
                          {r.startup.title} <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                      <StarRating value={r.rating} size={13} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {r.user?.fullName ?? 'Foydalanuvchi'} ·{' '}
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </p>
                    {r.comment && <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{r.comment}</p>}
                  </div>
                  {isSuperadmin && (
                    <button onClick={() => setTarget(r)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shrink-0">
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

      <Modal open={!!target} onClose={() => setTarget(null)} title="Sharhni o'chirish">
        <p className="text-sm text-slate-600">Ushbu sharhni o&apos;chirmoqchimisiz?</p>
        <div className="flex gap-3 mt-5">
          <Button variant="outline" fullWidth onClick={() => setTarget(null)}>Bekor qilish</Button>
          <Button variant="danger" fullWidth loading={deleteMut.isPending}
            onClick={() => target && deleteMut.mutate(target.id)}>
            <Trash2 className="h-4 w-4" /> O&apos;chirish
          </Button>
        </div>
      </Modal>
    </div>
  );
}
