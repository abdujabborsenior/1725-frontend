'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Sparkles } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  BUSINESS_MODEL_LABEL,
  NEED_HINT,
  NEED_LABEL,
  NEED_ORDER,
  STAGE_HINT,
  STAGE_LABEL,
  STAGE_ORDER,
  formatRange,
} from '@/lib/venture';
import type { BusinessModel, StartupStage, VentureNeed } from '@/types';

/**
 * Loyihaning **investorlar uchun** ixtiyoriy maydonlari.
 *
 * Mahsulot qarori (foydalanuvchi talabi): bu maydonlar HECH QACHON
 * majburiy emas va ularsiz loyiha bemalol e'lon qilinadi. Buning o'rniga
 * — to'ldirish nima berishini aytadigan tinch rag'bat va to'liqlik
 * ko'rsatkichi. "To'ldirmasangiz ko'rinmaysiz" ohangi qo'rqitadi;
 * "to'ldirsangiz yutasiz" ohangi ishlaydi.
 */

export interface InvestorFieldsValue {
  stage: StartupStage | '';
  businessModel: BusinessModel | '';
  needs: VentureNeed[];
  /** Foydalanuvchi MLN so'mda kiritadi — saqlashda so'mga o'giriladi. */
  askMinMln: string;
  askMaxMln: string;
  teamSize: string;
  monthlyRevenueMln: string;
  monthlyActiveUsers: string;
  payingCustomers: string;
  problemStatement: string;
  targetAudience: string;
  traction: string;
}

export const EMPTY_INVESTOR_FIELDS: InvestorFieldsValue = {
  stage: '',
  businessModel: '',
  needs: [],
  askMinMln: '',
  askMaxMln: '',
  teamSize: '',
  monthlyRevenueMln: '',
  monthlyActiveUsers: '',
  payingCustomers: '',
  problemStatement: '',
  targetAudience: '',
  traction: '',
};

/** MLN so'm → so'm. Bo'sh yoki noto'g'ri qiymat `undefined` (yuborilmaydi). */
function mlnToSum(value: string): number | undefined {
  const n = Number(String(value).replace(',', '.').trim());
  if (!value.trim() || !Number.isFinite(n) || n <= 0) return undefined;
  return Math.round(n * 1_000_000);
}

function toInt(value: string): number | undefined {
  const n = Number(String(value).trim());
  if (!value.trim() || !Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n);
}

/** Forma qiymatlarini API payload'iga o'giradi (faqat to'ldirilganlari). */
export function investorFieldsToPayload(v: InvestorFieldsValue) {
  return {
    stage: v.stage || undefined,
    businessModel: v.businessModel || undefined,
    needs: v.needs.length > 0 ? v.needs : undefined,
    askAmountMin: mlnToSum(v.askMinMln),
    askAmountMax: mlnToSum(v.askMaxMln),
    teamSize: toInt(v.teamSize),
    monthlyRevenue: mlnToSum(v.monthlyRevenueMln),
    monthlyActiveUsers: toInt(v.monthlyActiveUsers),
    payingCustomers: toInt(v.payingCustomers),
    problemStatement: v.problemStatement.trim() || undefined,
    targetAudience: v.targetAudience.trim() || undefined,
    traction: v.traction.trim() || undefined,
  };
}

/** Mavjud loyihadan forma qiymatlarini tiklaydi (tahrirlash rejimi). */
export function investorFieldsFromStartup(s?: {
  stage: StartupStage | null;
  businessModel: BusinessModel | null;
  needs: VentureNeed[];
  askAmountMin: number | null;
  askAmountMax: number | null;
  teamSize: number | null;
  monthlyRevenue: number | null;
  monthlyActiveUsers: number | null;
  payingCustomers: number | null;
  problemStatement: string | null;
  targetAudience: string | null;
  traction: string | null;
}): InvestorFieldsValue {
  if (!s) return EMPTY_INVESTOR_FIELDS;
  const mln = (n: number | null) => (n ? String(n / 1_000_000) : '');
  return {
    stage: s.stage ?? '',
    businessModel: s.businessModel ?? '',
    needs: s.needs ?? [],
    askMinMln: mln(s.askAmountMin),
    askMaxMln: mln(s.askAmountMax),
    teamSize: s.teamSize ? String(s.teamSize) : '',
    monthlyRevenueMln: mln(s.monthlyRevenue),
    monthlyActiveUsers: s.monthlyActiveUsers ? String(s.monthlyActiveUsers) : '',
    payingCustomers: s.payingCustomers ? String(s.payingCustomers) : '',
    problemStatement: s.problemStatement ?? '',
    targetAudience: s.targetAudience ?? '',
    traction: s.traction ?? '',
  };
}

/** Nechta muhim maydon to'ldirilgan (0–100) — faqat rag'bat uchun. */
function localCompleteness(v: InvestorFieldsValue): number {
  const wantsMoney = v.needs.includes('investment') || v.needs.includes('grant');
  const checks: boolean[] = [
    !!v.stage,
    v.needs.length > 0,
    v.problemStatement.trim().length >= 40,
    v.targetAudience.trim().length >= 3,
    !!v.businessModel,
    v.traction.trim().length >= 40,
    !!toInt(v.teamSize),
    !wantsMoney || !!mlnToSum(v.askMinMln) || !!mlnToSum(v.askMaxMln),
    !!mlnToSum(v.monthlyRevenueMln) ||
      !!toInt(v.monthlyActiveUsers) ||
      !!toInt(v.payingCustomers),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/* ── Ko'p tanlovli chip ───────────────────────────────────────── */

function ChipToggle({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'tappable rounded-ios-md px-3.5 py-2.5 text-left transition-colors duration-150',
        active
          ? 'bg-accent-600 text-white'
          : 'bg-fill-tertiary text-brand-900 hover:bg-fill-secondary',
      )}
    >
      <span className="block text-subhead font-medium">{label}</span>
      {hint && (
        <span
          className={cn(
            'mt-0.5 block text-caption-1',
            active ? 'text-white/80' : 'text-slate-500',
          )}
        >
          {hint}
        </span>
      )}
    </button>
  );
}

/* ── Bo'lim ───────────────────────────────────────────────────── */

export function InvestorFields({
  value,
  onChange,
  defaultOpen = false,
}: {
  value: InvestorFieldsValue;
  onChange: (next: InvestorFieldsValue) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const completeness = useMemo(() => localCompleteness(value), [value]);
  const wantsMoney =
    value.needs.includes('investment') || value.needs.includes('grant');

  const set = <K extends keyof InvestorFieldsValue>(
    key: K,
    v: InvestorFieldsValue[K],
  ) => onChange({ ...value, [key]: v });

  const toggleNeed = (need: VentureNeed) =>
    set(
      'needs',
      value.needs.includes(need)
        ? value.needs.filter((n) => n !== need)
        : [...value.needs, need],
    );

  const askSum = {
    min: mlnToSum(value.askMinMln) ?? null,
    max: mlnToSum(value.askMaxMln) ?? null,
  };

  return (
    <section className="overflow-hidden rounded-ios-lg bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="ios-row w-full text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ios-sm bg-indigo-50">
          <Sparkles className="h-[18px] w-[18px] text-indigo-600" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-body text-brand-900">
            Investorlar uchun{' '}
            <span className="text-slate-400">(ixtiyoriy)</span>
          </span>
          <span className="mt-0.5 block text-footnote text-slate-500">
            Loyihangiz bosqichi va ko&apos;rsatkichlarini kiritsangiz,
            investorlar qidiruvida ko&apos;rinasiz.
          </span>
        </span>
        {completeness > 0 && (
          <span className="shrink-0 text-footnote font-semibold tabular-nums text-accent-700">
            {completeness}%
          </span>
        )}
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-250 ease-ios',
            open && 'rotate-180',
          )}
          strokeWidth={2.5}
        />
      </button>

      {open && (
        <div className="hairline-t space-y-6 px-4 pb-5 pt-5">
          {/* Rag'bat — bosim emas, kafolat bilan */}
          <div className="rounded-ios-md bg-fill-tertiary px-3.5 py-3">
            <p className="text-footnote text-slate-600">
              Bu maydonlar to&apos;ldirilmasa ham loyihangiz e&apos;lon
              qilinadi. To&apos;ldirilsa — moslik aniqligi sezilarli oshadi va
              siz kriteriyasi mos investorlarning lentasiga tushasiz.
            </p>
            {completeness > 0 && (
              <div className="mt-2.5">
                <div className="h-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-accent-500 transition-[width] duration-300 ease-ios"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <p className="mt-1.5 text-caption-1 text-slate-500">
                  To&apos;ldirilgan: {completeness}%
                </p>
              </div>
            )}
          </div>

          {/* Bosqich */}
          <div className="space-y-2">
            <span className="text-subhead font-medium text-slate-500">
              Loyiha bosqichi
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {STAGE_ORDER.map((stage) => (
                <ChipToggle
                  key={stage}
                  active={value.stage === stage}
                  onClick={() => set('stage', value.stage === stage ? '' : stage)}
                  label={STAGE_LABEL[stage]}
                  hint={STAGE_HINT[stage]}
                />
              ))}
            </div>
          </div>

          {/* Nimaga muhtoj */}
          <div className="space-y-2">
            <span className="text-subhead font-medium text-slate-500">
              Nimaga muhtojsiz? (bir nechtasini tanlash mumkin)
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {NEED_ORDER.map((need) => (
                <ChipToggle
                  key={need}
                  active={value.needs.includes(need)}
                  onClick={() => toggleNeed(need)}
                  label={NEED_LABEL[need]}
                  hint={NEED_HINT[need]}
                />
              ))}
            </div>
            <p className="text-caption-1 text-slate-500">
              Kamida bittasini tanlasangiz, loyihangiz investorlar lentasiga
              qo&apos;shiladi.
            </p>
          </div>

          {/* Summa — faqat pul so'ralayotgan bo'lsa */}
          {wantsMoney && (
            <div className="space-y-2">
              <span className="text-subhead font-medium text-slate-500">
                Qancha mablag&apos; kerak?
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Eng kami (mln so'm)"
                  type="number"
                  inputMode="decimal"
                  placeholder="50"
                  value={value.askMinMln}
                  onChange={(e) => set('askMinMln', e.target.value)}
                />
                <Input
                  label="Eng ko'pi (mln so'm)"
                  type="number"
                  inputMode="decimal"
                  placeholder="200"
                  value={value.askMaxMln}
                  onChange={(e) => set('askMaxMln', e.target.value)}
                />
              </div>
              {(askSum.min || askSum.max) && (
                <p className="text-caption-1 text-slate-500">
                  Investorga shunday ko&apos;rinadi:{' '}
                  <span className="font-medium text-brand-900">
                    {formatRange(askSum.min, askSum.max)}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Muammo va auditoriya */}
          <div className="space-y-4">
            <Textarea
              label="Qanday muammoni hal qilyapsiz?"
              rows={3}
              placeholder="Masalan: fermerlar mahsulotini vositachilarga arzon topshirishga majbur, chunki xaridorga chiqish kanali yo'q."
              value={value.problemStatement}
              onChange={(e) => set('problemStatement', e.target.value)}
            />
            <Input
              label="Kim uchun?"
              placeholder="Masalan: kichik fermer xo'jaliklari"
              value={value.targetAudience}
              onChange={(e) => set('targetAudience', e.target.value)}
            />
            <Select
              label="Biznes modeli"
              options={[
                { value: '', label: 'Tanlanmagan' },
                ...Object.entries(BUSINESS_MODEL_LABEL).map(([v, label]) => ({
                  value: v,
                  label,
                })),
              ]}
              value={value.businessModel}
              onChange={(e) =>
                set('businessModel', e.target.value as BusinessModel | '')
              }
            />
          </div>

          {/* Ko'rsatkichlar */}
          <div className="space-y-2">
            <span className="text-subhead font-medium text-slate-500">
              Ko&apos;rsatkichlar
            </span>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Jamoa (kishi)"
                type="number"
                inputMode="numeric"
                placeholder="4"
                value={value.teamSize}
                onChange={(e) => set('teamSize', e.target.value)}
              />
              <Input
                label="Oylik daromad (mln so'm)"
                type="number"
                inputMode="decimal"
                placeholder="12"
                value={value.monthlyRevenueMln}
                onChange={(e) => set('monthlyRevenueMln', e.target.value)}
              />
              <Input
                label="Oylik faol foydalanuvchi"
                type="number"
                inputMode="numeric"
                placeholder="3000"
                value={value.monthlyActiveUsers}
                onChange={(e) => set('monthlyActiveUsers', e.target.value)}
              />
              <Input
                label="To'lovchi mijoz"
                type="number"
                inputMode="numeric"
                placeholder="240"
                value={value.payingCustomers}
                onChange={(e) => set('payingCustomers', e.target.value)}
              />
            </div>
            <p className="text-caption-1 text-slate-500">
              Bilganingizni yozing — hammasini bilish shart emas.
            </p>
          </div>

          <Textarea
            label="Nimaga erishdingiz?"
            rows={3}
            placeholder="Masalan: uch oyda 3000 foydalanuvchi va 240 obunachi yig'ildi, oylik o'sish 22 foiz."
            value={value.traction}
            onChange={(e) => set('traction', e.target.value)}
          />
        </div>
      )}
    </section>
  );
}
