'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ChevronLeft, MessageCircle, Send } from '@/components/icons';
import { investorsApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { EmptyState, PageHeader } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { ListRowSkeleton } from '@/components/ui/skeleton';
import { INTRO_STATUS_LABEL, INTRO_STATUS_TONE } from '@/lib/venture';
import { timeAgo } from '@/lib/date';
import { cn } from '@/lib/utils';

/** Investor yuborgan bog'lanish so'rovlari va ularning holati. */
export default function InvestorRequestsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { token, hasHydrated } = useAuthStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace(`/login?next=${encodeURIComponent('/investor/requests')}`);
    }
  }, [hasHydrated, token, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['investor-intros', page],
    queryFn: () => investorsApi.sentIntros({ page, limit: 20 }),
    enabled: !!token,
  });

  const { mutate: withdraw, isPending } = useMutation({
    mutationFn: (id: string) => investorsApi.withdrawIntro(id),
    onSuccess: (res) => {
      toast.success(res.message);
      void qc.invalidateQueries({ queryKey: ['investor-intros'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (hasHydrated && !token) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/investor"
        className="tappable -ml-1 flex items-center gap-0.5 text-body text-accent-700"
      >
        <ChevronLeft className="h-[19px] w-[19px]" strokeWidth={3} />
        Kabinet
      </Link>

      <PageHeader
        title="Yuborilgan so'rovlar"
        subtitle="Asoschi qabul qilsa, suhbat avtomatik ochiladi."
      />

      {isLoading && (
        <div className="space-y-3">
          <ListRowSkeleton />
          <ListRowSkeleton />
        </div>
      )}

      {!isLoading && (data?.data.length ?? 0) === 0 && (
        <EmptyState
          icon={<Send />}
          title="Hali so'rov yubormagansiz"
          description="Lentadan yoqqan loyihani tanlab, asoschiga qisqa xabar yozing."
        />
      )}

      {!isLoading && (data?.data.length ?? 0) > 0 && (
        <>
          <div className="overflow-hidden rounded-ios-lg bg-white">
            {data!.data.map((intro, i) => (
              <div key={intro.id} className={cn('p-4', i > 0 && 'hairline-t')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {intro.startup ? (
                      <Link
                        href={`/startups/${intro.startup.slug}`}
                        className="text-body font-medium text-brand-900 hover:text-accent-700"
                      >
                        {intro.startup.title}
                      </Link>
                    ) : (
                      <span className="text-body text-slate-400">
                        Loyiha o&apos;chirilgan
                      </span>
                    )}
                    <p className="mt-0.5 text-caption-1 text-slate-500">
                      {timeAgo(intro.createdAt)}
                      {intro.matchScore !== null && ` · moslik ${intro.matchScore}%`}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-0.5 text-caption-1 font-medium',
                      INTRO_STATUS_TONE[intro.status],
                    )}
                  >
                    {INTRO_STATUS_LABEL[intro.status]}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-subhead text-slate-600">
                  {intro.message}
                </p>

                <div className="mt-3 flex gap-2">
                  {intro.status === 'accepted' && intro.conversationId && (
                    <Link
                      href={`/messages/${intro.conversationId}`}
                      className="tappable inline-flex h-9 items-center gap-2 rounded-ios-md bg-accent-600 px-3.5 text-footnote font-semibold text-white"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Suhbatni ochish
                    </Link>
                  )}
                  {intro.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => withdraw(intro.id)}
                      disabled={isPending}
                      className="tappable inline-flex h-9 items-center rounded-ios-md bg-fill-tertiary px-3.5 text-footnote font-medium text-slate-600 disabled:opacity-50"
                    >
                      Qaytarib olish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={data!.meta.totalPages}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
