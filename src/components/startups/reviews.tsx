'use client';

import { useRouter } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { MessageSquare, Trash2, Star } from '@/components/icons';
import { startupsApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { FIELD_SURFACE } from '@/components/ui/field-styles';
import { RatingValue, RatingInput, RATING_MAX } from './rating';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { AuthorLink } from '@/components/social/author-link';
import { useDateFormat } from '@/lib/date';
import { useFormatNumber } from '@/lib/format';
import toast from 'react-hot-toast';
import type { Startup } from '@/types';

export function Reviews({ startup }: { startup: Startup }) {
  const t = useTranslations('reviews');
  const tc = useTranslations('common');
  const tl = useTranslations('labels');
  const { timeAgo } = useDateFormat();
  const fmt = useFormatNumber();
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
      toast.success(res.message ?? t('saved'));
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: () => startupsApi.deleteMyReview(startup.id),
    onSuccess: () => {
      toast.success(t('deleted'));
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
        <h2 className="text-title-3 font-bold text-brand-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-accent-600" /> {t('title')}
        </h2>
      </div>

      {/* Rating summary — IMDB naqshi: yulduz + X.X/10 + ovozlar soni */}
      <div className="flex items-center gap-5 rounded-ios-2xl bg-white p-5 sm:gap-6">
        <div className="shrink-0 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <Star className="h-6 w-6 self-center text-amber-400 fill-amber-400" aria-hidden />
            <span className="text-large-title font-semibold tabular-nums text-brand-900">
              {startup.ratingCount > 0 ? startup.ratingAvg.toFixed(1) : '—'}
            </span>
            <span className="text-title-3 font-semibold text-slate-500">/{RATING_MAX}</span>
          </div>
          <p className="mt-1 text-footnote text-slate-500">
            {t('votes', { count: startup.ratingCount, n: fmt(startup.ratingCount) })}
          </p>
        </div>
        <div className="flex-1 border-l border-slate-100 pl-5 sm:pl-6">
          <p className="text-subhead text-slate-600">
            {startup.ratingCount > 0 ? t('summary', { max: String(RATING_MAX) }) : t('noRatings')}
          </p>
          <p className="mt-1.5 text-footnote text-slate-500">
            {t('formula')}
          </p>
        </div>
      </div>

      {/* Review form */}
      {token ? (
        <div className="rounded-ios-2xl bg-white p-5 space-y-3">
          <p className="text-subhead font-semibold text-brand-900">
            {mine?.data ? t('updateTitle') : t('rateTitle')}
          </p>
          <RatingInput value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder={t('placeholder')}
            className={cn(FIELD_SURFACE, 'resize-none px-4 py-3')}
          />
          <div className="flex gap-2">
            <Button
              variant="accent"
              loading={submit.isPending}
              disabled={rating < 1}
              onClick={() => submit.mutate()}
            >
              <Star className="h-4 w-4" /> {mine?.data ? t('update') : tc('send')}
            </Button>
            {mine?.data && (
              <Button variant="danger" loading={remove.isPending} onClick={() => remove.mutate()}>
                <Trash2 className="h-4 w-4" /> {t('delete')}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => router.push('/login')}
          className="w-full rounded-ios-lg bg-white py-5 text-subhead text-slate-600 transition-all hover:bg-slate-50"
        >
          {t.rich('signIn', {
            b: (chunks) => <span className="font-semibold text-accent-700">{chunks}</span>,
          })}
        </button>
      )}

      {/* Reviews list — yuklanishda sharh shaklidagi skeletonlar */}
      {isLoading ? (
        <div className="space-y-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-ios-2xl bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="skeleton h-9 w-9 rounded-full" />
                  <div className="space-y-1.5">
                    <div className="skeleton h-3.5 w-28 rounded-md" />
                    <div className="skeleton h-2.5 w-20 rounded-md" />
                  </div>
                </div>
                <div className="skeleton h-3.5 w-20 rounded-md" />
              </div>
              <div className="mt-3 space-y-2">
                <div className="skeleton h-3 w-full rounded-md" />
                <div className="skeleton h-3 w-2/3 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((r) => (
            <div key={r.id} className="rounded-ios-2xl bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <AuthorLink
                  author={r.user}
                  size={36}
                  subtitle={`${r.user ? tl(`role.${r.user.role}`) : ''} · ${timeAgo(r.createdAt)}`}
                />
                <RatingValue value={r.rating} size="sm" />
              </div>
              {r.comment && (
                <p className={cn('text-subhead text-slate-700 leading-relaxed mt-3')}>{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-subhead text-slate-500">{t('empty')}</p>
      )}

      {!isLoading && items.length > 0 && (
        <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} />
      )}
    </section>
  );
}
