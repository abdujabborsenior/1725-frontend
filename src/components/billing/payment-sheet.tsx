'use client';

import { useEffect, useMemo, useState } from 'react';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ClickMark, PaymeMark } from '@/components/brand/payment-marks';
import { CheckCircleFill, Lock } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  INTERVAL_LABEL,
  PROVIDER_META,
  PROVIDER_ORDER,
  formatSum,
} from '@/lib/billing';
import type { BillingPlan, PaymentProvider } from '@/types';

interface PaymentSheetProps {
  open: boolean;
  plan: BillingPlan | null;
  /** Backend sozlagan usullar (`/billing/status`) */
  providers: PaymentProvider[];
  loading?: boolean;
  onClose: () => void;
  onConfirm: (provider: PaymentProvider) => void;
}

/**
 * To'lov usulini tanlash varaqasi.
 *
 * Nega darhol provayderga yo'naltirmaymiz: foydalanuvchi tashqi saytga
 * chiqishdan OLDIN nima uchun va qancha to'layotganini ko'rishi kerak —
 * bu to'lov oqimidagi ishonch nuqtasi (va qaytishlar sonini kamaytiradi).
 *
 * Dizayn tamoyili: brend ranglari faqat belgining o'zida va tanlanganda
 * paydo bo'ladigan nozik nurda. Tugma va matnlar loyihaning o'z tilida
 * qoladi — begona ranglarni interfeysga yoyish bachkana ko'rinadi.
 */
export function PaymentSheet({
  open,
  plan,
  providers,
  loading,
  onClose,
  onConfirm,
}: PaymentSheetProps) {
  const available = useMemo(
    () => PROVIDER_ORDER.filter((p) => providers.includes(p)),
    [providers],
  );
  const [selected, setSelected] = useState<PaymentProvider | null>(null);

  // Varaqa ochilganda birinchi usul tanlangan bo'ladi — foydalanuvchi
  // bitta bosishda to'lovga o'ta oladi (ortiqcha qadam yo'q).
  useEffect(() => {
    if (open) setSelected(available[0] ?? null);
  }, [open, available]);

  if (!plan) return null;

  return (
    <Modal open={open} onClose={onClose} className="max-w-md">
      {/* ── Nima uchun to'lanmoqda ──────────────────────────── */}
      <div className="text-center">
        <p className="text-footnote text-slate-500">
          {plan.name} · {INTERVAL_LABEL[plan.interval]}
        </p>
        <p className="mt-1 text-large-title font-bold tabular-nums tracking-tight text-brand-900">
          {formatSum(plan.price)}
        </p>
        <p className="mt-1 text-footnote text-slate-500">
          {plan.startupLimit === 1
            ? '1 ta loyiha e’lon qilish'
            : `${plan.startupLimit} tagacha loyiha e’lon qilish`}
        </p>
      </div>

      {/* ── Usul tanlash ────────────────────────────────────── */}
      <div className="mt-6 space-y-2.5" role="radiogroup" aria-label="To‘lov usuli">
        {available.map((provider) => {
          const meta = PROVIDER_META[provider];
          const active = selected === provider;
          return (
            <button
              key={provider}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(provider)}
              className={cn(
                'flex w-full items-center gap-3.5 rounded-ios-xl bg-white p-3.5 text-left',
                'transition-[box-shadow,transform] duration-200 ease-ios active:scale-[0.99]',
                active
                  ? 'ring-2 ring-accent-500'
                  : 'ring-1 ring-slate-900/[0.07]',
              )}
            >
              {/*
                Belgi maydoni — 72×48. Ikki brendning proporsiyasi juda farqli
                (Payme ~1.2:1 blok, Click ~3.9:1 gorizontal so'z belgisi),
                shuning uchun ular BIR XIL o'lchamga majburlanmaydi: har biri
                optik og'irligi teng ko'rinadigan qiymatga sozlangan
                (Payme — balandlik bo'yicha, Click — kenglik bo'yicha).
                Bu — brend belgilarini joylashtirishning standart qoidasi.
              */}
              <span className="relative flex h-12 w-[72px] shrink-0 items-center justify-center rounded-ios-md bg-fill-tertiary">
                <span
                  aria-hidden
                  className={cn(
                    'absolute inset-0 rounded-ios-md transition-opacity duration-300 ease-ios',
                    active ? 'opacity-100' : 'opacity-0',
                  )}
                  style={{
                    boxShadow: `0 0 0 1px ${meta.brand}66, 0 8px 20px -8px ${meta.brand}`,
                  }}
                />
                <span className="relative text-brand-900">
                  {provider === 'payme' ? (
                    <PaymeMark className="h-[30px] w-auto" />
                  ) : (
                    <ClickMark className="w-[58px] h-auto" />
                  )}
                </span>
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-body font-medium text-brand-900">
                  {meta.label}
                </span>
                <span className="mt-0.5 block text-footnote text-slate-500">
                  {meta.cards}
                </span>
              </span>

              {active ? (
                <CheckCircleFill className="h-[22px] w-[22px] shrink-0 text-accent-600" />
              ) : (
                <span className="h-[22px] w-[22px] shrink-0 rounded-full border-[1.5px] border-slate-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Amal ────────────────────────────────────────────── */}
      <div className="mt-6 space-y-3">
        <Button
          fullWidth
          size="lg"
          loading={loading}
          disabled={!selected}
          onClick={() => selected && onConfirm(selected)}
        >
          {formatSum(plan.price)} to‘lash
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-caption-1 text-slate-500">
          <Lock className="h-3.5 w-3.5" />
          To‘lov {selected ? PROVIDER_META[selected].label : 'provayder'} sahifasida
          amalga oshiriladi
        </p>
      </div>
    </Modal>
  );
}
