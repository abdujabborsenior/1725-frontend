'use client';

import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { Users, AtSign } from '@/components/icons';
import { chatApi, getErrorMessage } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { GroupAvatarPicker } from './group-avatar-picker';
import toast from 'react-hot-toast';

export function CreateGroupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('chat.group');
  const router = useRouter();
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  const usernameOk = username === '' || /^[a-z][a-z0-9_]{4,31}$/.test(username);

  async function create() {
    if (title.trim().length < 2) return toast.error(t('nameTooShort'));
    if (username && !usernameOk) return toast.error(t('usernameRule'));
    setSaving(true);
    try {
      const conv = await chatApi.createGroup({
        title: title.trim(),
        description: description.trim() || undefined,
        avatarUrl: avatarUrl ?? undefined,
        isPublic,
        username: username.trim() || undefined,
      });
      toast.success(t('created'));
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
    <Modal open={open} onClose={onClose} title={t('createTitle')}>
      <div className="space-y-4">
        <div className="flex justify-center pt-1">
          <GroupAvatarPicker value={avatarUrl} name={title} onChange={setAvatarUrl} />
        </div>

        <Input label={t('nameLabel')} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('namePlaceholder')} />

        {/* Username — Telegram uslubi (@ adornment) */}
        <Input
          label={t('usernameLabel')}
          icon={<AtSign className="h-4 w-4" />}
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          placeholder={t('usernamePlaceholder')}
          error={username && !usernameOk ? t('usernameInvalid') : undefined}
          hint={t('usernameHint')}
        />

        <Textarea label={t('descriptionLabel')} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('descriptionPlaceholder')} />
        <label className="flex cursor-pointer items-center gap-3 rounded-ios-md bg-fill-tertiary p-3">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4 accent-accent-500" />
          <span className="flex items-center gap-2 text-subhead text-brand-900"><Users className="h-4 w-4 text-slate-400" /> {t('publicLabel')}</span>
        </label>
        <Button variant="accent" fullWidth loading={saving} onClick={create}>{t('create')}</Button>
      </div>
    </Modal>
  );
}
