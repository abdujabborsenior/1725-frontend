'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { MessageSquare, Trash2, Loader2, Star } from 'lucide-react';
import { startupsApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { ROLE_LABEL } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { StarRating, RatingInput } from './rating';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { AuthorLink } from '@/components/social/author-link';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import type { Startup } from '@/types';

export function Reviews({ startup }: { startup: Startup }) {
  const { token } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['startup-reviews', startup.slug, page],
    queryFn: () => startupsApi.reviews(startup.slug, { page, limit: 10 }),
    placeholderData: keepPreviousData,
  });

  const { data: mine } = useQuery({
    queryKey: ['startup-myreview', startup.slug],
    queryFn: () => startupsApi.myReview(startup.slug),
    enabled: !!token,
  });

  // Mavjud sharhni formaga yuklash
  useEffect(() => {
    if (mine?.data) {
      setRating(mine.data.rating);
      setComment(mine.data.comment ?? '');
    }
  }, [mine?.data]);

  function invalidate() {
    void qc.invalidateQueries({ queryKey: ['startup-reviews', startup.slug] });
    void qc.invalidateQueries({ queryKey: ['startup-myreview', startup.slug] });
    void qc.invalidateQueries({ queryKey: ['startup', startup.slug] });
  }

  const submit = useMutation({
    mutationFn: () => startupsApi.submitReview(startup.id, { rating, comment: comment.trim() || undefined }),
    onSuccess: (res) => {
      toast.success(res.message ?? 'Saqlandi');
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: () => startupsApi.deleteMyReview(startup.id),
    onSuccess: () => {
      toast.success('Sharhingiz o\'chirildi');
      setRating(0);
      setComment('');
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const items = data?.data ?? [];

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-accent-600" /> Sharhlar va baholar
        </h2>
      </div>

      {/* Rating summary */}
      <div className="flex items-center gap-6 bg-white border border-slate-200 rounded-2xl p-5">
        <div className="text-center">
          <p className="text-4xl font-black text-brand-900">
            {startup.ratingCount > 0 ? startup.ratingAvg.toFixed(1) : '—'}
          </p>
          <StarRating value={startup.ratingAvg} size={16} className="mt-1 justify-center" />
          <p className="text-xs text-slate-400 mt-1">{startup.ratingCount} ta baho</p>
        </div>
        <div className="flex-1 border-l border-slate-100 pl-6">
          <p className="text-sm text-slate-600">
            {startup.ratingCount > 0
              ? 'Foydalanuvchilar bu startapni shunday baholashgan.'
              : 'Hali baho berilmagan. Birinchi bo\'lib baholang!'}
          </p>
        </div>
      </div>

      {/* Review form */}
      {token ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <p className="text-sm font-semibold text-brand-900">
            {mine?.data ? 'Sharhingizni yangilang' : 'Baho bering'}
          </p>
          <RatingInput value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Fikringizni yozing (ixtiyoriy)..."
            className="w-full rounded-xl bg-white border border-slate-200 hover:border-slate-300 px-4 py-3 text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus transition-all resize-none"
          />
          <div className="flex gap-2">
            <Button
              variant="accent"
              loading={submit.isPending}
              disabled={rating < 1}
              onClick={() => submit.mutate()}
            >
              <Star className="h-4 w-4" /> {mine?.data ? 'Yangilash' : 'Yuborish'}
            </Button>
            {mine?.data && (
              <Button variant="danger" loading={remove.isPending} onClick={() => remove.mutate()}>
                <Trash2 className="h-4 w-4" /> O&apos;chirish
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => router.push('/login')}
          className="w-full rounded-2xl border border-dashed border-slate-200 bg-surface-soft py-5 text-sm text-slate-500 hover:border-accent-300 transition-all"
        >
          Baho berish uchun <span className="font-semibold text-accent-700">tizimga kiring</span>
        </button>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="h-5 w-5 text-slate-300 animate-spin" />
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((r) => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3">
                <AuthorLink
                  author={r.user}
                  size={36}
                  subtitle={`${r.user ? ROLE_LABEL[r.user.role] : ''} · ${formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}`}
                />
                <StarRating value={r.rating} size={14} />
              </div>
              {r.comment && (
                <p className={cn('text-sm text-slate-700 leading-relaxed mt-3')}>{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-6">Hali sharhlar yo&apos;q</p>
      )}

      {!isLoading && items.length > 0 && (
        <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} />
      )}
    </section>
  );
}
