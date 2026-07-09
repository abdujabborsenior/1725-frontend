'use client';

import { useEffect, useState } from 'react';
import { Type, Image as ImageIcon, Video, Mic, Disc, ShieldAlert } from 'lucide-react';
import { chatApi, getErrorMessage } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { GroupAvatarPicker } from './group-avatar-picker';
import { cn } from '@/lib/utils';
import type { Conversation, MessageType } from '@/types';
import toast from 'react-hot-toast';

const RESTRICTABLE: { type: MessageType; label: string; icon: typeof Type }[] = [
  { type: 'text', label: 'Matn', icon: Type },
  { type: 'image', label: 'Rasm', icon: ImageIcon },
  { type: 'video', label: 'Video', icon: Video },
  { type: 'voice', label: 'Ovozli xabar', icon: Mic },
  { type: 'round_video', label: 'Video xabar', icon: Disc },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        'relative flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors',
        on ? 'bg-rose-500' : 'bg-slate-300',
      )}
    >
      <span
        className={cn(
          'h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-out',
          on ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}

export function GroupSettingsModal({
  open, onClose, conversation, onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  conversation: Conversation;
  onUpdated: (conv: Conversation) => void;
}) {
  const [blocked, setBlocked] = useState<MessageType[]>(conversation.blockedMessageTypes ?? []);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(conversation.avatarUrl ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setBlocked(conversation.blockedMessageTypes ?? []);
      setAvatarUrl(conversation.avatarUrl ?? null);
    }
  }, [open, conversation.blockedMessageTypes, conversation.avatarUrl]);

  function toggle(type: MessageType) {
    setBlocked((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  async function save() {
    setSaving(true);
    try {
      // Avatar o'zgargan bo'lsa — guruhni yangilaymiz; so'ng cheklovlarni saqlaymiz.
      let updated = conversation;
      if ((avatarUrl ?? null) !== (conversation.avatarUrl ?? null)) {
        updated = await chatApi.updateGroup(conversation.id, { avatarUrl: avatarUrl ?? '' });
      }
      updated = await chatApi.setGroupRestrictions(conversation.id, blocked);
      onUpdated(updated);
      toast.success('Guruh sozlamalari saqlandi');
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Guruh sozlamalari">
      <div className="space-y-4">
        {/* Guruh avatari */}
        <div className="flex flex-col items-center gap-1 border-b border-slate-100 pb-4">
          <GroupAvatarPicker value={avatarUrl} name={conversation.title} onChange={setAvatarUrl} />
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-3 text-amber-800">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-xs leading-relaxed">
            Yoqilgan turlar oddiy a&apos;zolar uchun <b>taqiqlanadi</b>. Egasi va adminlar har doim
            yubora oladi.
          </p>
        </div>

        <div className="space-y-2">
          {RESTRICTABLE.map(({ type, label, icon: Icon }) => {
            const on = blocked.includes(type);
            return (
              <div
                key={type}
                className={cn(
                  'flex items-center justify-between rounded-2xl border p-3 transition-colors',
                  on ? 'border-rose-200 bg-rose-50/60' : 'border-slate-200',
                )}
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-brand-900">
                  <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', on ? 'bg-rose-100 text-rose-600' : 'bg-surface-soft text-slate-500')}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  {label}
                  {on && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600">Taqiqlangan</span>}
                </span>
                <Toggle on={on} onClick={() => toggle(type)} />
              </div>
            );
          })}
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="btn-lift flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent-500 text-sm font-semibold text-white shadow-glow-accent transition-colors hover:bg-accent-600 disabled:opacity-60"
        >
          {saving ? 'Saqlanmoqda…' : 'Saqlash'}
        </button>
      </div>
    </Modal>
  );
}
