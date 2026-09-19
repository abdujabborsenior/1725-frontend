'use client';

import { Link } from '@/i18n/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { billingApi } from '@/lib/api';
import { formatSum } from '@/lib/billing';
import { Button } from '@/components/ui/button';
import { usePlanText } from '@/components/billing/plan-card';
import { Spinner, CheckCircleFill, CloseCircleFill } from '@/components/icons';
import type { AppLocale } from '@/i18n/routing';

/** To'lov tasdig'ini kutish chegarasi — bundan keyin so'rov to'xtaydi. */
const POLL_TIMEOUT_MS = 90_000;
const POLL_INTERVAL_MS = 2_000;

export function PaymentStatusClient() {
  const t = useTranslations('billingPage');
  const tb = useTranslations('billing');
  const locale = useLocale() as AppLocale;
  const planText = usePlanText();
  const params = useSearchParams();
  const orderId = params.get('order');
  const qc = useQueryClient();
  const startedAt = useRef(Date.now());
  const [timedOut, setTimedOut] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['billing', 'order', orderId],
    queryFn: () => billingApi.order(orderId as string),
    enabled: !!orderId,
    // Buyurtma "pending" ekan — 2 soniyada bir tekshiramiz. Payme tasdig'i
    // odatda bir necha soniyada keladi; 90 soniyadan keyin so'rovlar to'xtaydi
    // (fonda ochiq qolgan sahifa serverni bekorga urmaydi).
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (status && status !== 'pending') return false;
      if (Date.now() - startedAt.current > POLL_TIMEOUT_MS) return false;
      return POLL_INTERVAL_MS;
    },
  });

  useEffect(() => {
    if (order?.status === 'paid') {
      // Obuna va limit ma'lumotlari yangilansin (boshqa sahifalar ham to'g'ri
      // ko'rsatsin) — bitta joydan invalidatsiya.
      void qc.invalidateQueries({ queryKey: ['billing'] });
    }
  }, [order?.status, qc]);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!orderId) {
    return (
      <Shell
        tone="error"
        title={t('status.missingTitle')}
        text={t('status.missingText')}
        action={<Link href="/pricing"><Button>{t('status.backToPricing')}</Button></Link>}
      />
    );
  }

  if (isLoading || (!order && !timedOut)) {
    return (
      <Shell
        tone="pending"
        title={t('status.checkingTitle')}
        text={t('status.checkingText')}
      />
    );
  }

  if (order?.status === 'paid') {
    const sum = formatSum(order.amount, locale);
    return (
      <Shell
        tone="success"
        title={t('status.paidTitle')}
        text={
          order.plan
            ? t('status.paidWithPlan', {
                plan: planText.name(order.plan),
                interval: tb(`interval.${order.plan.interval}`),
                sum,
              })
            : t('status.paidPlain', { sum })
        }
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/startups/create"><Button>{t('status.publish')}</Button></Link>
            <Link href="/billing"><Button variant="secondary">{t('title')}</Button></Link>
          </div>
        }
      />
    );
  }

  if (order?.status === 'cancelled' || order?.status === 'expired') {
    return (
      <Shell
        tone="error"
        title={order.status === 'expired' ? t('status.expiredTitle') : t('status.cancelledTitle')}
        text={t('status.notCharged')}
        action={<Link href="/pricing"><Button>{t('status.backToPricing')}</Button></Link>}
      />
    );
  }

  // pending — hali tasdiq kelmagan
  return (
    <Shell
      tone="pending"
      title={t('status.confirmingTitle')}
      text={timedOut ? t('status.delayed') : t('status.wait')}
      action={
        timedOut ? (
          <Link href="/billing"><Button variant="secondary">{t('title')}</Button></Link>
        ) : undefined
      }
    />
  );
}

function Shell({
  tone,
  title,
  text,
  action,
}: {
  tone: 'pending' | 'success' | 'error';
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md rounded-ios-2xl bg-white px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
        {tone === 'pending' && <Spinner className="h-8 w-8 animate-spin text-slate-400" />}
        {tone === 'success' && <CheckCircleFill className="h-14 w-14 text-accent-600" />}
        {tone === 'error' && <CloseCircleFill className="h-14 w-14 text-rose-500" />}
      </div>
      <h1 className="text-title-2 font-semibold text-brand-900">{title}</h1>
      <p className="mx-auto mt-2 max-w-sm text-subhead leading-relaxed text-slate-500">{text}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
