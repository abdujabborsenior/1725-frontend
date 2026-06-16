'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { chatApi, getErrorMessage } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export function CreateGroupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  async function create() {
    if (title.trim().length < 2) return toast.error('Guruh nomi juda qisqa');
    setSaving(true);
    try {
      const conv = await chatApi.createGroup({ title: title.trim(), description: description.trim() || undefined, isPublic });
      toast.success('Guruh yaratildi');
      void qc.invalidateQueries({ queryKey: ['chat-conversations'] });
      onClose();
      router.push(`/messages/${conv.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Yangi guruh">
      <div className="space-y-4">
        <Input label="Guruh nomi" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masalan: AI ishqibozlari" />
        <Textarea label="Tavsif" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Guruh nima haqida?" />
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4 accent-accent-500" />
          <span className="flex items-center gap-2 text-sm text-brand-900"><Users className="h-4 w-4 text-slate-400" /> Ommaviy — bosh sahifada ko‘rinadi, hamma qo‘shila oladi</span>
        </label>
        <Button variant="accent" fullWidth loading={saving} onClick={create}>Guruh yaratish</Button>
      </div>
    </Modal>
  );
}
