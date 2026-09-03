'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ChevronLeft, Plus, X, Link2, Image as ImageIcon, Video,
  UploadCloud, Spinner,
} from '@/components/icons';
import { PageHeader } from '@/components/ui/page-header';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { problemsApi, chatApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCategoryNames } from '@/lib/use-categories';
import { cn } from '@/lib/utils';
import { FIELD_SIZE, FIELD_SURFACE } from '@/components/ui/field-styles';
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

  // Kategoriyalar bazadan keladi (admin paneldan boshqariladi).
  const categories = useCategoryNames('problem');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [videoInput, setVideoInput] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);
  const imgFileRef = useRef<HTMLInputElement>(null);
  const vidFileRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File, kind: 'image' | 'video') {
    const max = kind === 'video' ? 50 : 10;
    if (file.size > max * 1024 * 1024) {
      toast.error(`Maks. ${max}MB`);
      return;
    }
    const setBusy = kind === 'image' ? setUploadingImg : setUploadingVid;
    setBusy(true);
    try {
      const res = await chatApi.upload(file);
      if (kind === 'image') {
        setImageUrls((u) => (u.length >= 5 ? u : [...u, res.url]));
      } else {
        setVideoUrls((u) => (u.length >= 3 ? u : [...u, res.url]));
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Yuklashda xatolik'));
    } finally {
      setBusy(false);
    }
  }

  const { register, handleSubmit, watch, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate: create, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      problemsApi.create({ ...data, imageUrls, videoUrls }),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['problems'] });
      toast.success("Muammo e'lon qilindi!");
      router.push(res.data?.id ? `/problems/${res.data.id}` : '/problems');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Guest — register'ga (ro'yxatdan o'tgach aynan shu sahifaga qaytadi)
  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace(`/register?next=${encodeURIComponent('/problems/create')}`);
    }
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
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="tappable -ml-1 flex items-center gap-0.5 text-body text-accent-700"
      >
        <ChevronLeft className="h-[19px] w-[19px]" strokeWidth={3} />
        Orqaga
      </button>

      <PageHeader
        title="Muammo qoldirish"
        subtitle="Muammoni batafsil tasvirlab bering — hamjamiyat yechim taklif qiladi"
      />

      <form onSubmit={handleSubmit((d) => create(d))} className="space-y-5">
        <Input
          label="Sarlavha"
          placeholder="Muammoni qisqacha ifodalang..."
          error={errors.title?.message}
          hint="10–200 ta belgi"
          {...register('title')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-footnote font-medium text-slate-500">
            Kategoriya (ixtiyoriy)
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const selected = watch('category') === cat;
              return (
                <label key={cat} className={cn(
                  'cursor-pointer px-3 py-1.5 rounded-lg text-caption-1 font-medium border transition-all duration-150',
                  selected
                    ? 'bg-brand-900 border-brand-900 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700',
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

        {/* Images — upload yoki URL */}
        <div className="flex flex-col gap-2">
          <label className="text-footnote font-medium text-slate-500 flex items-center gap-2">
            <ImageIcon className="h-3.5 w-3.5" /> Rasmlar (max 5)
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => imgFileRef.current?.click()} disabled={uploadingImg || imageUrls.length >= 5}
              className="h-11 px-4 flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 text-subhead font-medium text-slate-500 transition-all hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700 disabled:opacity-50 shrink-0">
              {uploadingImg ? <Spinner className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />} Rasm yuklash
            </button>
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input value={imageInput} onChange={(e) => setImageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl('image'))}
                placeholder="yoki URL joylashtiring"
                className={cn(FIELD_SURFACE, FIELD_SIZE.md, 'pl-10 pr-3')} />
            </div>
            <button type="button" onClick={() => addUrl('image')} aria-label="Rasm qo'shish"
              className="tappable hv-pop h-12 w-12 flex items-center justify-center rounded-ios-md bg-accent-50 text-accent-700 shrink-0 hover:bg-accent-100">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {imageUrls.map((u) => (
                <div key={u} className="relative h-20 w-20 overflow-hidden rounded-ios-md bg-fill-tertiary group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setImageUrls(arr => arr.filter(x => x !== u))}
                    className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded bg-white/90 text-rose-600 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input ref={imgFileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadFile(f, 'image'); e.target.value = ''; }} />
        </div>

        {/* Videos — upload yoki URL */}
        <div className="flex flex-col gap-2">
          <label className="text-footnote font-medium text-slate-500 flex items-center gap-2">
            <Video className="h-3.5 w-3.5" /> Videolar (max 3)
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => vidFileRef.current?.click()} disabled={uploadingVid || videoUrls.length >= 3}
              className="h-11 px-4 flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 text-subhead font-medium text-slate-500 transition-all hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700 disabled:opacity-50 shrink-0">
              {uploadingVid ? <Spinner className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />} Video yuklash
            </button>
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input value={videoInput} onChange={(e) => setVideoInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl('video'))}
                placeholder="yoki YouTube/URL"
                className={cn(FIELD_SURFACE, FIELD_SIZE.md, 'pl-10 pr-3')} />
            </div>
            <button type="button" onClick={() => addUrl('video')} aria-label="Video qo'shish"
              className="tappable hv-pop h-12 w-12 flex items-center justify-center rounded-ios-md bg-accent-50 text-accent-700 shrink-0 hover:bg-accent-100">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {videoUrls.length > 0 && (
            <div className="space-y-2">
              {videoUrls.map((u) => (
                <div key={u} className="flex items-center gap-2 rounded-full bg-fill-tertiary px-3 py-1.5 text-caption-1 text-slate-700">
                  <Video className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate flex-1">{u.split('/').pop()}</span>
                  <button type="button" onClick={() => setVideoUrls(arr => arr.filter(x => x !== u))} className="text-slate-500 transition-colors hover:text-rose-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input ref={vidFileRef} type="file" accept="video/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadFile(f, 'video'); e.target.value = ''; }} />
        </div>

        <div className="p-4 rounded-lg bg-accent-50 border border-accent-200 text-subhead text-slate-700 leading-relaxed">
          <strong className="text-accent-700">Eslatma:</strong> Muammongiz yuborilgan zahoti{' '}
          <span className="text-accent-700 font-semibold">e&apos;lon qilinadi</span> — hamjamiyat
          darhol yechim taklif qilishi mumkin.
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="accent" size="lg" loading={isPending} className="flex-1">
            Yuborish
          </Button>
        </div>
      </form>
    </div>
  );
}
