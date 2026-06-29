'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2, X, Hash } from 'lucide-react';
import { chatApi, getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

/**
 * Guruh avatarini yuklash — dumaloq, markazlashgan tanlagich.
 * Rasm bo'lsa ko'rsatadi, bo'lmasa guruh nomining bosh harfini gradient ustida.
 */
export function GroupAvatarPicker({
  value,
  name,
  onChange,
  size = 88,
}: {
  value: string | null;
  name?: string | null;
  onChange: (url: string | null) => void;
  size?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const letter = name?.trim()?.[0]?.toUpperCase();

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return toast.error('Faqat rasm');
    if (file.size > 8 * 1024 * 1024) return toast.error('Maks. 8MB');
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
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ height: size, width: size }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'group relative flex h-full w-full items-center justify-center overflow-hidden rounded-full ring-2 ring-white transition-shadow',
            value ? 'shadow-card' : 'bg-gradient-iris',
          )}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={name ?? 'Guruh'} className="h-full w-full object-cover" />
          ) : letter ? (
            <span className="text-3xl font-black text-white">{letter}</span>
          ) : (
            <Hash className="h-7 w-7 text-white" />
          )}

          {/* hover overlay */}
          <span className="absolute inset-0 flex items-center justify-center bg-brand-900/0 transition-colors group-hover:bg-brand-900/40">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            ) : (
              <Camera className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </span>
        </button>

        {value && !loading && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Rasmni olib tashlash"
            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-card transition-colors hover:text-rose-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-xs font-semibold text-accent-700 transition-colors hover:text-accent-800"
      >
        {value ? 'Rasmni almashtirish' : 'Avatar yuklash'}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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
