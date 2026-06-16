'use client';

import { useState } from 'react';
import {
  Plus, X, Link2, Loader2, Wand2, Trash2, Tag as TagIcon, Sparkles,
} from 'lucide-react';
import { startupsApi, getErrorMessage, type StartupPayload } from '@/lib/api';
import {
  PLATFORM_META, PLATFORM_ORDER, STARTUP_CATEGORIES,
} from '@/lib/constants';
import type { PlatformType, Startup, StartupStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageUpload, GalleryUpload, VideoUpload } from '@/components/ui/image-upload';
import { PlatformIcon } from '@/components/startups/platform';
import toast from 'react-hot-toast';

interface PlatformRow {
  type: PlatformType;
  url: string;
  label: string;
  iconUrl: string | null;
  loading?: boolean;
}

interface FormState {
  title: string;
  tagline: string;
  description: string;
  category: string;
  teamName: string;
  foundedYear: string;
  coverUrl: string | null;
  logoUrl: string | null;
  videoUrl: string | null;
  screenshots: string[];
  tags: string[];
  platforms: PlatformRow[];
  status: StartupStatus;
  isFeatured: boolean;
}

function initState(initial?: Startup): FormState {
  return {
    title: initial?.title ?? '',
    tagline: initial?.tagline ?? '',
    description: initial?.description ?? '',
    category: initial?.category ?? '',
    teamName: initial?.teamName ?? '',
    foundedYear: initial?.foundedYear ? String(initial.foundedYear) : '',
    coverUrl: initial?.coverUrl ?? null,
    logoUrl: initial?.logoUrl ?? null,
    videoUrl: initial?.videoUrl ?? null,
    screenshots: initial?.screenshots ?? [],
    tags: initial?.tags ?? [],
    platforms:
      initial?.platforms.map((p) => ({
        type: p.type,
        url: p.url,
        label: p.label ?? '',
        iconUrl: p.iconUrl ?? null,
      })) ?? [],
    status: initial?.status ?? 'draft',
    isFeatured: initial?.isFeatured ?? false,
  };
}

function isValidUrl(s: string) {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

const STATUS_OPTIONS: { value: StartupStatus; label: string; desc: string }[] = [
  { value: 'draft', label: 'Qoralama', desc: 'Faqat admin ko\'radi' },
  { value: 'published', label: 'E\'lon qilingan', desc: 'Saytda ko\'rinadi' },
  { value: 'archived', label: 'Arxivlangan', desc: 'Ro\'yxatdan yashirilgan' },
];

export function StartupForm({
  initial,
  onCancel,
}: {
  initial?: Startup;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => initState(initial));
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!initial;
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  /* ── Tags ─────────────────────────────────────────────────── */
  function addTag() {
    const t = tagInput.trim();
    if (!t || form.tags.includes(t) || form.tags.length >= 15) return;
    set('tags', [...form.tags, t]);
    setTagInput('');
  }

  /* ── Platforms ────────────────────────────────────────────── */
  function addPlatform() {
    if (form.platforms.length >= 8) return;
    set('platforms', [
      ...form.platforms,
      { type: 'website', url: '', label: '', iconUrl: null },
    ]);
  }

  function updatePlatform(idx: number, patch: Partial<PlatformRow>) {
    set(
      'platforms',
      form.platforms.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    );
  }

  function removePlatform(idx: number) {
    set('platforms', form.platforms.filter((_, i) => i !== idx));
  }

  // URL'dan avtomatik logo/turni aniqlash
  async function detectPlatform(idx: number) {
    const row = form.platforms[idx];
    if (!isValidUrl(row.url)) {
      toast.error('Avval to\'g\'ri URL kiriting');
      return;
    }
    updatePlatform(idx, { loading: true });
    try {
      const preview = await startupsApi.linkPreview(row.url);
      updatePlatform(idx, {
        type: preview.detectedType,
        iconUrl: preview.image ?? preview.favicon ?? row.iconUrl,
        label: row.label || preview.siteName || preview.title || '',
        loading: false,
      });
      toast.success('Logo va platforma aniqlandi');
    } catch (err) {
      updatePlatform(idx, { loading: false });
      toast.error(getErrorMessage(err, 'Aniqlab bo\'lmadi'));
    }
  }

  /* ── Submit ───────────────────────────────────────────────── */
  function validate(): string | null {
    if (form.title.trim().length < 2) return 'Sarlavha kamida 2 ta belgi';
    if (form.description.trim().length < 20) return 'Tavsif kamida 20 ta belgi';
    for (const p of form.platforms) {
      if (!p.url.trim()) return 'Platforma URL\'i bo\'sh bo\'lishi mumkin emas';
      if (!isValidUrl(p.url)) return `Noto'g'ri URL: ${p.url}`;
    }
    return null;
  }

  async function handleSubmit() {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    const payload: StartupPayload = {
      title: form.title.trim(),
      tagline: form.tagline.trim() || undefined,
      description: form.description.trim(),
      category: form.category || null,
      teamName: form.teamName.trim() || null,
      foundedYear: form.foundedYear ? Number(form.foundedYear) : null,
      coverUrl: form.coverUrl,
      logoUrl: form.logoUrl,
      videoUrl: form.videoUrl,
      screenshots: form.screenshots,
      tags: form.tags,
      platforms: form.platforms.map((p) => ({
        type: p.type,
        url: p.url.trim(),
        label: p.label.trim() || undefined,
        iconUrl: p.iconUrl ?? undefined,
      })),
      status: form.status,
      isFeatured: form.isFeatured,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        const res = await startupsApi.update(initial.id, payload);
        toast.success(res.message ?? 'Yangilandi');
      } else {
        const res = await startupsApi.create(payload);
        toast.success(res.message ?? 'Qo\'shildi');
      }
      onCancel(); // navigates back / redirect handled by parent
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: main info ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Asosiy ma&apos;lumotlar
            </h2>

            <Input
              label="Startap nomi"
              placeholder="Masalan: EcoDelivery"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />

            <Input
              label="Qisqa shior"
              placeholder="Bir jumlada startap mohiyati"
              hint="Kartochkalarda ko'rinadi (ixtiyoriy)"
              value={form.tagline}
              onChange={(e) => set('tagline', e.target.value)}
            />

            <Textarea
              label="To'liq tavsif"
              rows={6}
              placeholder="Startap nima qiladi, qanday muammoni hal qiladi..."
              count={{ current: form.description.length, max: 5000 }}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Kategoriya
              </label>
              <div className="flex flex-wrap gap-2">
                {STARTUP_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => set('category', form.category === cat ? '' : cat)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      form.category === cat
                        ? 'bg-brand-900 border-brand-900 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300',
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <TagIcon className="h-3.5 w-3.5" /> Teglar
              </label>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="AI, SaaS, Fintex..."
                  className="flex-1 h-11 px-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus transition-all"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="h-11 w-11 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-brand-900 hover:border-slate-300 transition-all"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      #{t}
                      <button type="button" onClick={() => set('tags', form.tags.filter((x) => x !== t))} className="text-slate-400 hover:text-rose-600">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Platforms ─────────────────────────────────── */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Platformalar
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  iOS, Android, sayt, Telegram bot — ixtiyoriy. URL kiritib{' '}
                  <Wand2 className="h-3 w-3 inline -mt-0.5" /> bossangiz logo avtomatik aniqlanadi.
                </p>
              </div>
            </div>

            {form.platforms.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-surface-soft py-8 text-center">
                <p className="text-sm text-slate-500">Hali platforma qo&apos;shilmagan</p>
                <p className="text-xs text-slate-400 mt-0.5">Startap g&apos;oya bosqichida bo&apos;lsa, bo&apos;sh qoldiring</p>
              </div>
            )}

            <div className="space-y-3">
              {form.platforms.map((p, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 p-3 bg-surface-soft/50">
                  <div className="flex items-center gap-3">
                    {/* Icon preview */}
                    <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {p.iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.iconUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <PlatformIcon type={p.type} className="h-5 w-5 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex gap-2">
                        <select
                          value={p.type}
                          onChange={(e) => updatePlatform(idx, { type: e.target.value as PlatformType })}
                          className="h-10 px-3 pr-8 rounded-lg bg-white border border-slate-200 text-sm font-medium text-brand-900 appearance-none cursor-pointer focus:outline-none input-focus"
                        >
                          {PLATFORM_ORDER.map((t) => (
                            <option key={t} value={t}>{PLATFORM_META[t].label}</option>
                          ))}
                        </select>
                        <input
                          value={p.label}
                          onChange={(e) => updatePlatform(idx, { label: e.target.value })}
                          placeholder="Nom (ixtiyoriy)"
                          className="flex-1 min-w-0 h-10 px-3 rounded-lg bg-white border border-slate-200 text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus"
                        />
                      </div>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input
                          value={p.url}
                          onChange={(e) => updatePlatform(idx, { url: e.target.value })}
                          onBlur={() => { if (isValidUrl(p.url) && !p.iconUrl) void detectPlatform(idx); }}
                          placeholder="https://play.google.com/..."
                          className="w-full h-10 pl-9 pr-3 rounded-lg bg-white border border-slate-200 text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        type="button"
                        title="Logoni avtomatik aniqlash"
                        onClick={() => void detectPlatform(idx)}
                        disabled={p.loading}
                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-accent-50 text-accent-700 hover:bg-accent-100 transition-all disabled:opacity-50"
                      >
                        {p.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        title="O'chirish"
                        onClick={() => removePlatform(idx)}
                        className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {form.platforms.length < 8 && (
              <button
                type="button"
                onClick={addPlatform}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-slate-200 text-sm font-semibold text-slate-500 hover:border-accent-300 hover:text-accent-700 hover:bg-accent-50/40 transition-all"
              >
                <Plus className="h-4 w-4" /> Platforma qo&apos;shish
              </button>
            )}
          </div>

          {/* Screenshots */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
            <GalleryUpload
              label="Skrinshotlar"
              value={form.screenshots}
              onChange={(urls) => set('screenshots', urls)}
              max={8}
            />
          </div>
        </div>

        {/* ── Right: media + meta ─────────────────────────── */}
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Vizual</h2>
            <ImageUpload
              label="Logo"
              aspect="logo"
              value={form.logoUrl}
              onChange={(url) => set('logoUrl', url)}
            />
            <ImageUpload
              label="Kover rasm"
              aspect="video"
              hint="Kartochka va detal sahifa banneri"
              value={form.coverUrl}
              onChange={(url) => set('coverUrl', url)}
            />
            <VideoUpload
              value={form.videoUrl}
              onChange={(url) => set('videoUrl', url)}
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Holat</h2>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => set('status', o.value)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all',
                    form.status === o.value
                      ? 'border-accent-300 bg-accent-50'
                      : 'border-slate-200 hover:border-slate-300',
                  )}
                >
                  <span className={cn(
                    'h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0',
                    form.status === o.value ? 'border-accent-500' : 'border-slate-300',
                  )}>
                    {form.status === o.value && <span className="h-2 w-2 rounded-full bg-accent-500" />}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-brand-900">{o.label}</span>
                    <span className="block text-xs text-slate-400">{o.desc}</span>
                  </span>
                </button>
              ))}
            </div>

            {/* Featured toggle */}
            <button
              type="button"
              onClick={() => set('isFeatured', !form.isFeatured)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all',
                form.isFeatured ? 'border-accent-300 bg-accent-50' : 'border-slate-200 hover:border-slate-300',
              )}
            >
              <span className={cn(
                'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
                form.isFeatured ? 'bg-accent-500 text-white' : 'bg-slate-100 text-slate-400',
              )}>
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="flex-1 text-left">
                <span className="block text-sm font-semibold text-brand-900">Tavsiya etilgan</span>
                <span className="block text-xs text-slate-400">Bosh sahifada ajratib ko&apos;rsatiladi</span>
              </span>
              <span className={cn(
                'h-6 w-11 rounded-full p-0.5 transition-all',
                form.isFeatured ? 'bg-accent-500' : 'bg-slate-200',
              )}>
                <span className={cn(
                  'block h-5 w-5 rounded-full bg-white shadow transition-transform',
                  form.isFeatured && 'translate-x-5',
                )} />
              </span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Qo&apos;shimcha</h2>
            <Input
              label="Jamoa nomi"
              placeholder="EcoTeam"
              value={form.teamName}
              onChange={(e) => set('teamName', e.target.value)}
            />
            <Input
              label="Tashkil topgan yili"
              type="number"
              placeholder="2024"
              value={form.foundedYear}
              onChange={(e) => set('foundedYear', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sticky bottom-4">
        <div className="flex-1 flex gap-3 bg-white/80 backdrop-blur border border-slate-200 rounded-2xl p-3 shadow-card">
          <Button variant="outline" size="lg" onClick={onCancel} className="flex-1 sm:flex-none">
            Bekor qilish
          </Button>
          <Button variant="accent" size="lg" loading={submitting} onClick={handleSubmit} className="flex-1">
            {isEdit ? 'Saqlash' : 'Startap qo\'shish'}
          </Button>
        </div>
      </div>
    </div>
  );
}
