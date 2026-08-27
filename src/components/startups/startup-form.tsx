'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Plus, X } from '@/components/icons';
import { startupsApi, getErrorMessage, type StartupPayload } from '@/lib/api';
import { BILLING_ENABLED, isStartupLimitError } from '@/lib/billing';
import type { Startup } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { CoverVideoInput } from './cover-video-input';
import {
  LinkFields,
  invalidLinks,
  linksFromPlatforms,
  platformsFromLinks,
  type LinkValues,
} from './link-fields';
import {
  InvestorFields,
  investorFieldsFromStartup,
  investorFieldsToPayload,
  type InvestorFieldsValue,
} from './investor-fields';
import { STARTUP_CATEGORIES, UZ_REGIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(2, 'Kamida 2 ta belgi').max(200, "Ko'pi bilan 200 ta belgi"),
  tagline: z.string().max(300, "Ko'pi bilan 300 ta belgi").optional(),
  description: z.string().min(20, 'Kamida 20 ta belgi').max(10000),
  category: z.string().optional(),
  region: z.string().optional(),
  district: z.string().max(100).optional(),
  teamName: z.string().max(150).optional(),
  foundedYear: z
    .union([z.coerce.number().int().min(1990, 'Min 1990').max(2100, 'Max 2100'), z.literal('')])
    .optional(),
});

type FormData = z.infer<typeof schema>;

const REGION_OPTIONS = [
  { value: '', label: 'Hudud (ixtiyoriy)' },
  ...UZ_REGIONS.map((r) => ({ value: r, label: r })),
];

/** Forma bo'limi — iOS'dagi guruhlangan bo'lim sarlavhasi bilan. */
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

/** Startap joylash/tahrirlash formasi — minimal majburiy maydon, qolgani ixtiyoriy. */
export function StartupForm({ initial }: { initial?: Startup }) {
  const router = useRouter();
  const qc = useQueryClient();
  const editing = !!initial;

  const [logoUrl, setLogoUrl] = useState<string | null>(initial?.logoUrl ?? null);
  const [coverUrl, setCoverUrl] = useState<string | null>(initial?.coverUrl ?? null);
  const [videoUrl, setVideoUrl] = useState<string | null>(initial?.videoUrl ?? null);
  const [links, setLinks] = useState<LinkValues>(() => linksFromPlatforms(initial?.platforms));
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [investor, setInvestor] = useState<InvestorFieldsValue>(() =>
    investorFieldsFromStartup(initial),
  );
  const [moreOpen, setMoreOpen] = useState(
    !!(initial?.region || initial?.teamName || initial?.foundedYear || initial?.tags.length),
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? '',
      tagline: initial?.tagline ?? '',
      description: initial?.description ?? '',
      category: initial?.category ?? '',
      region: initial?.region ?? '',
      district: initial?.district ?? '',
      teamName: initial?.teamName ?? '',
      foundedYear: initial?.foundedYear ?? '',
    },
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: (d: FormData) => {
      const payload: StartupPayload = {
        title: d.title.trim(),
        tagline: d.tagline?.trim() || undefined,
        description: d.description.trim(),
        category: d.category || undefined,
        region: d.region || undefined,
        district: d.district?.trim() || undefined,
        teamName: d.teamName?.trim() || undefined,
        foundedYear:
          d.foundedYear === '' || d.foundedYear === undefined ? undefined : Number(d.foundedYear),
        logoUrl: logoUrl ?? undefined,
        coverUrl: coverUrl ?? undefined,
        videoUrl: videoUrl ?? undefined,
        platforms: platformsFromLinks(links),
        tags,
        // Investorlar uchun maydonlar — faqat to'ldirilganlari yuboriladi
        // (bo'sh qiymat `undefined` bo'lib tushadi va serverga bormaydi).
        ...investorFieldsToPayload(investor),
      } as StartupPayload;
      return editing ? startupsApi.update(initial.id, payload) : startupsApi.create(payload);
    },
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['startups'] });
      void qc.invalidateQueries({ queryKey: ['startup'] });
      toast.success(editing ? 'Startap yangilandi!' : "Startap e'lon qilindi!");
      router.push(`/startups/${res.data.id}`);
    },
    onError: (e) => {
      // Tarif limiti tugagan — bu "xato" emas, tarif tanlash taklifi.
      // (Bo'lim o'chiq bo'lsa bunday javob umuman kelmaydi.)
      if (BILLING_ENABLED && isStartupLimitError(e)) {
        toast.error(getErrorMessage(e, 'Loyihalar limiti tugagan'));
        router.push('/pricing');
        return;
      }
      toast.error(getErrorMessage(e));
    },
  });

  function onSubmit(d: FormData) {
    // Havola maydonlari — noto'g'ri to'ldirilgani bo'lsa yuborilmaydi
    if (invalidLinks(links).length > 0) {
      toast.error("Havolalardan biri noto'g'ri — tekshirib qo'ying");
      return;
    }
    submit(d);
  }

  function addTag() {
    const t = tagInput.trim().replace(/^#/, '');
    if (!t) return;
    if (t.length > 40) {
      toast.error("Teg ko'pi bilan 40 ta belgi");
      return;
    }
    if (tags.includes(t) || tags.length >= 15) return;
    setTags((l) => [...l, t]);
    setTagInput('');
  }

  const descLength = watch('description')?.length ?? 0;
  const selectedCategory = watch('category');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-9">
      {/* ── 1. Asosiy ma'lumot ──────────────────────────────── */}
      <Section title="Asosiy ma'lumot">
        <div className="space-y-4">
          <Input
            label="Startap nomi"
            placeholder="Masalan: EcoDelivery"
            error={errors.title?.message}
            {...register('title')}
          />
          <Input
            label="Bir jumlada (ixtiyoriy)"
            placeholder="Startapingiz nima qiladi? — qisqa va lo'nda"
            error={errors.tagline?.message}
            {...register('tagline')}
          />
          <Textarea
            label="Tavsif (nega odamlar aynan sizning loyihangizdan foydalanishi kerak?)"
            rows={7}
            placeholder="Startapingiz haqida batafsil: qanday muammoni hal qiladi, kim uchun, nimasi bilan ajralib turadi..."
            count={{ current: descLength, max: 10000 }}
            hint={descLength > 0 && descLength < 20 ? 'Kamida 20 ta belgi' : undefined}
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="flex flex-col gap-2">
            <span className="text-subhead font-medium text-slate-500">Kategoriya (ixtiyoriy)</span>
            <div className="flex flex-wrap gap-2">
              {STARTUP_CATEGORIES.map((cat) => {
                const selected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setValue('category', selected ? '' : cat)}
                    className={cn(
                      'tappable rounded-full px-3.5 py-1.5 text-subhead font-medium transition-colors duration-150 ease-ios',
                      selected ? 'bg-accent-600 text-white' : 'bg-fill-tertiary text-slate-600',
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 2. Media (ixtiyoriy) ────────────────────────────── */}
      <Section
        title="Media"
        hint="Ixtiyoriy — logo, muqova rasmi yoki video startapingizga ishonch qo'shadi"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[140px_1fr]">
            <ImageUpload label="Logo" aspect="logo" value={logoUrl} onChange={setLogoUrl} />
            <ImageUpload
              label="Muqova rasmi"
              aspect="video"
              value={coverUrl}
              onChange={setCoverUrl}
            />
          </div>
          {/* Muqova videosi — rasm o'rniga video turishi mumkin (YouTube yoki yuklangan) */}
          <CoverVideoInput value={videoUrl} onChange={setVideoUrl} posterUrl={coverUrl} />
        </div>
      </Section>

      {/* ── 3. Havolalar — har platformaning o'z maydoni ─────── */}
      <Section
        title="Havolalar"
        hint="Foydalanuvchilar startapingizni qayerdan topadi? Bittasini to'ldirsangiz ham bo'ladi."
      >
        <LinkFields values={links} onChange={setLinks} />
      </Section>

      {/* ── 4. Investorlar uchun (ixtiyoriy, yig'ma) ─────────── */}
      <InvestorFields
        value={investor}
        onChange={setInvestor}
        defaultOpen={!!initial?.stage || (initial?.needs?.length ?? 0) > 0}
      />

      {/* ── 5. Qo'shimcha (yig'ma) ──────────────────────────── */}
      <section className="overflow-hidden rounded-ios-lg bg-white">
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
          className="ios-row w-full text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-body text-brand-900">Qo&apos;shimcha ma&apos;lumotlar</span>
            <span className="mt-0.5 block text-footnote text-slate-500">
              Hudud, jamoa, teglar — ixtiyoriy
            </span>
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-250 ease-ios',
              moreOpen && 'rotate-180',
            )}
            strokeWidth={2.5}
          />
        </button>
        {moreOpen && (
          <div className="hairline-t space-y-4 px-4 pb-5 pt-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select
                label="Hudud"
                options={REGION_OPTIONS}
                error={errors.region?.message}
                {...register('region')}
              />
              <Input
                label="Tuman / shahar"
                placeholder="Masalan: Chilonzor"
                error={errors.district?.message}
                {...register('district')}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Jamoa nomi"
                placeholder="Masalan: EcoTeam"
                error={errors.teamName?.message}
                {...register('teamName')}
              />
              <Input
                label="Tashkil etilgan yil"
                type="number"
                placeholder="2024"
                error={errors.foundedYear?.message}
                {...register('foundedYear')}
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-subhead font-medium text-slate-500">Teglar (maks. 15)</span>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Masalan: AI, SaaS, logistika"
                  className="h-11 flex-1 rounded-ios-md border border-slate-200 bg-white px-3.5 text-body text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus"
                />
                <button
                  type="button"
                  onClick={addTag}
                  aria-label="Teg qo'shish"
                  className="tappable flex h-11 w-11 shrink-0 items-center justify-center rounded-ios-md bg-fill-tertiary text-slate-600"
                >
                  <Plus className="h-[18px] w-[18px]" strokeWidth={2.5} />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 rounded-full bg-fill-tertiary px-3 py-1 text-footnote font-medium text-slate-600"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => setTags((l) => l.filter((x) => x !== t))}
                        aria-label={`${t} tegini o'chirish`}
                        className="tappable text-slate-400"
                      >
                        <X className="h-3 w-3" strokeWidth={3} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Yuborish ────────────────────────────────────────── */}
      {!editing && (
        <p className="rounded-ios-lg bg-accent-50 px-4 py-3 text-subhead leading-relaxed text-slate-600">
          Startapingiz yuborilgan zahoti{' '}
          <span className="font-medium text-accent-700">e&apos;lon qilinadi</span> — tasdiqlash
          kutish shart emas. Keyin xohlagan payt tahrirlashingiz mumkin.
        </p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={() => router.back()}>
          Bekor qilish
        </Button>
        <Button type="submit" variant="accent" size="lg" loading={isPending} className="flex-1">
          {editing ? 'Saqlash' : "E'lon qilish"}
        </Button>
      </div>
    </form>
  );
}
