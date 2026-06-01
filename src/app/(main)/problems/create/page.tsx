'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, X, Link2, Image as ImageIcon, Video, Send } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { problemsApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PROBLEM_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const schema = z.object({
  title:       z.string().min(10, 'Kamida 10 ta belgi').max(200),
  description: z.string().min(30, 'Kamida 30 ta belgi').max(5000),
  category:    z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function isValidUrl(s: string) {
  try { new URL(s); return true; } catch { return false; }
}

export default function CreateProblemPage() {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();
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
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  useEffect(() => {
    if (hasHydrated && !token) router.replace('/login');
  }, [hasHydrated, token, router]);

  function addUrl(type: 'image' | 'video') {
    const input = type === 'image' ? imageInput.trim() : videoInput.trim();
    if (!input || !isValidUrl(input)) { toast.error("To'g'ri URL kiriting"); return; }
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
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-900 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Orqaga
      </button>

      <div>
        <h1 className="text-2xl font-bold text-brand-900">Muammo yuborish</h1>
        <p className="text-sm text-slate-500 mt-1">
          Muammoni batafsil tasvirlab bering — mutaxassislar ko&apos;rib chiqadi
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => create(d))} className="space-y-5">
        <Input
          label="Sarlavha"
          placeholder="Muammoni qisqacha ifodalang..."
          error={errors.title?.message}
          hint="10–200 ta belgi"
          {...register('title')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Kategoriya (ixtiyoriy)
          </label>
          <div className="flex flex-wrap gap-2">
            {PROBLEM_CATEGORIES.map((cat) => {
              const selected = watch('category') === cat;
              return (
                <label key={cat} className={cn(
                  'cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150',
                  selected
                    ? 'bg-brand-900 border-brand-900 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-brand-900',
                )}>
                  <input type="radio" value={cat} className="sr-only" {...register('category')} />
                  {cat}
                </label>
              );
            })}
          </div>
        </div>

        <Textarea
          label="Tavsif"
          rows={8}
          placeholder="Muammoni batafsil tasvirlab bering. Qanday holat yuzaga keldi? Nima kutasiz? Qanday yechimlar sinab ko'rdingiz?..."
          count={{ current: descLength, max: 5000 }}
          error={errors.description?.message}
          {...register('description')}
        />

        {/* Image URLs */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="h-3.5 w-3.5" /> Rasm havolalari (max 5)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input value={imageInput} onChange={(e) => setImageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl('image'))}
                placeholder="https://example.com/image.jpg"
                className="w-full h-11 pl-9 pr-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus transition-all" />
            </div>
            <button type="button" onClick={() => addUrl('image')}
              aria-label="Rasm qo'shish"
              className="h-11 w-11 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-brand-900 hover:border-slate-300 transition-all">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {imageUrls.map((u) => (
                <div key={u} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <ImageIcon className="h-3 w-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate max-w-[160px]">{u}</span>
                  <button type="button" onClick={() => setImageUrls(arr => arr.filter(x => x !== u))} className="text-slate-400 hover:text-rose-600">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video URLs */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Video className="h-3.5 w-3.5" /> Video havolalari (max 3)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input value={videoInput} onChange={(e) => setVideoInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl('video'))}
                placeholder="https://youtube.com/..."
                className="w-full h-11 pl-9 pr-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus transition-all" />
            </div>
            <button type="button" onClick={() => addUrl('video')}
              aria-label="Video qo'shish"
              className="h-11 w-11 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-brand-900 hover:border-slate-300 transition-all">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {videoUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {videoUrls.map((u) => (
                <div key={u} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <Video className="h-3 w-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate max-w-[160px]">{u}</span>
                  <button type="button" onClick={() => setVideoUrls(arr => arr.filter(x => x !== u))} className="text-slate-400 hover:text-rose-600">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg bg-accent-50 border border-accent-200 text-sm text-slate-700 leading-relaxed">
          <strong className="text-accent-700">Eslatma:</strong> Muammongiz superadmin tomonidan
          ko&apos;rib chiqilgach, tasdiqlansa <span className="text-accent-700 font-semibold">Ochiq</span> holatiga o&apos;tadi.
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="accent" size="lg" loading={isPending} className="flex-1">
            <Send className="h-4 w-4" /> Yuborish
          </Button>
        </div>
      </form>
    </div>
  );
}
