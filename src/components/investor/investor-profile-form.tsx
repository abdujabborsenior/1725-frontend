'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { investorsApi, getErrorMessage, type InvestorProfilePayload } from '@/lib/api';
import { UZ_REGIONS } from '@/lib/constants';
import { useCategoryList } from '@/lib/use-categories';
import { useCategoryLabel } from '@/lib/category-labels';
import { cn } from '@/lib/utils';
import { INVESTOR_KIND_ORDER, NEED_ORDER, STAGE_ORDER, formatRange, stageMessageKey } from '@/lib/venture';
import type { AppLocale } from '@/i18n/routing';
import type { InvestorKind, InvestorProfile, StartupStage, VentureNeed } from '@/types';

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'tappable rounded-full px-3.5 py-1.5 text-footnote font-medium transition-colors duration-150',
        active
          ? 'bg-accent-600 text-white'
          : 'bg-fill-tertiary text-slate-600 hover:bg-accent-50 hover:text-accent-700',
      )}
    >
      {children}
    </button>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-title-3 font-semibold text-brand-900">{title}</h2>
        {hint && <p className="mt-0.5 text-footnote text-slate-500">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

const mlnToSum = (v: string): number | undefined => {
  const n = Number(String(v).replace(',', '.').trim());
  return !v.trim() || !Number.isFinite(n) || n <= 0
    ? undefined
    : Math.round(n * 1_000_000);
};

/**
 * Investor kriteriyalari formasi.
 *
 * Muhim mahsulot qoidasi: **bo'sh tanlov = cheklov yo'q**. Yangi investor
 * hech narsa tanlamasdan ham lentani ko'radi va keyin toraytiradi — bo'sh
 * lenta bilan uchrashishdan ko'ra yaxshiroq.
 */
export function InvestorProfileForm({ initial }: { initial?: InvestorProfile | null }) {
  const t = useTranslations('investorForm');
  const tv = useTranslations('venture');
  const tr = useTranslations('regions');
  const tc = useTranslations('common');
  const locale = useLocale() as AppLocale;
  const qc = useQueryClient();
  const [kind, setKind] = useState<InvestorKind>(initial?.kind ?? 'angel');
  const [orgName, setOrgName] = useState(initial?.orgName ?? '');
  const [website, setWebsite] = useState(initial?.website ?? '');
  const [thesis, setThesis] = useState(initial?.thesis ?? '');
  const [categories, setCategories] = useState<string[]>(initial?.categories ?? []);
  // Sohalar ro'yxati bazadan. Ilgari tanlangan, lekin ro'yxatдан chiqarilgan
  // soha ham ko'rinadi — aks holda uni bekor qilib bo'lmasdi.
  const categoryList = useCategoryList('startup');
  const categoryLabel = useCategoryLabel();
  const categoryOptions = useMemo(
    () => [
      ...categoryList,
      ...categories
        .filter((c) => !categoryList.some((o) => o.value === c))
        .map((c) => ({ value: c, label: categoryLabel(c) })),
    ],
    [categoryList, categories, categoryLabel],
  );
  const [stages, setStages] = useState<StartupStage[]>(initial?.stages ?? []);
  const [regions, setRegions] = useState<string[]>(initial?.regions ?? []);
  const [offers, setOffers] = useState<VentureNeed[]>(initial?.offers ?? []);
  const [checkMin, setCheckMin] = useState(
    initial?.checkMin ? String(initial.checkMin / 1_000_000) : '',
  );
  const [checkMax, setCheckMax] = useState(
    initial?.checkMax ? String(initial.checkMax / 1_000_000) : '',
  );
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? '');
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone ?? '');
  const [alertsEnabled, setAlerts] = useState(initial?.alertsEnabled ?? true);
  const [isActive, setActive] = useState(initial?.isActive ?? true);

  const toggle = <T,>(list: T[], set: (v: T[]) => void, item: T) =>
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const payload: InvestorProfilePayload = {
        kind,
        orgName: orgName.trim() || undefined,
        website: website.trim() || undefined,
        thesis: thesis.trim() || undefined,
        categories,
        stages,
        regions,
        offers,
        checkMin: mlnToSum(checkMin),
        checkMax: mlnToSum(checkMax),
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        alertsEnabled,
        isActive,
      };
      return investorsApi.upsert(payload);
    },
    onSuccess: (res) => {
      toast.success(res.message);
      void qc.invalidateQueries({ queryKey: ['investor-me'] });
      void qc.invalidateQueries({ queryKey: ['dealflow'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const thesisTooShort = thesis.trim().length > 0 && thesis.trim().length < 20;
  const range = { min: mlnToSum(checkMin) ?? null, max: mlnToSum(checkMax) ?? null };
  const rangeInvalid =
    range.min !== null && range.max !== null && range.min > range.max;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (thesisTooShort) {
          toast.error(t('errors.thesisShort'));
          return;
        }
        if (rangeInvalid) {
          toast.error(t('errors.range'));
          return;
        }
        mutate();
      }}
      className="space-y-9"
    >
      <Section title={t('who.title')}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {INVESTOR_KIND_ORDER.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
              className={cn(
                'tappable rounded-ios-md px-3.5 py-3 text-left transition-colors duration-150',
                kind === k
                  ? 'bg-accent-600 text-white'
                  : 'bg-white text-brand-900 hover:bg-accent-50 hover:text-accent-700',
              )}
            >
              <span className="block text-subhead font-medium">
                {tv(`investorKind.${k}`)}
              </span>
              <span
                className={cn(
                  'mt-0.5 block text-caption-1',
                  kind === k ? 'text-white/95' : 'text-slate-500',
                )}
              >
                {tv(`investorKindHint.${k}`)}
              </span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label={t('who.orgName')}
            placeholder={t('who.orgNamePlaceholder')}
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
          <Input
            label={t('who.website')}
            placeholder="uzventures.uz"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
      </Section>

      <Section title={t('thesis.title')} hint={t('thesis.hint')}>
        <Textarea
          rows={4}
          placeholder={t('thesis.placeholder')}
          value={thesis}
          onChange={(e) => setThesis(e.target.value)}
        />
        {thesisTooShort && (
          <p className="text-caption-1 text-rose-600">
            {t('thesis.tooShort')}
          </p>
        )}
      </Section>

      <Section title={t('criteria.title')} hint={t('criteria.hint')}>
        <div className="space-y-5">
          <div className="space-y-2">
            <span className="text-subhead font-medium text-slate-500">{t('criteria.sectors')}</span>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((c) => (
                <Chip
                  key={c.value}
                  active={categories.includes(c.value)}
                  onClick={() => toggle(categories, setCategories, c.value)}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-subhead font-medium text-slate-500">{t('criteria.stages')}</span>
            <div className="flex flex-wrap gap-2">
              {STAGE_ORDER.map((s) => (
                <Chip
                  key={s}
                  active={stages.includes(s)}
                  onClick={() => toggle(stages, setStages, s)}
                >
                  {tv(`stage.${stageMessageKey(s)}`)}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-subhead font-medium text-slate-500">{t('criteria.regions')}</span>
            <div className="flex flex-wrap gap-2">
              {UZ_REGIONS.map((r) => (
                <Chip
                  key={r.value}
                  active={regions.includes(r.value)}
                  onClick={() => toggle(regions, setRegions, r.value)}
                >
                  {tr(r.key)}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-subhead font-medium text-slate-500">
              {t('criteria.offers')}
            </span>
            <div className="flex flex-wrap gap-2">
              {NEED_ORDER.map((o) => (
                <Chip
                  key={o}
                  active={offers.includes(o)}
                  onClick={() => toggle(offers, setOffers, o)}
                >
                  {tv(`offer.${o}`)}
                </Chip>
              ))}
            </div>
            <p className="text-caption-1 text-slate-500">
              {t('criteria.offersHint')}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-subhead font-medium text-slate-500">
              {t('criteria.check')}
            </span>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                inputMode="decimal"
                placeholder="50"
                label={t('criteria.checkMin')}
                value={checkMin}
                onChange={(e) => setCheckMin(e.target.value)}
              />
              <Input
                type="number"
                inputMode="decimal"
                placeholder="500"
                label={t('criteria.checkMax')}
                value={checkMax}
                onChange={(e) => setCheckMax(e.target.value)}
              />
            </div>
            {(range.min || range.max) && (
              <p
                className={cn(
                  'text-caption-1',
                  rangeInvalid ? 'text-rose-600' : 'text-slate-500',
                )}
              >
                {rangeInvalid
                  ? t('criteria.rangeInvalid')
                  : t('criteria.range', { range: formatRange(range.min, range.max, locale) })}
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section title={t('contact.title')} hint={t('contact.hint')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label={t('contact.email')}
            type="email"
            placeholder="invest@example.uz"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <Input
            label={t('contact.phone')}
            placeholder="+998 90 123 45 67"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
      </Section>

      <Section title={t('settings.title')}>
        <div className="overflow-hidden rounded-ios-lg bg-white">
          <div className="ios-row">
            <span className="min-w-0 flex-1">
              <span className="block text-body text-brand-900">
                {t('settings.alerts')}
              </span>
              <span className="mt-0.5 block text-footnote text-slate-500">
                {t('settings.alertsHint')}
              </span>
            </span>
            <Switch
              checked={alertsEnabled}
              onChange={setAlerts}
              aria-label={t('settings.alertsAria')}
            />
          </div>
          <div className="ios-row hairline-t">
            <span className="min-w-0 flex-1">
              <span className="block text-body text-brand-900">{t('settings.active')}</span>
              <span className="mt-0.5 block text-footnote text-slate-500">
                {t('settings.activeHint')}
              </span>
            </span>
            <Switch checked={isActive} onChange={setActive} aria-label={t('settings.active')} />
          </div>
        </div>
      </Section>

      <Button type="submit" loading={isPending} className="w-full">
        {initial ? tc('save') : t('create')}
      </Button>
    </form>
  );
}
