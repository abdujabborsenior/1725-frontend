'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, X, Link2, Image, Video, Send } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { problemsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

const schema = z.object({
  title:       z.string().min(10, 'Kamida 10 ta belgi').max(200),
  description: z.string().min(30, 'Kamida 30 ta belgi').max(5000),
  category:    z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = [
  'Texnologiya', 'Biznes', 'Ijtimoiy', 'Ta\'lim',
  'Sog\'liqni saqlash', 'Qishloq xo\'jaligi', 'Ekologiya', 'Boshqa',
];

function isValidUrl(s: string) {
  try { new URL(s); return true; } catch { return false; }
}

export default function CreateProblemPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const qc = useQueryClient();

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [videoInput, setVideoInput] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate: create, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      problemsApi.create({ ...data, imageUrls, videoUrls }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['problems'] });
      toast.success('Muammo yuborildi! Tasdiqlash kutilmoqda.');
      router.push('/problems');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error.response?.data?.error?.message ?? 'Xatolik yuz berdi');
    },
  });

  useEffect(() => { if (!token) router.replace('/login'); }, [token, router]);

  function addUrl(type: 'image' | 'video') {
    const input = type === 'image' ? imageInput.trim() : videoInput.trim();
    if (!input || !isValidUrl(input)) { toast.error('To\'g\'ri URL kiriting'); return; }
    if (type === 'image') {
      if (imageUrls.includes(input) || imageUrls.length >= 5) return;
      setImageUrls(u => [...u, input]);
      setImageInput('');
    } else {
      if (videoUrls.includes(input) || videoUrls.length >= 3) return;
      setVideoUrls(u => [...u, input]);
      setVideoInput('');
    }
  }

  const descLength = watch('description')?.length ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Orqaga
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Muammo yuborish</h1>
        <p className="text-sm text-slate-400 mt-1">
          Muammoni batafsil tasvirlab bering — mutaxassislar ko&apos;rib chiqadi
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => create(d))} className="space-y-5">
        {/* Title */}
        <Input
          label="Sarlavha"
          placeholder="Muammoni qisqacha ifodalang..."
          error={errors.title?.message}
          hint="10–200 ta belgi"
          {...register('title')}
        />

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Kategoriya (ixtiyoriy)
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const selected = watch('category') === cat;
              return (
                <label key={cat} className={`cursor-pointer px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                  selected
                    ? 'bg-brand-500/20 border-brand-400/40 text-brand-400'
                    : 'glass border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}>
                  <input type="radio" value={cat} className="sr-only" {...register('category')} />
                  {cat}
                </label>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Tavsif
            </label>
            <span className={`text-[11px] ${descLength > 4800 ? 'text-red-400' : 'text-slate-600'}`}>
              {descLength} / 5000
            </span>
          </div>
          <textarea
            rows={8}
            placeholder="Muammoni batafsil tasvirlab bering. Qanday holat yuzaga keldi? Nima kutasiz? Qanday yechimlar sinab ko'rdingiz?..."
            {...register('description')}
            className="w-full rounded-2xl glass border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 px-4 py-3 focus:outline-none input-glow transition-all resize-none"
          />
          {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
        </div>

        {/* Image URLs */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Image className="h-3.5 w-3.5" /> Rasm havolalari (max 5)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <input value={imageInput} onChange={(e) => setImageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl('image'))}
                placeholder="https://example.com/image.jpg"
                className="w-full h-11 pl-9 pr-3 rounded-xl glass border border-white/10 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none input-glow transition-all" />
            </div>
            <button type="button" onClick={() => addUrl('image')}
              className="h-11 w-11 flex items-center justify-center rounded-xl glass border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {imageUrls.map((u) => (
                <div key={u} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                  <Image className="h-3 w-3 text-slate-500 flex-shrink-0" />
                  <span className="truncate max-w-[160px]">{u}</span>
                  <button type="button" onClick={() => setImageUrls(arr => arr.filter(x => x !== u))} className="text-slate-500 hover:text-red-400">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video URLs */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Video className="h-3.5 w-3.5" /> Video havolalari (max 3)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <input value={videoInput} onChange={(e) => setVideoInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl('video'))}
                placeholder="https://youtube.com/..."
                className="w-full h-11 pl-9 pr-3 rounded-xl glass border border-white/10 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none input-glow transition-all" />
            </div>
            <button type="button" onClick={() => addUrl('video')}
              className="h-11 w-11 flex items-center justify-center rounded-xl glass border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {videoUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {videoUrls.map((u) => (
                <div key={u} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                  <Video className="h-3 w-3 text-slate-500 flex-shrink-0" />
                  <span className="truncate max-w-[160px]">{u}</span>
                  <button type="button" onClick={() => setVideoUrls(arr => arr.filter(x => x !== u))} className="text-slate-500 hover:text-red-400">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="p-4 rounded-2xl bg-brand-500/5 border border-brand-400/15 text-sm text-slate-400 leading-relaxed">
          <strong className="text-brand-400">Eslatma:</strong> Muammongiz superadmin tomonidan
          ko&apos;rib chiqilgach, tasdiqlansa <span className="text-neon-green">Ochiq</span> holatiga o&apos;tadi.
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
            Bekor qilish
          </Button>
          <Button type="submit" size="lg" loading={isPending} className="flex-1">
            <Send className="h-4 w-4" /> Yuborish
          </Button>
        </div>
      </form>
    </div>
  );
}
