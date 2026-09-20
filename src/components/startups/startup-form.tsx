'use client';

import { useRouter } from '@/i18n/navigation';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
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
import { useLinkAutofill } from './use-link-autofill';
import {
  InvestorFields,
  investorFieldsFromStartup,
  investorFieldsToPayload,
  type InvestorFieldsValue,
} from './investor-fields';
import { UZ_REGIONS } from '@/lib/constants';
import { useCategoryOptions } from '@/lib/use-categories';
import { cn } from '@/lib/utils';
import { FIELD_SIZE, FIELD_SURFACE } from '@/components/ui/field-styles';
import toast from 'react-hot-toast';

type Translator = ReturnType<typeof useTranslations<'startupForm'>>;
type ValidationTranslator = ReturnType<typeof useTranslations<'validation'>>;

/** Sxema xabarlari joriy tilda — shuning uchun sxema komponent ichida quriladi. */
function buildSchema(t: Translator, tv: ValidationTranslator) {
  return z.object({
    title: z.string().min(2, tv('minChars', { min: '2' })).max(200, tv('maxChars', { max: '200' })),
    tagline: z.string().max(300, tv('maxChars', { max: '300' })).optional(),
    description: z
      .string()
      .min(20, tv('minChars', { min: '20' }))
      .max(10000, tv('maxChars', { max: '10000' })),
    category: z.string().optional(),
    region: z.string().optional(),
    district: z.string().max(100, tv('maxChars', { max: '100' })).optional(),
    teamName: z.string().max(150, tv('maxChars', { max: '150' })).optional(),
    foundedYear: z
      .union([
        z.coerce
          .number({ invalid_type_error: tv('number') })
          .int(tv('number'))
          .min(1990, t('errors.yearMin', { min: '1990' }))
          .max(2100, t('errors.yearMax', { max: '2100' })),
        z.literal(''),
      ])
      .optional(),
  });
}

type FormData = z.infer<ReturnType<typeof buildSchema>>;

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
  const t = useTranslations('startupForm');
  const tv = useTranslations('validation');
  const tc = useTranslations('common');
  const tr = useTranslations('regions');
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

  const schema = useMemo(() => buildSchema(t, tv), [t, tv]);
  const regionOptions = useMemo(
    () => [
      { value: '', label: t('more.regionPlaceholder') },
      ...UZ_REGIONS.map((r) => ({ value: r.value, label: tr(r.key) })),
    ],
    [t, tr],
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
      toast.success(editing ? t('toast.updated') : t('toast.published'));
      router.push(`/startups/${res.data.id}`);
    },
    onError: (e) => {
      // Tarif limiti tugagan — bu "xato" emas, tarif tanlash taklifi.
      // (Bo'lim o'chiq bo'lsa bunday javob umuman kelmaydi.)
      if (BILLING_ENABLED && isStartupLimitError(e)) {
        toast.error(getErrorMessage(e, t('errors.limitReached')));
        router.push('/pricing');
        return;
      }
      toast.error(getErrorMessage(e));
    },
  });

  function onSubmit(d: FormData) {
    // Havola maydonlari — noto'g'ri to'ldirilgani bo'lsa yuborilmaydi
    if (invalidLinks(links).length > 0) {
      toast.error(t('errors.invalidLinks'));
      return;
    }
    submit(d);
  }

  function addTag() {
    const tag = tagInput.trim().replace(/^#/, '');
    if (!tag) return;
    if (tag.length > 40) {
      toast.error(t('errors.tagTooLong'));
      return;
    }
    if (tags.includes(tag) || tags.length >= 15) return;
    setTags((l) => [...l, tag]);
    setTagInput('');
  }

  const descLength = watch('description')?.length ?? 0;
  const selectedCategory = watch('category');
  // Kategoriyalar bazadan (admin paneldan boshqariladi); tahrirda joriy
  // qiymat ro'yxatда bo'lmasa ham ko'rinadi.
  const categoryOptions = useCategoryOptions('startup', selectedCategory);

  /**
   * Havoladan avtomatik logo/muqova/nom/tavsif. Faqat BO'SH maydonlarni
   * to'ldiradi — foydalanuvchi kiritganiga tegmaydi.
   */
  const autofill = useLinkAutofill(
    links,
    {
      logo: logoUrl,
      cover: coverUrl,
      title: watch('title') ?? '',
      tagline: watch('tagline') ?? '',
      description: watch('description') ?? '',
    },
    {
      setLogo: setLogoUrl,
      setCover: setCoverUrl,
      setTitle: (v) => setValue('title', v, { shouldValidate: true }),
      setTagline: (v) => setValue('tagline', v, { shouldValidate: true }),
      setDescription: (v) => setValue('description', v, { shouldValidate: true }),
    },
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-9">
      {/* ── 1. Asosiy ma'lumot ──────────────────────────────── */}
      <Section title={t('basic.title')}>
        <div className="space-y-4">
          <Input
            label={t('basic.name')}
            placeholder={t('basic.namePlaceholder')}
            error={errors.title?.message}
            {...register('title')}
          />
          <Input
            label={t('basic.tagline')}
            placeholder={t('basic.taglinePlaceholder')}
            error={errors.tagline?.message}
            {...register('tagline')}
          />
          <Textarea
            label={t('basic.description')}
            rows={7}
            placeholder={t('basic.descriptionPlaceholder')}
            count={{ current: descLength, max: 10000 }}
            hint={descLength > 0 && descLength < 20 ? tv('minChars', { min: '20' }) : undefined}
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="flex flex-col gap-2">
            <span className="text-subhead font-medium text-slate-500">{t('basic.category')}</span>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => {
                const selected = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setValue('category', selected ? '' : cat.value)}
                    className={cn(
                      'tappable rounded-full px-3.5 py-1.5 text-subhead font-medium transition-colors duration-150 ease-ios',
                      selected ? 'bg-accent-600 text-white' : 'bg-fill-tertiary text-slate-600',
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 2. Media (ixtiyoriy) ────────────────────────────── */}
      <Section title={t('media.title')} hint={t('media.hint')}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[140px_1fr]">
            <ImageUpload label={t('media.logo')} aspect="logo" value={logoUrl} onChange={setLogoUrl} />
            <ImageUpload
              label={t('media.cover')}
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
      <Section title={t('links.title')} hint={t('links.hint')}>
        <LinkFields
          values={links}
          onChange={setLinks}
          autofill={autofill.state}
          onFieldBlur={autofill.flush}
        />
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
          className="ios-row w-full text-start"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-body text-brand-900">{t('more.title')}</span>
            <span className="mt-0.5 block text-footnote text-slate-500">
              {t('more.subtitle')}
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
                label={t('more.region')}
                options={regionOptions}
                error={errors.region?.message}
                {...register('region')}
              />
              <Input
                label={t('more.district')}
                placeholder={t('more.districtPlaceholder')}
                error={errors.district?.message}
                {...register('district')}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label={t('more.teamName')}
                placeholder={t('more.teamPlaceholder')}
                error={errors.teamName?.message}
                {...register('teamName')}
              />
              <Input
                label={t('more.foundedYear')}
                type="number"
                placeholder="2024"
                error={errors.foundedYear?.message}
                {...register('foundedYear')}
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-subhead font-medium text-slate-500">{t('more.tags')}</span>
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
                  placeholder={t('more.tagPlaceholder')}
                  className={cn(FIELD_SURFACE, FIELD_SIZE.md, 'flex-1')}
                />
                <button
                  type="button"
                  onClick={addTag}
                  aria-label={t('more.addTag')}
                  className="tappable flex h-12 w-12 shrink-0 items-center justify-center rounded-ios-md bg-fill-tertiary text-slate-600"
                >
                  <Plus className="h-[18px] w-[18px]" strokeWidth={2.5} />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full bg-fill-tertiary px-3 py-1 text-footnote font-medium text-slate-600"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setTags((l) => l.filter((x) => x !== tag))}
                        aria-label={t('more.removeTag', { tag })}
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
          {t.rich('publishNote', {
            b: (chunks) => <span className="font-medium text-accent-700">{chunks}</span>,
          })}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={() => router.back()}>
          {tc('cancel')}
        </Button>
        <Button type="submit" variant="accent" size="lg" loading={isPending} className="flex-1">
          {editing ? tc('save') : t('publish')}
        </Button>
      </div>
    </form>
  );
}
