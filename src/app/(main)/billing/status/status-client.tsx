'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { billingApi } from '@/lib/api';
import { formatSum, INTERVAL_LABEL } from '@/lib/billing';
import { Button } from '@/components/ui/button';
import { Spinner, CheckCircleFill, CloseCircleFill } from '@/components/icons';

/** To'lov tasdig'ini kutish chegarasi — bundan keyin so'rov to'xtaydi. */
const POLL_TIMEOUT_MS = 90_000;
const POLL_INTERVAL_MS = 2_000;

export function PaymentStatusClient() {
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
    const t = setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  if (!orderId) {
    return (
      <Shell
        tone="error"
        title="Buyurtma topilmadi"
        text="Havola to‘liq emas. Tariflar sahifasidan qaytadan urinib ko‘ring."
        action={<Link href="/pricing"><Button>Tariflarga qaytish</Button></Link>}
      />
    );
  }

  if (isLoading || (!order && !timedOut)) {
    return <Shell tone="pending" title="Tekshirilmoqda…" text="Buyurtma holati olinmoqda" />;
  }

  if (order?.status === 'paid') {
    return (
      <Shell
        tone="success"
        title="To‘lov qabul qilindi"
        text={
          order.plan
            ? `${order.plan.name} · ${INTERVAL_LABEL[order.plan.interval]} tarifi faollashtirildi (${formatSum(order.amount)}).`
            : `To‘lov muvaffaqiyatli (${formatSum(order.amount)}).`
        }
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/startups/create"><Button>Loyiha e’lon qilish</Button></Link>
            <Link href="/billing"><Button variant="secondary">Obunam</Button></Link>
          </div>
        }
      />
    );
  }

  if (order?.status === 'cancelled' || order?.status === 'expired') {
    return (
      <Shell
        tone="error"
        title={order.status === 'expired' ? 'Buyurtma muddati o‘tdi' : 'To‘lov bekor qilindi'}
        text="Hisobingizdan mablag‘ yechilmagan. Qaytadan urinib ko‘rishingiz mumkin."
        action={<Link href="/pricing"><Button>Tariflarga qaytish</Button></Link>}
      />
    );
  }

  // pending — hali tasdiq kelmagan
  return (
    <Shell
      tone="pending"
      title="To‘lov tasdiqlanmoqda"
      text={
        timedOut
          ? 'Tasdiq biroz kechikyapti. Mablag‘ yechilgan bo‘lsa, obuna bir necha daqiqada avtomatik faollashadi.'
          : 'Bu odatda bir necha soniya davom etadi. Sahifani yopmang.'
      }
      action={
        timedOut ? (
          <Link href="/billing"><Button variant="secondary">Obunam</Button></Link>
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
