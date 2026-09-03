'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { investorsApi, getErrorMessage, type InvestorProfilePayload } from '@/lib/api';
import { UZ_REGIONS } from '@/lib/constants';
import { useCategoryNames } from '@/lib/use-categories';
import { cn } from '@/lib/utils';
import {
  INVESTOR_KIND_HINT,
  INVESTOR_KIND_LABEL,
  NEED_ORDER,
  OFFER_LABEL,
  STAGE_LABEL,
  STAGE_ORDER,
  formatRange,
} from '@/lib/venture';
import type { InvestorKind, InvestorProfile, StartupStage, VentureNeed } from '@/types';

const KINDS: InvestorKind[] = ['angel', 'fund', 'accelerator', 'grant', 'corporate'];

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
  const qc = useQueryClient();
  const [kind, setKind] = useState<InvestorKind>(initial?.kind ?? 'angel');
  const [orgName, setOrgName] = useState(initial?.orgName ?? '');
  const [website, setWebsite] = useState(initial?.website ?? '');
  const [thesis, setThesis] = useState(initial?.thesis ?? '');
  const [categories, setCategories] = useState<string[]>(initial?.categories ?? []);
  // Sohalar ro'yxati bazadan. Ilgari tanlangan, lekin ro'yxatдан chiqarilgan
  // soha ham ko'rinadi — aks holda uni bekor qilib bo'lmasdi.
  const categoryNames = useCategoryNames('startup');
  const categoryOptions = useMemo(
    () => [...categoryNames, ...categories.filter((c) => !categoryNames.includes(c))],
    [categoryNames, categories],
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
          toast.error('Tezis kamida 20 ta belgi bo‘lsin yoki bo‘sh qoldiring');
          return;
        }
        if (rangeInvalid) {
          toast.error('Chekning quyi chegarasi yuqorisidan katta bo‘lmasin');
          return;
        }
        mutate();
      }}
      className="space-y-9"
    >
      <Section title="Siz kimsiz?">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {KINDS.map((k) => (
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
                {INVESTOR_KIND_LABEL[k]}
              </span>
              <span
                className={cn(
                  'mt-0.5 block text-caption-1',
                  kind === k ? 'text-white/95' : 'text-slate-500',
                )}
              >
                {INVESTOR_KIND_HINT[k]}
              </span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Tashkilot nomi (ixtiyoriy)"
            placeholder="Masalan: UzVentures"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
          <Input
            label="Veb-sayt (ixtiyoriy)"
            placeholder="uzventures.uz"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
      </Section>

      <Section
        title="Investitsiya tezisingiz"
        hint="Nimaga qiziqasiz, nimadan qochasiz — o'z so'zingiz bilan. Moslikning mazmuniy qismi aynan shu matnga tayanadi."
      >
        <Textarea
          rows={4}
          placeholder="Masalan: ta'lim va sog'liqni saqlash sohasidagi erta bosqich loyihalarga qiziqaman. Jamoada texnik asoschi bo'lishi muhim."
          value={thesis}
          onChange={(e) => setThesis(e.target.value)}
        />
        {thesisTooShort && (
          <p className="text-caption-1 text-rose-600">
            Kamida 20 ta belgi bo&apos;lsin yoki butunlay bo&apos;sh qoldiring.
          </p>
        )}
      </Section>

      <Section
        title="Kriteriyalaringiz"
        hint="Tanlamasangiz — cheklov yo'q deb hisoblanadi va lentaga hamma tushadi."
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <span className="text-subhead font-medium text-slate-500">Sohalar</span>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((c) => (
                <Chip
                  key={c}
                  active={categories.includes(c)}
                  onClick={() => toggle(categories, setCategories, c)}
                >
                  {c}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-subhead font-medium text-slate-500">Bosqichlar</span>
            <div className="flex flex-wrap gap-2">
              {STAGE_ORDER.map((s) => (
                <Chip
                  key={s}
                  active={stages.includes(s)}
                  onClick={() => toggle(stages, setStages, s)}
                >
                  {STAGE_LABEL[s]}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-subhead font-medium text-slate-500">Hududlar</span>
            <div className="flex flex-wrap gap-2">
              {UZ_REGIONS.map((r) => (
                <Chip
                  key={r}
                  active={regions.includes(r)}
                  onClick={() => toggle(regions, setRegions, r)}
                >
                  {r}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-subhead font-medium text-slate-500">
              Siz nima taklif qilasiz?
            </span>
            <div className="flex flex-wrap gap-2">
              {NEED_ORDER.map((o) => (
                <Chip
                  key={o}
                  active={offers.includes(o)}
                  onClick={() => toggle(offers, setOffers, o)}
                >
                  {OFFER_LABEL[o]}
                </Chip>
              ))}
            </div>
            <p className="text-caption-1 text-slate-500">
              Loyihalarning ehtiyoji shu ro&apos;yxat bilan solishtiriladi.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-subhead font-medium text-slate-500">
              Chek hajmi (mln so&apos;m)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                inputMode="decimal"
                placeholder="50"
                label="Eng kami"
                value={checkMin}
                onChange={(e) => setCheckMin(e.target.value)}
              />
              <Input
                type="number"
                inputMode="decimal"
                placeholder="500"
                label="Eng ko'pi"
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
                  ? 'Quyi chegara yuqorisidan katta bo‘lmasin'
                  : `Oraliq: ${formatRange(range.min, range.max)}`}
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section
        title="Aloqa"
        hint="Bu ma'lumot asoschilarga KO'RINMAYDI — u faqat so'rov qabul qilinganda, chat orqali almashinadi."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Email (ixtiyoriy)"
            type="email"
            placeholder="invest@example.uz"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <Input
            label="Telefon (ixtiyoriy)"
            placeholder="+998 90 123 45 67"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
      </Section>

      <Section title="Sozlamalar">
        <div className="overflow-hidden rounded-ios-lg bg-white">
          <div className="ios-row">
            <span className="min-w-0 flex-1">
              <span className="block text-body text-brand-900">
                Yangi mosliklar haqida xabar
              </span>
              <span className="mt-0.5 block text-footnote text-slate-500">
                Kriteriyangizga mos loyiha chiqqanda bildirishnoma
              </span>
            </span>
            <Switch
              checked={alertsEnabled}
              onChange={setAlerts}
              aria-label="Bildirishnomalar"
            />
          </div>
          <div className="ios-row hairline-t">
            <span className="min-w-0 flex-1">
              <span className="block text-body text-brand-900">Lenta faol</span>
              <span className="mt-0.5 block text-footnote text-slate-500">
                O&apos;chirsangiz yangi mosliklar hisoblanmaydi
              </span>
            </span>
            <Switch checked={isActive} onChange={setActive} aria-label="Lenta faol" />
          </div>
        </div>
      </Section>

      <Button type="submit" loading={isPending} className="w-full">
        {initial ? 'Saqlash' : 'Profilni yaratish'}
      </Button>
    </form>
  );
}
