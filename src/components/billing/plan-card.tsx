'use client';

import { CheckCircleFill, Sparkles } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  INTERVAL_SUFFIX,
  TIER_META,
  formatSum,
  formatSumShort,
  planFeatures,
} from '@/lib/billing';
import type { BillingPlan } from '@/types';

interface PlanCardProps {
  plan: BillingPlan;
  /** Yillik tarifda oylikka nisbatan tejash foizi (bo'lmasa — ko'rsatilmaydi) */
  savingPercent?: number | null;
  /** Foydalanuvchining joriy tarifi shumi */
  current?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onSelect: (plan: BillingPlan) => void;
}

/**
 * Tarif kartasi — App Store'ning obuna varaqasi ritmi: sirt tinch va oq,
 * urg'u FAQAT narx va bitta CTA'da. "Ommabop" tarif ranglar bilan emas,
 * nozik accent halqa + kichik tamg'a bilan ajratiladi (Charter §2:
 * premium = restraint).
 */
export function PlanCard({
  plan,
  savingPercent,
  current,
  loading,
  disabled,
  onSelect,
}: PlanCardProps) {
  const meta = TIER_META[plan.tier];
  const features = planFeatures(plan);
  /* Yillik tarifni oylik tilida ham ko'rsatamiz — odam ikki ustunni miyasida
     hisoblamasin (Apple/Claude obuna sahifalaridagi naqsh). */
  const perMonth = plan.interval === 'yearly' ? Math.round(plan.price / 12) : null;

  return (
    <div
      className={cn(
        'relative flex h-full flex-col rounded-ios-2xl bg-white p-6',
        // "Ommabop" — rangli fon emas, nozik accent halqa (iOS: urg'u kam va aniq)
        plan.isPopular ? 'ring-2 ring-accent-500' : 'ring-1 ring-slate-900/[0.06]',
      )}
    >
      {plan.isPopular && (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-accent-600 px-3 py-1 text-caption-1 font-semibold text-white">
          <Sparkles className="h-3 w-3" />
          Ommabop
        </span>
      )}

      {/* Sarlavha */}
      <div className="min-h-[3.5rem]">
        <h3 className="text-title-3 font-semibold text-brand-900">{plan.name}</h3>
        <p className="mt-1 text-footnote text-slate-500">
          {plan.description || meta.tagline}
        </p>
      </div>

      {/* Narx */}
      <div className="mt-5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-large-title font-bold tabular-nums tracking-tight text-brand-900">
            {formatSumShort(plan.price)}
          </span>
          <span className="text-subhead text-slate-500">
            so&apos;m{INTERVAL_SUFFIX[plan.interval]}
          </span>
        </div>
        {/* Ikkilamchi qator FAQAT yangi ma'lumot bo'lganda chiqadi — "/oy"
            yozuvini "Har oy" bilan takrorlash shovqin (Charter: restraint). */}
        {perMonth !== null && (
          <p className="mt-1 text-footnote text-slate-500">
            Oyiga taxminan {formatSum(perMonth)}
            {savingPercent ? ` · ${savingPercent}% tejaysiz` : ''}
          </p>
        )}
      </div>

      {/* Imkoniyatlar */}
      <ul className="mt-5 flex-1 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <CheckCircleFill className="mt-0.5 h-[17px] w-[17px] shrink-0 text-accent-600" />
            <span className="text-subhead text-slate-600">{f}</span>
          </li>
        ))}
      </ul>

      {/* Amal */}
      <div className="mt-6">
        {current ? (
          <div className="flex h-11 items-center justify-center rounded-ios-md bg-fill-tertiary text-callout font-semibold text-slate-600">
            Joriy tarifingiz
          </div>
        ) : (
          <Button
            fullWidth
            size="md"
            variant={plan.isPopular ? 'primary' : 'secondary'}
            loading={loading}
            disabled={disabled}
            onClick={() => onSelect(plan)}
          >
            Tanlash
          </Button>
        )}
      </div>
    </div>
  );
}
