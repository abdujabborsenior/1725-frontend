'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown, Link2, Plus, Rocket, Send, Tag, Trash2, X,
} from 'lucide-react';
import { startupsApi, getErrorMessage, type StartupPayload } from '@/lib/api';
import type { PlatformType, Startup } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { CoverVideoInput } from './cover-video-input';
import {
  PLATFORM_META, PLATFORM_ORDER, STARTUP_CATEGORIES, UZ_REGIONS,
} from '@/lib/constants';
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

function isValidUrl(s: string) {
  try { new URL(s); return true; } catch { return false; }
}

const REGION_OPTIONS = [
  { value: '', label: 'Hudud (ixtiyoriy)' },
  ...UZ_REGIONS.map((r) => ({ value: r, label: r })),
];

const PLATFORM_OPTIONS = PLATFORM_ORDER.map((t) => ({
  value: t,
  label: PLATFORM_META[t].label,
}));

/** Startap joylash/tahrirlash formasi — minimal majburiy maydon, qolgani ixtiyoriy. */
export function StartupForm({ initial }: { initial?: Startup }) {
  const router = useRouter();
  const qc = useQueryClient();
  const editing = !!initial;

  const [logoUrl, setLogoUrl] = useState<string | null>(initial?.logoUrl ?? null);
  const [coverUrl, setCoverUrl] = useState<string | null>(initial?.coverUrl ?? null);
  const [videoUrl, setVideoUrl] = useState<string | null>(initial?.videoUrl ?? null);
  const [platforms, setPlatforms] = useState<{ type: PlatformType; url: string }[]>(
    initial?.platforms.map((p) => ({ type: p.type, url: p.url })) ?? [],
  );
  const [platformType, setPlatformType] = useState<PlatformType>('website');
  const [platformUrl, setPlatformUrl] = useState('');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [moreOpen, setMoreOpen] = useState(
    !!(initial?.region || initial?.teamName || initial?.foundedYear || initial?.tags.length),
  );

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<FormData>({
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
        foundedYear: d.foundedYear === '' || d.foundedYear === undefined
          ? undefined
          : Number(d.foundedYear),
        logoUrl: logoUrl ?? undefined,
        coverUrl: coverUrl ?? undefined,
        videoUrl: videoUrl ?? undefined,
        platforms,
        tags,
      } as StartupPayload;
      return editing
        ? startupsApi.update(initial.id, payload)
        : startupsApi.create(payload);
    },
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['startups'] });
      void qc.invalidateQueries({ queryKey: ['startup'] });
      toast.success(editing ? 'Startap yangilandi!' : "Startap e'lon qilindi!");
      router.push(`/startups/${res.data.id}`);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  function addPlatform() {
    const url = platformUrl.trim();
    if (!url || !isValidUrl(url)) { toast.error("To'g'ri havola kiriting"); return; }
    if (platforms.some((p) => p.url === url)) return;
    if (platforms.length >= 8) { toast.error("Ko'pi bilan 8 ta havola"); return; }
    setPlatforms((l) => [...l, { type: platformType, url }]);
    setPlatformUrl('');
  }

  function addTag() {
    const t = tagInput.trim().replace(/^#/, '');
    if (!t) return;
    if (t.length > 40) { toast.error("Teg ko'pi bilan 40 ta belgi"); return; }
    if (tags.includes(t) || tags.length >= 15) return;
    setTags((l) => [...l, t]);
    setTagInput('');
  }

  const descLength = watch('description')?.length ?? 0;
  const selectedCategory = watch('category');

  return (
    <form onSubmit={handleSubmit((d) => submit(d))} className="space-y-8">
      {/* ── 1. Asosiy ma'lumot ─────────────────────────────── */}
      <section className="space-y-5">
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

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Kategoriya (ixtiyoriy)
          </label>
          <div className="flex flex-wrap gap-2">
            {STARTUP_CATEGORIES.map((cat) => {
              const selected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setValue('category', selected ? '' : cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150',
                    selected
                      ? 'bg-brand-900 border-brand-900 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-brand-900',
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 2. Media (ixtiyoriy) ───────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-brand-900">Media</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Ixtiyoriy — logo, muqova rasmi yoki video startapingizga ishonch qo&apos;shadi
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">
          <ImageUpload label="Logo" aspect="logo" value={logoUrl} onChange={setLogoUrl} />
          <ImageUpload label="Muqova rasmi" aspect="video" value={coverUrl} onChange={setCoverUrl} />
        </div>
        {/* Muqova videosi — rasm o'rniga video turishi mumkin (YouTube yoki yuklangan) */}
        <CoverVideoInput value={videoUrl} onChange={setVideoUrl} posterUrl={coverUrl} />
      </section>

      {/* ── 3. Havolalar (ixtiyoriy) ───────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-brand-900">Havolalar</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Sayt, ilova yoki Telegram — foydalanuvchilar startapingizni qayerdan topadi?
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="sm:w-44 shrink-0">
            <Select
              options={PLATFORM_OPTIONS}
              value={platformType}
              onChange={(e) => setPlatformType(e.target.value as PlatformType)}
              aria-label="Platforma turi"
            />
          </div>
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              value={platformUrl}
              onChange={(e) => setPlatformUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPlatform(); } }}
              placeholder="https://..."
              className="w-full h-12 pl-9 pr-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus transition-all"
            />
          </div>
          <button
            type="button"
            onClick={addPlatform}
            className="h-12 px-4 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:text-brand-900 hover:border-slate-300 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" /> Qo&apos;shish
          </button>
        </div>
        {platforms.length > 0 && (
          <div className="space-y-2">
            {platforms.map((p) => (
              <div key={p.url} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                <span className={cn('px-2 py-0.5 rounded-md text-[11px] font-semibold border', PLATFORM_META[p.type].chipClass)}>
                  {PLATFORM_META[p.type].label}
                </span>
                <span className="truncate flex-1 text-slate-600 text-xs">{p.url}</span>
                <button
                  type="button"
                  onClick={() => setPlatforms((l) => l.filter((x) => x.url !== p.url))}
                  aria-label="Havolani o'chirish"
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 4. Qo'shimcha (yig'ma) ─────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <span>
            <span className="block text-sm font-semibold text-brand-900">
              Qo&apos;shimcha ma&apos;lumotlar
            </span>
            <span className="block text-xs text-slate-600 mt-0.5">
              Hudud, jamoa, teglar — ixtiyoriy
            </span>
          </span>
          <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', moreOpen && 'rotate-180')} />
        </button>
        {moreOpen && (
          <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select label="Hudud" options={REGION_OPTIONS} error={errors.region?.message} {...register('region')} />
              <Input label="Tuman / shahar" placeholder="Masalan: Chilonzor" error={errors.district?.message} {...register('district')} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Jamoa nomi" placeholder="Masalan: EcoTeam" error={errors.teamName?.message} {...register('teamName')} />
              <Input label="Tashkil etilgan yil" type="number" placeholder="2024" error={errors.foundedYear?.message} {...register('foundedYear')} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Teglar (maks. 15)
              </label>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Masalan: AI, SaaS, logistika"
                  className="flex-1 h-11 px-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus transition-all"
                />
                <button
                  type="button"
                  onClick={addTag}
                  aria-label="Teg qo'shish"
                  className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-brand-900 hover:border-slate-300 transition-all shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                      #{t}
                      <button
                        type="button"
                        onClick={() => setTags((l) => l.filter((x) => x !== t))}
                        aria-label={`${t} tegini o'chirish`}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Submit ─────────────────────────────────────────── */}
      {!editing && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-50 border border-accent-200">
          <Rocket className="h-4 w-4 text-accent-600 mt-0.5 shrink-0" />
          <p className="text-sm text-slate-700 leading-relaxed">
            Startapingiz yuborilgan zahoti <span className="font-semibold text-accent-700">e&apos;lon qilinadi</span> —
            tasdiqlash kutish shart emas. Keyin xohlagan payt tahrirlashingiz mumkin.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Bekor qilish
        </Button>
        <Button type="submit" variant="accent" size="lg" loading={isPending} className="flex-1">
          <Send className="h-4 w-4" />
          {editing ? 'Saqlash' : "E'lon qilish"}
        </Button>
      </div>
    </form>
  );
}
