'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, MessageSquarePlus, Hash, Users, UsersRound, ArrowLeft } from 'lucide-react';
import { chatApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { CreateGroupModal } from './create-group-modal';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import type { Conversation } from '@/types';

type Filter = 'all' | 'direct' | 'group';
const FILTER_KEY = 'sh_chat_filter';

const TABS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Hammasi' },
  { id: 'direct', label: 'Shaxsiy' },
  { id: 'group', label: 'Guruhlar' },
];

export function ConversationList({ activeId }: { activeId?: string }) {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const qc = useQueryClient();
  const [groupModal, setGroupModal] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  // Guruh ochish endi barcha foydalanuvchilarga ochiq (oddiy user — 3 tagacha,
  // limitni backend tekshiradi)
  const canCreateGroup = !!user;

  // localStorage'dan oxirgi tanlangan filtrni tiklash
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FILTER_KEY) as Filter | null;
      if (saved && ['all', 'direct', 'group'].includes(saved)) setFilter(saved);
    } catch {
      /* localStorage mavjud bo'lmasligi mumkin */
    }
  }, []);

  function selectFilter(f: Filter) {
    setFilter(f);
    try {
      localStorage.setItem(FILTER_KEY, f);
    } catch {
      /* ignore */
    }
  }

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: () => chatApi.conversations(),
    enabled: !!token,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    const refresh = () => {
      void qc.invalidateQueries({ queryKey: ['chat-conversations'] });
      void qc.invalidateQueries({ queryKey: ['chat-unread'] });
    };
    socket.on('conversation:bump', refresh);
    socket.on('message:new', refresh);
    return () => {
      socket.off('conversation:bump', refresh);
      socket.off('message:new', refresh);
    };
  }, [qc]);

  // Har bir tab uchun o'qilmagan jami
  const unreadByTab = useMemo(() => {
    const acc = { all: 0, direct: 0, group: 0 } as Record<Filter, number>;
    (conversations ?? []).forEach((c) => {
      const u = c.unreadCount || 0;
      acc.all += u;
      if (c.type === 'direct') acc.direct += u;
      else acc.group += u;
    });
    return acc;
  }, [conversations]);

  const filtered = useMemo(() => {
    const list = conversations ?? [];
    if (filter === 'all') return list;
    return list.filter((c) => c.type === filter);
  }, [conversations, filter]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-3 sm:px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/')}
            aria-label="Ortga"
            title="Ortga"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-900 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-bold text-brand-900">Suhbatlar</h2>
        </div>
        <div className="flex items-center gap-1">
          {canCreateGroup && (
            <button onClick={() => setGroupModal(true)} aria-label="Guruh yaratish" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-iris-600 active:scale-95">
              <UsersRound className="h-5 w-5" />
            </button>
          )}
          <Link href="/discover" aria-label="Yangi suhbat" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-brand-900 active:scale-95">
            <MessageSquarePlus className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Segmented filter — Telegram uslubi */}
      <div className="border-b border-slate-200 px-2 py-2">
        <div className="flex items-center gap-1 rounded-2xl bg-surface-soft p-1">
          {TABS.map((t) => {
            const active = filter === t.id;
            const count = unreadByTab[t.id];
            return (
              <button
                key={t.id}
                onClick={() => selectFilter(t.id)}
                className={cn(
                  'relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-bold transition-colors',
                  active ? 'text-brand-900' : 'text-slate-500 hover:text-brand-800',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="chat-filter-pill"
                    className="absolute inset-0 rounded-xl bg-white shadow-soft"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative z-10 whitespace-nowrap">{t.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      'relative z-10 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold',
                      active ? 'bg-accent-700 text-white' : 'bg-slate-300/70 text-slate-600',
                    )}
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {canCreateGroup && <CreateGroupModal open={groupModal} onClose={() => setGroupModal(false)} />}

      <div className="chat-scroll flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
        ) : filtered.length > 0 ? (
          filtered.map((c) => <ConversationRow key={c.id} c={c} active={c.id === activeId} />)
        ) : (
          <EmptyState filter={filter} hasAny={(conversations?.length ?? 0) > 0} />
        )}
      </div>
    </div>
  );
}

function ConversationRow({ c, active }: { c: Conversation; active: boolean }) {
  return (
    <Link
      href={`/messages/${c.id}`}
      className={cn(
        'flex items-center gap-3 rounded-2xl p-2.5 transition-colors active:scale-[0.99]',
        active ? 'bg-accent-50' : 'hover:bg-surface-soft',
      )}
    >
      {c.type === 'group' && !c.avatarUrl ? (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-iris text-white"><Hash className="h-5 w-5" /></span>
      ) : (
        <Avatar src={c.avatarUrl} name={c.title} size={48} />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-bold text-brand-900">{c.title}</p>
          {c.lastMessageAt && (
            <span className="shrink-0 text-[10px] text-slate-400">
              {formatDistanceToNowStrict(new Date(c.lastMessageAt))}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-slate-500">
            {c.type === 'group' && <Users className="mr-1 inline h-3 w-3" />}
            {c.lastMessagePreview ?? 'Suhbat boshlang'}
          </p>
          {c.unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-accent-700 px-1.5 text-[10px] font-bold text-white">
              {c.unreadCount > 99 ? '99+' : c.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ filter, hasAny }: { filter: Filter; hasAny: boolean }) {
  if (filter === 'direct') {
    return (
      <div className="px-4 py-16 text-center">
        <MessageSquarePlus className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        <p className="text-sm font-semibold text-brand-900">Shaxsiy suhbatlar yo&apos;q</p>
        <p className="mt-1 text-xs text-slate-500">Hamjamiyatdan odam toping va suhbat boshlang.</p>
        <Link href="/discover" className="mt-3 inline-block text-xs font-semibold text-accent-700 hover:underline">Odamlarni topish →</Link>
      </div>
    );
  }
  if (filter === 'group') {
    return (
      <div className="px-4 py-16 text-center">
        <UsersRound className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        <p className="text-sm font-semibold text-brand-900">Guruhlar yo&apos;q</p>
        <p className="mt-1 text-xs text-slate-500">Hamjamiyat guruhlariga qo&apos;shiling.</p>
        <Link href="/discover" className="mt-3 inline-block text-xs font-semibold text-iris-700 hover:underline">Guruhlarni topish →</Link>
      </div>
    );
  }
  return (
    <div className="px-4 py-16 text-center">
      <MessageSquarePlus className="mx-auto mb-2 h-8 w-8 text-slate-300" />
      <p className="text-sm font-semibold text-brand-900">{hasAny ? 'Bu yerda hech narsa yo‘q' : 'Hali suhbatlar yo‘q'}</p>
      <p className="mt-1 text-xs text-slate-500">Hamjamiyatdan odam toping va suhbat boshlang.</p>
      <Link href="/discover" className="mt-3 inline-block text-xs font-semibold text-accent-700 hover:underline">Odamlarni topish →</Link>
    </div>
  );
}
