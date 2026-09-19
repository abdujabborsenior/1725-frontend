'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircleFill, Sparkles } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  TIER_META,
  currencyLabel,
  formatSum,
  formatSumShort,
  planFeatures,
} from '@/lib/billing';
import type { AppLocale } from '@/i18n/routing';
import type { BillingPlan, PlanTier } from '@/types';

/**
 * Tarif nomi va shiori — joriy tilda.
 *
 * Backend `name`/`description` ni faqat o'zbekcha saqlaydi (seed ma'lumot,
 * lokalizatsiyasiz). Shuning uchun o'zbekcha sahifada bazadagi matn (SQL
 * orqali o'zgartirilsa ham darhol ko'rinadi), ruscha/inglizchada esa daraja
 * bo'yicha lug'atdagi nom va shior (`billing.tier.<tier>.name|tagline`).
 * Noma'lum daraja (backend yangisini qo'shsa) — bazadagi matn o'zicha.
 */
export function usePlanText() {
  const t = useTranslations('billing');
  const locale = useLocale() as AppLocale;
  return useMemo(() => {
    const known = (tier: string): tier is PlanTier => tier in TIER_META;
    return {
      name: (plan: { tier: PlanTier; name?: string | null }): string =>
        (locale === 'uz' && plan.name) || !known(plan.tier)
          ? (plan.name ?? plan.tier)
          : t(`tier.${plan.tier}.name`),
      tagline: (plan: { tier: PlanTier; description?: string | null }): string =>
        (locale === 'uz' && plan.description) || !known(plan.tier)
          ? (plan.description ?? '')
          : t(`tier.${plan.tier}.tagline`),
    };
  }, [t, locale]);
}

interface PlanCardProps {
  plan: BillingPlan;
  /** Yillik tarifda oylikka nisbatan tejash foizi (bo'lmasa — ko'rsatilmaydi) */
  savingPercent?: number | null;
  /** Foydalanuvchining joriy tarifi shumi */
  current?: boolean;
  /** Bosilganda to'lov usuli varaqasi ochiladi (kutish holati o'sha yerda) */
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
  onSelect,
}: PlanCardProps) {
  const t = useTranslations('planCard');
  const tb = useTranslations('billing');
  const locale = useLocale() as AppLocale;
  const planText = usePlanText();
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
          {t('popular')}
        </span>
      )}

      {/* Sarlavha */}
      <div className="min-h-[3.5rem]">
        <h3 className="text-title-3 font-semibold text-brand-900">{planText.name(plan)}</h3>
        <p className="mt-1 text-footnote text-slate-500">
          {planText.tagline(plan)}
        </p>
      </div>

      {/* Narx */}
      <div className="mt-5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-large-title font-bold tabular-nums tracking-tight text-brand-900">
            {formatSumShort(plan.price, locale)}
          </span>
          <span className="text-subhead text-slate-500">
            {currencyLabel(locale)}
            {tb(`intervalSuffix.${plan.interval}`)}
          </span>
        </div>
        {/* Ikkilamchi qator FAQAT yangi ma'lumot bo'lganda chiqadi — "/oy"
            yozuvini "Har oy" bilan takrorlash shovqin (Charter: restraint). */}
        {perMonth !== null && (
          <p className="mt-1 text-footnote text-slate-500">
            {t('perMonth', { sum: formatSum(perMonth, locale) })}
            {savingPercent ? ` · ${t('saving', { percent: String(savingPercent) })}` : ''}
          </p>
        )}
      </div>

      {/* Imkoniyatlar */}
      <ul className="mt-5 flex-1 space-y-2.5">
        {features.map((f) => (
          <li key={f.key} className="flex items-start gap-2.5">
            <CheckCircleFill className="mt-0.5 h-[17px] w-[17px] shrink-0 text-accent-600" />
            <span className="text-subhead text-slate-600">
              {tb(`features.${f.key}`, { count: f.count ?? 0 })}
            </span>
          </li>
        ))}
      </ul>

      {/* Amal */}
      <div className="mt-6">
        {current ? (
          <div className="flex h-11 items-center justify-center rounded-ios-md bg-fill-tertiary text-callout font-semibold text-slate-600">
            {t('current')}
          </div>
        ) : (
          <Button
            fullWidth
            size="md"
            variant={plan.isPopular ? 'primary' : 'secondary'}
            onClick={() => onSelect(plan)}
          >
            {t('select')}
          </Button>
        )}
      </div>
    </div>
  );
}
