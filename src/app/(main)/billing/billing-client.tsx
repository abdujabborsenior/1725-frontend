'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { billingApi } from '@/lib/api';
import { INTERVAL_LABEL, formatSum } from '@/lib/billing';
import { formatDate } from '@/lib/date';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EmptyState, PageHeader } from '@/components/ui/page-header';
import { ListRowSkeleton } from '@/components/ui/skeleton';
import { CheckCircleFill, Clock, CloseCircleFill, Wallet } from '@/components/icons';
import type { BillingOrder, BillingOrderStatus } from '@/types';

const ORDER_STATUS: Record<
  BillingOrderStatus,
  { label: string; chip: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Kutilmoqda',
    chip: 'bg-amber-50 text-amber-700',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  paid: {
    label: 'To‘langan',
    chip: 'bg-accent-50 text-accent-700',
    icon: <CheckCircleFill className="h-3.5 w-3.5" />,
  },
  cancelled: {
    label: 'Bekor qilingan',
    chip: 'bg-rose-50 text-rose-600',
    icon: <CloseCircleFill className="h-3.5 w-3.5" />,
  },
  expired: {
    label: 'Muddati o‘tgan',
    chip: 'bg-fill-tertiary text-slate-500',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
};

export function BillingClient() {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && !token) router.replace('/login?next=/billing');
  }, [hasHydrated, token, router]);

  const { data: me, isLoading } = useQuery({
    queryKey: ['billing', 'me'],
    queryFn: () => billingApi.me(),
    enabled: !!token,
  });

  const { data: orders } = useQuery({
    queryKey: ['billing', 'orders'],
    queryFn: () => billingApi.orders({ page: 1, limit: 20 }),
    enabled: !!token,
  });

  const sub = me?.subscription ?? null;
  const usage = me?.usage;
  const used = usage?.startups ?? 0;
  const limit = usage?.limit ?? 0;
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className="space-y-7">
      <PageHeader
        title="Obunam"
        subtitle="Joriy tarif, limitlar va to‘lovlar tarixi."
        action={
          <Link href="/pricing">
            <Button size="sm" variant="secondary">
              Tariflar
            </Button>
          </Link>
        }
      />

      {/* ── Joriy tarif ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="rounded-ios-2xl bg-white p-6">
          <ListRowSkeleton rows={2} />
        </div>
      ) : sub ? (
        <section className="rounded-ios-2xl bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-footnote text-slate-500">Joriy tarif</p>
              <h2 className="mt-0.5 text-title-2 font-semibold text-brand-900">
                {sub.plan?.name ?? sub.tier}
                <span className="ml-2 text-subhead font-normal text-slate-500">
                  {INTERVAL_LABEL[sub.interval]}
                </span>
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-caption-1 font-semibold text-accent-700">
              <CheckCircleFill className="h-3.5 w-3.5" />
              Faol
            </span>
          </div>

          <p className="mt-2 text-subhead text-slate-500">
            Amal qilish muddati: {formatDate(sub.endsAt)}
          </p>

          {/* Limitdan foydalanish */}
          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <p className="text-subhead font-medium text-brand-900">Loyihalar</p>
              <p className="text-subhead tabular-nums text-slate-500">
                {used} / {limit}
              </p>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-fill-tertiary">
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-500 ease-ios',
                  percent >= 100 ? 'bg-rose-500' : 'bg-accent-600',
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-2 text-footnote text-slate-500">
              {usage && usage.remaining > 0
                ? `Yana ${usage.remaining} ta loyiha e’lon qilishingiz mumkin.`
                : 'Limit to‘lgan — yuqoriroq tarifga o‘tish orqali kengaytiring.'}
            </p>
          </div>

          <div className="mt-5">
            <Link href="/pricing">
              <Button size="md" variant="secondary">
                Tarifni o‘zgartirish
              </Button>
            </Link>
          </div>
        </section>
      ) : (
        <EmptyState
          icon={<Wallet />}
          title="Faol obuna yo‘q"
          description={
            limit > 0
              ? `Hozircha ${limit} ta loyiha e’lon qila olasiz. Ko‘proq kerak bo‘lsa, tarif tanlang.`
              : 'Loyiha e’lon qilish uchun tarif tanlang.'
          }
          action={
            <Link href="/pricing">
              <Button size="md">Tariflarni ko‘rish</Button>
            </Link>
          }
        />
      )}

      {/* ── To'lovlar tarixi ──────────────────────────────────────── */}
      <section>
        <h2 className="ios-section-header">To‘lovlar tarixi</h2>
        {!orders || orders.data.length === 0 ? (
          <div className="ios-list">
            <div className="ios-row">
              <span className="flex-1 text-body text-slate-500">
                Hali to‘lov qilinmagan.
              </span>
            </div>
          </div>
        ) : (
          <div className="ios-list">
            {orders.data.map((order: BillingOrder) => {
              const meta = ORDER_STATUS[order.status];
              return (
                <div key={order.id} className="ios-row">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body text-brand-900">
                      {order.plan?.name ?? 'Tarif'}
                      {order.plan && (
                        <span className="text-slate-500">
                          {' '}
                          · {INTERVAL_LABEL[order.plan.interval]}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-footnote text-slate-500">
                      {formatDate(order.createdAt)}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-body tabular-nums text-brand-900">
                      {formatSum(order.amount)}
                    </span>
                    <span
                      className={cn(
                        'mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption-2 font-medium',
                        meta.chip,
                      )}
                    >
                      {meta.icon}
                      {meta.label}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
