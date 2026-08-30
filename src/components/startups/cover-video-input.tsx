'use client';

import { useRef, useState } from 'react';
import { Film, Link2, Spinner, UploadCloud, X, Youtube } from '@/components/icons';
import { uploadsApi, getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { FIELD_SIZE, FIELD_SURFACE } from '@/components/ui/field-styles';
import { CoverMedia, youtubeId, isPlayableVideo } from './cover-media';
import toast from 'react-hot-toast';

type Mode = 'upload' | 'link';

/**
 * Muqova videosi — ikki yo'l: fayl yuklash (mp4/webm) yoki YouTube havolasi.
 * Tanlangach shu yerning o'zida oldindan ko'rish (bosilganda ijro) beriladi —
 * foydalanuvchi saytdagi yakuniy ko'rinishni darhol ko'radi.
 */
export function CoverVideoInput({
  value,
  onChange,
  posterUrl,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  /** Rasm muqova — video posteri sifatida ishlatiladi (bo'lsa) */
  posterUrl?: string | null;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>(value && youtubeId(value) ? 'link' : 'upload');
  const [link, setLink] = useState(value && youtubeId(value) ? value : '');

  async function handleFile(file: File) {
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video hajmi 50MB dan oshmasin');
      return;
    }
    setLoading(true);
    try {
      const res = await uploadsApi.video(file);
      onChange(res.url);
      toast.success('Video yuklandi');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Yuklashda xatolik'));
    } finally {
      setLoading(false);
    }
  }

  function applyLink() {
    const url = link.trim();
    if (!url) {
      onChange(null);
      return;
    }
    if (!youtubeId(url) && !isPlayableVideo(url)) {
      toast.error('YouTube havolasi yoki to‘g‘ridan-to‘g‘ri video (.mp4/.webm) havolasi kiriting');
      return;
    }
    onChange(url);
  }

  function clear() {
    onChange(null);
    setLink('');
  }

  /* ── Tanlangan holat: oldindan ko'rish ─────────────────────── */
  if (value) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-subhead font-medium text-slate-500">
          Muqova videosi
        </label>
        <div className="group relative aspect-video w-full overflow-hidden rounded-ios-md border border-slate-200">
          <CoverMedia coverUrl={posterUrl} videoUrl={value} title="Muqova" size="lg" />
          <button
            type="button"
            onClick={clear}
            aria-label="Videoni olib tashlash"
            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-ios bg-white/90 text-slate-600 shadow-card transition-colors hover:text-rose-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-footnote text-slate-500">
          {youtubeId(value)
            ? 'YouTube videosi sayt ichida ko‘rsatiladi. Ijro faqat bosilganda boshlanadi.'
            : 'Video muqova o‘rnida turadi. Ijro faqat bosilganda boshlanadi.'}
        </p>
      </div>
    );
  }

  /* ── Bo'sh holat: yuklash yoki havola ──────────────────────── */
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-subhead font-medium text-slate-500">
        Muqova videosi <span className="font-medium normal-case tracking-normal text-slate-500">(ixtiyoriy)</span>
      </label>

      {/* Rejim tanlash */}
      <div className="inline-flex w-fit items-center gap-1 rounded-ios border border-slate-200 bg-white p-1">
        {([
          { m: 'upload' as const, icon: Film, label: 'Video yuklash' },
          { m: 'link' as const, icon: Youtube, label: 'YouTube havolasi' },
        ]).map(({ m, icon: Icon, label }) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-footnote font-semibold transition-all',
              mode === m
                ? 'bg-white text-brand-900 shadow-segment hover:shadow-card-hover'
                : 'text-slate-500 hover:bg-accent-50 hover:text-accent-700 active:bg-accent-100',
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {mode === 'upload' ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-ios-md border-2 border-dashed border-slate-300 bg-surface-soft transition-all enabled:hover:border-accent-300 enabled:hover:bg-accent-50 active:bg-accent-100 disabled:opacity-60"
        >
          {loading ? (
            <Spinner className="h-6 w-6 animate-spin text-accent-500" />
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-ios-lg bg-white">
                <UploadCloud className="h-5 w-5 text-slate-400" />
              </div>
              <span className="text-footnote font-medium text-slate-600">
                Video tanlang — mp4 yoki webm, maks 50MB
              </span>
            </>
          )}
        </button>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLink(); } }}
              placeholder="https://youtube.com/watch?v=..."
              aria-label="YouTube havolasi"
              className={cn(FIELD_SURFACE, FIELD_SIZE.md, 'pl-10 pr-3')}
            />
          </div>
          <button
            type="button"
            onClick={applyLink}
            className="h-11 shrink-0 rounded-ios-lg bg-white px-4 text-footnote font-semibold text-slate-600 transition-all hover:bg-accent-50 hover:text-accent-700"
          >
            Qo&apos;shish
          </button>
        </div>
      )}

      <p className="text-footnote text-slate-500">
        Video qo&apos;shsangiz u muqova o&apos;rnida turadi — birinchi kadr ko&apos;rinadi,
        ijro esa foydalanuvchi bosganda boshlanadi.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
