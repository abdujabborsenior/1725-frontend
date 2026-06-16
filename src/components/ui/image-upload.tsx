'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Loader2, UploadCloud, X, ImagePlus, Film } from 'lucide-react';
import { uploadsApi, chatApi, getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

/** Promo video yuklash — /chat/upload video qabul qiladi (50MB). */
export function VideoUpload({
  value, onChange, label = 'Promo video',
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Maks. 50MB');
      return;
    }
    setLoading(true);
    try {
      const res = await chatApi.upload(file);
      onChange(res.url);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Yuklashda xatolik'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">{label}</label>
      {value ? (
        <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-black">
          <video src={value} controls className="max-h-48 w-full" />
          <button type="button" onClick={() => onChange(null)}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-600 opacity-0 shadow-card transition-opacity hover:text-rose-600 group-hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-surface-soft transition-all hover:border-accent-300 hover:bg-slate-50">
          {loading ? <Loader2 className="h-6 w-6 animate-spin text-accent-500" /> : (
            <>
              <Film className="h-6 w-6 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">Video yuklash (max 50MB)</span>
            </>
          )}
        </button>
      )}
      <input ref={ref} type="file" accept="video/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ''; }} />
    </div>
  );
}

type Aspect = 'square' | 'video' | 'wide' | 'logo';

const ASPECT: Record<Aspect, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  wide: 'aspect-[3/1]',
  logo: 'aspect-square max-w-[140px]',
};

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  hint?: string;
  aspect?: Aspect;
  className?: string;
  /** Yuklash funksiyasi (default: admin uploadsApi.image). Oddiy userlar uchun chatApi.upload bering. */
  uploader?: (file: File) => Promise<{ url: string }>;
  /** Avatar/dumaloq oldindan ko'rish */
  rounded?: boolean;
}

/** Bitta rasm yuklash — kover yoki logo uchun. */
export function ImageUpload({
  value,
  onChange,
  label,
  hint,
  aspect = 'video',
  className,
  uploader,
  rounded,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    setLoading(true);
    try {
      const res = await (uploader ? uploader(file) : uploadsApi.image(file));
      onChange(res.url);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Yuklashda xatolik'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}

      {value ? (
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-xl border border-slate-200 bg-surface-soft group',
            ASPECT[aspect],
            rounded && 'rounded-full',
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur text-slate-600 hover:text-rose-600 shadow-card opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="O'chirish"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          className={cn(
            'w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all',
            ASPECT[aspect],
            rounded && 'rounded-full',
            dragOver
              ? 'border-accent-400 bg-accent-50'
              : 'border-slate-200 bg-surface-soft hover:border-slate-300 hover:bg-slate-50',
          )}
        >
          {loading ? (
            <Loader2 className="h-6 w-6 text-accent-500 animate-spin" />
          ) : (
            <>
              <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                <UploadCloud className="h-5 w-5 text-slate-400" />
              </div>
              <span className="text-xs font-medium text-slate-500">
                Rasm tanlang yoki sudrab tashlang
              </span>
            </>
          )}
        </button>
      )}

      {hint && <p className="text-xs text-slate-500">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

interface GalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
}

/** Bir nechta rasm — skrinshotlar galereyasi (Play Store / App Store uslubi). */
export function GalleryUpload({
  value,
  onChange,
  label,
  max = 8,
}: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFiles(files: FileList) {
    const room = max - value.length;
    if (room <= 0) {
      toast.error(`Maksimal ${max} ta rasm`);
      return;
    }
    setLoading(true);
    try {
      const picked = Array.from(files).slice(0, room);
      const res = await uploadsApi.images(picked);
      onChange([...value, ...res.files.map((f) => f.url)]);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Yuklashda xatolik'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
          <span className="text-[11px] text-slate-400">
            {value.length} / {max}
          </span>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div
            key={url}
            className="relative h-28 w-20 overflow-hidden rounded-lg border border-slate-200 bg-surface-soft group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`screenshot ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center rounded-md bg-white/90 text-slate-600 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="O'chirish"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="h-28 w-20 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-200 bg-surface-soft hover:border-accent-300 hover:bg-accent-50/40 transition-all"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 text-accent-500 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-5 w-5 text-slate-400" />
                <span className="text-[10px] text-slate-400">Qo&apos;shish</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
