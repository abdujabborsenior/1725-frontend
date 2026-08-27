'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ChevronLeft, MailOpen, MessageCircle } from '@/components/icons';
import { founderApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { EmptyState, PageHeader } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { ListRowSkeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { INTRO_STATUS_LABEL, INTRO_STATUS_TONE } from '@/lib/venture';
import { timeAgo } from '@/lib/date';
import { cn } from '@/lib/utils';

/**
 * Asoschiga kelgan bog'lanish so'rovlari.
 *
 * Investorning ALOQA ma'lumotlari bu yerda ko'rinmaydi — ular faqat so'rov
 * qabul qilingandan keyin, chat orqali almashinadi. Bu qoida ikkala
 * tomonni ham himoya qiladi va serverda ham qat'iy qo'llanadi.
 */
export default function IntroRequestsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { token, hasHydrated } = useAuthStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace(
        `/login?next=${encodeURIComponent('/profile/intro-requests')}`,
      );
    }
  }, [hasHydrated, token, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['founder-intros', page],
    queryFn: () => founderApi.introRequests({ page, limit: 20 }),
    enabled: !!token,
  });

  const { mutate: respond, isPending } = useMutation({
    mutationFn: (v: { id: string; accept: boolean }) =>
      founderApi.respondIntro(v.id, v.accept),
    onSuccess: (res) => {
      toast.success(res.message);
      void qc.invalidateQueries({ queryKey: ['founder-intros'] });
      void qc.invalidateQueries({ queryKey: ['founder-pending'] });
      if (res.data.conversationId) {
        router.push(`/messages/${res.data.conversationId}`);
      }
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (hasHydrated && !token) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/profile"
        className="tappable -ml-1 flex items-center gap-0.5 text-body text-accent-700"
      >
        <ChevronLeft className="h-[19px] w-[19px]" strokeWidth={3} />
        Profil
      </Link>

      <PageHeader
        title="Bog'lanish so'rovlari"
        subtitle="Loyihangiz bilan qiziqqan investorlar. Qabul qilsangiz suhbat ochiladi."
      />

      {isLoading && (
        <div className="space-y-3">
          <ListRowSkeleton />
          <ListRowSkeleton />
        </div>
      )}

      {!isLoading && (data?.data.length ?? 0) === 0 && (
        <EmptyState
          icon={<MailOpen />}
          title="Hozircha so'rov yo'q"
          description="Loyihangiz profilini to'ldirsangiz — bosqich, ehtiyoj va ko'rsatkichlar — investorlar sizni tezroq topadi."
        />
      )}

      {!isLoading && (data?.data.length ?? 0) > 0 && (
        <>
          <div className="space-y-3">
            {data!.data.map((intro) => (
              <article key={intro.id} className="rounded-ios-lg bg-white p-4">
                <div className="flex items-start gap-3">
                  <Avatar
                    src={intro.investor?.avatarUrl ?? null}
                    name={intro.investor?.fullName ?? '?'}
                    size={40}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-body font-medium text-brand-900">
                          {intro.investor?.fullName ?? 'Investor'}
                        </p>
                        <p className="mt-0.5 text-caption-1 text-slate-500">
                          {intro.startup?.title ?? 'Loyiha'} ·{' '}
                          {timeAgo(intro.createdAt)}
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

                    <p className="mt-2.5 whitespace-pre-line text-subhead text-slate-700">
                      {intro.message}
                    </p>

                    {intro.status === 'pending' && (
                      <div className="mt-3.5 flex gap-2">
                        <button
                          type="button"
                          onClick={() => respond({ id: intro.id, accept: true })}
                          disabled={isPending}
                          className="tappable inline-flex h-10 flex-1 items-center justify-center rounded-ios-md bg-accent-600 text-subhead font-semibold text-white disabled:opacity-50"
                        >
                          Qabul qilish
                        </button>
                        <button
                          type="button"
                          onClick={() => respond({ id: intro.id, accept: false })}
                          disabled={isPending}
                          className="tappable inline-flex h-10 items-center justify-center rounded-ios-md bg-fill-tertiary px-4 text-subhead font-medium text-slate-600 disabled:opacity-50"
                        >
                          Rad etish
                        </button>
                      </div>
                    )}

                    {intro.status === 'accepted' && intro.conversationId && (
                      <Link
                        href={`/messages/${intro.conversationId}`}
                        className="tappable mt-3.5 inline-flex h-10 items-center gap-2 rounded-ios-md bg-fill-tertiary px-4 text-subhead font-medium text-brand-900"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Suhbatni ochish
                      </Link>
                    )}
                  </div>
                </div>
              </article>
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
