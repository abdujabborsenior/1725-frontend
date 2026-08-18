'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sparkles } from '@/components/icons';
import { YechimMark } from './yechim-mark';
import { aiApi, getErrorMessage, startupsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { AiDraft } from '@/types';

/** Guest ro'yxatdan o'tib qaytganda qoralama yo'qolmasligi uchun. */
export const DRAFT_STORAGE_KEY = 'yechim_ai_draft';

interface Props {
  open: boolean;
  onClose: () => void;
  draft: AiDraft;
  queryId?: string;
}

/**
 * Qoralamani ko'rib chiqish va e'lon qilish varag'i (iOS sheet).
 *
 * Muhim tamoyil: AI **avtomatik e'lon QILMAYDI** — matn har doim
 * foydalanuvchi nazoratida bo'ladi. Foydalanuvchi tahrirlashi, "Qaytadan
 * sayqallash" bilan AI'ga qayta yozdirishi va faqat keyin joylashi mumkin.
 */
export function AiPublishSheet({ open, onClose, draft, queryId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  const [title, setTitle] = useState(draft.title);
  const [description, setDescription] = useState(draft.description);
  const [category, setCategory] = useState(draft.category ?? '');
  const [saving, setSaving] = useState(false);
  const [polishing, setPolishing] = useState(false);

  // Qoralama tashqaridan yangilansa (yangi savol) — formani sinxronlaymiz.
  useEffect(() => {
    setTitle(draft.title);
    setDescription(draft.description);
    setCategory(draft.category ?? '');
  }, [draft]);

  const { data: categories } = useQuery({
    queryKey: ['startup-categories'],
    queryFn: () => startupsApi.categories(),
    staleTime: 10 * 60_000,
    enabled: open,
  });

  const categoryOptions = [
    { value: '', label: 'Kategoriyasiz' },
    ...(categories ?? []).map((c) => ({ value: c.category, label: c.category })),
    // AI tanlagan kategoriya ro'yxatda bo'lmasa ham yo'qolmasin
    ...(category && !(categories ?? []).some((c) => c.category === category)
      ? [{ value: category, label: category }]
      : []),
  ];

  const titleOk = title.trim().length >= 10 && title.trim().length <= 300;
  const descOk = description.trim().length >= 20;

  async function handlePolish() {
    setPolishing(true);
    try {
      const polished = await aiApi.polish(`${title}\n\n${description}`);
      setTitle(polished.title);
      setDescription(polished.description);
      if (polished.category) setCategory(polished.category);
      toast.success('Matn qayta sayqallandi');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Sayqallab bo‘lmadi'));
    } finally {
      setPolishing(false);
    }
  }

  async function handlePublish() {
    if (!titleOk || !descOk) return;

    // Mehmon: qoralamani saqlab, ro'yxatdan o'tishga yuboramiz va aynan shu
    // yerga qaytaramiz (§8.3 dagi guest → register → qaytish oqimi).
    if (!token) {
      try {
        sessionStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({ title, description, category: category || null }),
        );
      } catch {
        /* sessionStorage bo'lmasligi mumkin — oqim baribir davom etadi */
      }
      router.push(`/register?next=${encodeURIComponent('/ai')}`);
      return;
    }

    setSaving(true);
    try {
      const res = await aiApi.publishProblem({
        queryId,
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || undefined,
      });
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        /* ixtiyoriy */
      }
      // Ro'yxatlar va "muammolarim" darhol yangilansin
      await queryClient.invalidateQueries({ queryKey: ['problems'] });
      await queryClient.invalidateQueries({ queryKey: ['my-problems'] });
      toast.success('Muammoingiz e’lon qilindi');
      onClose();
      router.push(`/problems/${res.data.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'E’lon qilib bo‘lmadi'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Muammoni joylash" className="sm:max-w-lg">
      <div className="space-y-4">
        {/* Manba belgisi: bu matnni AI yozgan — foydalanuvchi buni bir
            qarashda bilishi kerak (ishonch va mas'uliyat aniqligi). */}
        <div className="flex items-start gap-2.5">
          <YechimMark size={22} state="found" className="mt-0.5 shrink-0" />
          <p className="text-subhead leading-relaxed text-slate-500">
            Matnni Yechim AI tayyorladi — imlo va uslub to‘g‘rilandi. Xohlagancha
            o‘zgartiring, keyin joylang. E’lon qilingach muammo hammaga ko‘rinadi
            va profilingizdagi “Muammolarim”da saqlanadi.
          </p>
        </div>

        <Input
          label="Sarlavha"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={300}
          error={title.length > 0 && !titleOk ? 'Kamida 10 ta belgi' : undefined}
        />

        <Textarea
          label="Muammo tavsifi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          maxLength={5000}
          count={{ current: description.length, max: 5000 }}
          error={description.length > 0 && !descOk ? 'Kamida 20 ta belgi' : undefined}
        />

        <Select
          label="Kategoriya"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={categoryOptions}
        />

        <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse">
          <Button
            onClick={() => void handlePublish()}
            loading={saving}
            disabled={!titleOk || !descOk || polishing}
            size="lg"
            fullWidth
          >
            {token ? 'Joylash' : 'Ro‘yxatdan o‘tib joylash'}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => void handlePolish()}
            loading={polishing}
            disabled={saving || !title.trim() || !description.trim()}
          >
            <Sparkles className="h-[18px] w-[18px]" /> Qaytadan sayqallash
          </Button>
        </div>
      </div>
    </Modal>
  );
}
