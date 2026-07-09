'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Copy, Check, Send, Share2, Loader2, MessageCircle, Hash, Search,
} from 'lucide-react';
import { chatApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Modal } from '@/components/ui/modal';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { UserRowSkeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  problemId: string;
  problemTitle: string;
}

export function ProblemShareModal({ open, onClose, problemId, problemTitle }: Props) {
  const { token } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [q, setQ] = useState('');
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [sendingId, setSendingId] = useState<string | null>(null);

  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/problems/${problemId}` : '';

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: () => chatApi.conversations(),
    enabled: open && !!token,
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Nusxalab bo‘lmadi');
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: problemTitle, text: problemTitle, url: shareUrl });
      } catch { /* foydalanuvchi bekor qildi */ }
    } else {
      void copy();
    }
  }

  async function sendToConversation(id: string) {
    setSendingId(id);
    try {
      await chatApi.send(id, {
        type: 'text',
        content: `Muammo: ${problemTitle}\n${shareUrl}`,
      });
      setSentTo((s) => new Set(s).add(id));
      toast.success('Suhbatga yuborildi');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSendingId(null);
    }
  }

  const filtered = (conversations ?? []).filter((c) =>
    (c.title ?? '').toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <Modal open={open} onClose={onClose} title="Muammoni ulashish" className="max-w-md">
      <div className="space-y-4">
        {/* Link */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Havola</p>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-surface-soft p-1.5 pl-3">
            <span className="flex-1 truncate text-sm text-slate-600">{shareUrl}</span>
            <button onClick={copy}
              className={cn('flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all',
                copied ? 'bg-accent-700 text-white' : 'bg-brand-900 text-white hover:bg-brand-800')}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Nusxalandi' : 'Nusxalash'}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">
            Havolani istalgan odamga yuboring — ro‘yxatdan o‘tgach aynan shu muammoga o‘tadi.
          </p>
        </div>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button onClick={nativeShare}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-brand-900 hover:bg-surface-soft">
            <Share2 className="h-4 w-4" /> Boshqa ilovalar orqali ulashish
          </button>
        )}

        {/* Forward to chat */}
        {token && (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <MessageCircle className="h-3.5 w-3.5" /> Suhbatga yuborish
            </p>
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suhbat qidirish…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-accent-300 focus:outline-none" />
            </div>
            <div className="max-h-56 overflow-y-auto chat-scroll -mx-1">
              {isLoading ? (
                <UserRowSkeleton rows={4} />
              ) : filtered.length > 0 ? (
                filtered.map((c) => {
                  const sent = sentTo.has(c.id);
                  return (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-soft">
                      {c.type === 'group' && !c.avatarUrl ? (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-iris text-white"><Hash className="h-4 w-4" /></span>
                      ) : (
                        <Avatar src={c.avatarUrl} name={c.title} size={36} />
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-brand-900">{c.title}</span>
                      <button onClick={() => sendToConversation(c.id)} disabled={sent || sendingId === c.id}
                        className={cn('flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all',
                          sent ? 'bg-accent-50 text-accent-700' : 'bg-accent-700 text-white hover:bg-accent-800')}>
                        {sendingId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : sent ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                        {sent ? 'Yuborildi' : 'Yuborish'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="py-6 text-center text-sm text-slate-400">Suhbatlar topilmadi</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
