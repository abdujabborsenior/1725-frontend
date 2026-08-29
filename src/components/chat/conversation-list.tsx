'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquarePlus, Users, UsersRound, ChevronLeft, Search, X } from '@/components/icons';
import { chatApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { ConversationListSkeleton } from './chat-skeletons';
import { CreateGroupModal } from './create-group-modal';
import { cn } from '@/lib/utils';
import { timeAgoShort } from '@/lib/date';
import type { Conversation } from '@/types';

type Filter = 'all' | 'direct' | 'group';
const FILTER_KEY = 'sh_chat_filter';

// Matn bo'lmagan xabar turlari uchun preview (backend PREVIEW bilan bir xil)
const TYPE_PREVIEW: Record<string, string> = {
  image: 'Rasm', video: 'Video', voice: 'Ovozli xabar', round_video: 'Video xabar', file: 'Fayl',
};

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
  // Lokal qidiruv — server so'rovi YO'Q: ro'yxat allaqachon keshda, shuning
  // uchun filtrlash bir zumda va 100k yukda backendga hech qanday narx yo'q.
  const [query, setQuery] = useState('');
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
    // Yangi xabar — ro'yxatni HTTP refetch qilmasdan keshda lokal yangilaymiz
    // (har kelgan xabarda og'ir listConversations chaqirilmasin — 100k miqyos).
    // Keshda yo'q suhbat (yangi conversation) kelsa — to'liq refresh.
    const onNew = (msg: {
      conversationId: string; type: string; content: string | null;
      createdAt: string; sender?: { id: string } | null;
    }) => {
      const list = qc.getQueryData<Conversation[]>(['chat-conversations']);
      if (!list || !list.some((c) => c.id === msg.conversationId)) { refresh(); return; }
      const mine = msg.sender?.id === user?.id;
      const active = msg.conversationId === activeId;
      qc.setQueryData<Conversation[]>(['chat-conversations'], list.map((c) =>
        c.id === msg.conversationId
          ? {
              ...c,
              lastMessagePreview:
                msg.type === 'text' ? (msg.content ?? '').slice(0, 120) : (TYPE_PREVIEW[msg.type] ?? c.lastMessagePreview),
              lastMessageAt: msg.createdAt,
              unreadCount: mine || active ? c.unreadCount : (c.unreadCount || 0) + 1,
            }
          : c,
      ));
      if (!mine && !active) void qc.invalidateQueries({ queryKey: ['chat-unread'] });
    };
    socket.on('conversation:bump', refresh);
    socket.on('message:new', onNew);
    return () => {
      socket.off('conversation:bump', refresh);
      socket.off('message:new', onNew);
    };
  }, [qc, user?.id, activeId]);

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
    const q = query.trim().toLowerCase();
    // Lokal kesh yangilanishlaridan keyin ham tartib to'g'ri bo'lishi uchun
    // har doim lastMessageAt bo'yicha saralaymiz (server tartibi bilan bir xil)
    const list = [...(conversations ?? [])].sort((a, b) => {
      const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return tb - ta;
    });
    const byType = filter === 'all' ? list : list.filter((c) => c.type === filter);
    if (!q) return byType;
    return byType.filter(
      (c) =>
        (c.title ?? '').toLowerCase().includes(q) ||
        (c.username ?? '').toLowerCase().includes(q) ||
        (c.lastMessagePreview ?? '').toLowerCase().includes(q),
    );
  }, [conversations, filter, query]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="hairline-b flex items-center justify-between px-3 py-3 sm:px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/')}
            aria-label="Ortga"
            title="Ortga"
            className="btn-round flex h-9 w-9 items-center justify-center rounded-full text-accent-600 md:hidden"
          >
            <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={3} />
          </button>
          <h2 className="text-title-2 font-bold tracking-tight text-brand-900">Suhbatlar</h2>
        </div>
        <div className="flex items-center gap-1">
          {canCreateGroup && (
            <button onClick={() => setGroupModal(true)} aria-label="Guruh yaratish" className="btn-round flex h-9 w-9 items-center justify-center rounded-full text-accent-600">
              <UsersRound className="h-5 w-5" />
            </button>
          )}
          <Link href="/discover" aria-label="Yangi suhbat" className="btn-round flex h-9 w-9 items-center justify-center rounded-full text-accent-600">
            <MessageSquarePlus className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Qidiruv — suhbat nomi, @username yoki oxirgi xabar matni bo'yicha */}
      <div className="px-3 pb-2">
        <div className="ios-search flex items-center gap-2 px-3 py-1.5">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suhbatlarda qidirish"
            aria-label="Suhbatlarda qidirish"
            className="min-w-0 flex-1 bg-transparent text-subhead text-brand-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Tozalash"
              className="tappable flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fill text-white"
            >
              <X className="h-3 w-3" strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      {/* Segmented filter — Telegram uslubi */}
      <div className="hairline-b px-3 py-2">
        <div className="segmented w-full">
          {TABS.map((t) => {
            const active = filter === t.id;
            const count = unreadByTab[t.id];
            return (
              <button
                key={t.id}
                onClick={() => selectFilter(t.id)}
                className={cn(
                  'group relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-caption-1 font-bold transition-colors',
                  active ? 'text-brand-900' : 'text-slate-600 hover:text-brand-800',
                )}
              >
                {active && (
                  /* Tanlangan tab — bosishning ma'nosi yo'q, javob pichirlab
                     beriladi: kapsula soyasi bir oz chuqurlashadi. */
                  <span className="absolute inset-0 rounded-[7px] bg-white shadow-segment transition-shadow duration-150 group-hover:shadow-card-hover" />
                )}
                <span className="relative z-10 whitespace-nowrap">{t.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      'relative z-10 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-caption-2 font-bold',
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

      <div className="chat-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 pb-24 md:pb-2">
        {isLoading ? (
          <ConversationListSkeleton />
        ) : filtered.length > 0 ? (
          filtered.map((c, i) => (
            <div
              key={c.id}
              className="row-in"
              style={{ '--row-delay': `${Math.min(i, 8) * 0.035}s` } as CSSProperties}
            >
              {/* Telegram uslubidagi inset ajratkich — matn boshlanishiga tekislangan */}
              {i > 0 && (
                <div aria-hidden className="ml-[70px] mr-3 h-px origin-top scale-y-50 bg-[rgba(60,60,67,0.29)]" />
              )}
              <ConversationRow c={c} active={c.id === activeId} />
            </div>
          ))
        ) : query ? (
          <div className="px-4 py-16 text-center">
            <Search className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            <p className="text-subhead font-semibold text-brand-900">Hech narsa topilmadi</p>
            <p className="mt-1 text-caption-1 text-slate-500">
              «{query}» bo‘yicha suhbat yo‘q.
            </p>
          </div>
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
        active ? 'bg-accent-50 hover:bg-accent-100' : 'hover:bg-surface-soft',
      )}
    >
      {/* Guruh ham, shaxs ham bir naqshda: rasm yoki nom bo'yicha barqaror iOS
          tint + bosh harflar — har suhbat o'z rangi bilan farqlanadi. */}
      <Avatar src={c.avatarUrl} name={c.title} size={48} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-body font-semibold text-brand-900">{c.title}</p>
          {c.lastMessageAt && (
            <span className="shrink-0 text-footnote text-slate-400">
              {timeAgoShort(c.lastMessageAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-subhead text-slate-500">
            {c.type === 'group' && <Users className="mr-1 inline h-3 w-3" />}
            {c.lastMessagePreview ?? 'Suhbat boshlang'}
          </p>
          {c.unreadCount > 0 && (
            <span className="flex h-[20px] min-w-[20px] shrink-0 items-center justify-center rounded-full bg-accent-600 px-1.5 text-caption-2 font-semibold text-white">
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
        <MessageSquarePlus className="mx-auto mb-2 h-9 w-9 text-slate-300" />
        <p className="text-callout font-semibold text-brand-900">Shaxsiy suhbatlar yo‘q</p>
        <p className="mt-1 text-subhead text-slate-500">
          Hamjamiyatdan odam toping va suhbat boshlang
        </p>
        <Link href="/discover" className="tappable mt-3 inline-block text-subhead font-medium text-accent-700">
          Odamlarni topish
        </Link>
      </div>
    );
  }
  if (filter === 'group') {
    return (
      <div className="px-4 py-16 text-center">
        <UsersRound className="mx-auto mb-2 h-9 w-9 text-slate-300" />
        <p className="text-callout font-semibold text-brand-900">Guruhlar yo‘q</p>
        <p className="mt-1 text-subhead text-slate-500">Hamjamiyat guruhlariga qo&apos;shiling</p>
        <Link href="/discover" className="tappable mt-3 inline-block text-subhead font-medium text-accent-700">
          Guruhlarni topish
        </Link>
      </div>
    );
  }
  return (
    <div className="px-4 py-16 text-center">
      <MessageSquarePlus className="mx-auto mb-2 h-9 w-9 text-slate-300" />
      <p className="text-callout font-semibold text-brand-900">{hasAny ? 'Bu yerda hech narsa yo‘q' : 'Hali suhbatlar yo‘q'}</p>
      <p className="mt-1 text-subhead text-slate-500">Hamjamiyatdan odam toping va suhbat boshlang</p>
      <Link href="/discover" className="tappable mt-3 inline-block text-subhead font-medium text-accent-700">Odamlarni topish</Link>
    </div>
  );
}
