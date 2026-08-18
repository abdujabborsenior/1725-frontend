'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft, Spinner, Users, Hash, MoreHorizontal, Info, LogOut, Settings, ArrowDown,
} from '@/components/icons';
import { chatApi, getErrorMessage, type SendMessagePayload } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { MessageBubble } from './message-bubble';
import { Composer } from './composer';
import { ChatOpeningSkeleton, MessagesSkeleton } from './chat-skeletons';
import { ChatEmptyState } from './chat-empty';
import { GroupSettingsModal } from './group-settings-modal';
import { profileHref } from '@/components/social/user-list-item';
import { cn } from '@/lib/utils';
import { timeAgo, dayLabel, sameDay } from '@/lib/date';
import toast from 'react-hot-toast';
import type { ChatMessage, Conversation } from '@/types';

let cidCounter = 0;
const newClientId = () => `c${Date.now()}_${++cidCounter}`;

/**
 * Sarlavhadagi ism/holat bloki.
 *  • Guruh — bosilganda guruh ma'lumoti modali ochiladi.
 *  • Shaxsiy suhbat — bosilganda SUHBATDOSH PROFILI ochiladi (2026-07-24).
 */
function HeaderIdentity({
  isGroup, href, onInfo, children,
}: {
  isGroup: boolean;
  href: string | null;
  onInfo: () => void;
  children: React.ReactNode;
}) {
  const cls = 'min-w-0 flex-1 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-slate-50';
  if (isGroup) {
    return (
      <button onClick={onInfo} className={cn(cls, 'cursor-pointer')} aria-label="Guruh ma'lumoti">
        {children}
      </button>
    );
  }
  // Profil havolasi mavjud bo'lmasa — oddiy blok (bosilmaydi)
  if (!href || href === '#') return <div className="min-w-0 flex-1 px-1 py-0.5">{children}</div>;
  return (
    <Link href={href} className={cls} aria-label="Profilni ochish">
      {children}
    </Link>
  );
}

export function ChatWindow({ conversationId }: { conversationId: string }) {
  const me = useAuthStore((s) => s.user);
  const router = useRouter();
  const qc = useQueryClient();

  // Telegram uslubida tez ochilish: header ro'yxat keshidan DARHOL seed qilinadi,
  // server javobi kelgach yangilanadi (foydalanuvchi skeletonni faqat xabarlarda ko'radi)
  const [conv, setConv] = useState<Conversation | null>(
    () =>
      qc
        .getQueryData<Conversation[]>(['chat-conversations'])
        ?.find((c) => c.id === conversationId) ?? null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editing, setEditing] = useState<ChatMessage | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [online, setOnline] = useState(false);
  const [peerRead, setPeerRead] = useState(false);

  // Bo'sh suhbatdagi tayyor jumla → composer'ga (n — takroriy bosish uchun)
  const [presetDraft, setPresetDraft] = useState<{ text: string; n: number } | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // "Pastga" tugmasi: foydalanuvchi eski xabarlarni o'qiyotganda kelgan yangi
  // xabar uni pastga TORTIB KETMAYDI (Telegram xulqi) — o'rniga tugmada
  // hisoblagich ko'rinadi va u o'zi qaytadi.
  const [atBottom, setAtBottom] = useState(true);
  const [newCount, setNewCount] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Socket handler'lari eski closure'ni ushlab qolmasligi uchun ref orqali
  const atBottomRef = useRef(true);
  // Suhbat ochilgan lahza — shundan KEYIN yaratilgan xabarlargina kirish
  // animatsiyasini oladi (mavjud tarix jimgina chiziladi).
  const openedAt = useRef(Date.now());

  const scrollToBottom = useCallback((smooth = false) => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    });
    atBottomRef.current = true;
    setAtBottom(true);
    setNewCount(0);
  }, []);

  const markRead = useCallback(() => {
    chatApi.read(conversationId).catch(() => undefined);
    getSocket().emit('message:read', { conversationId });
    // Ro'yxatni refetch qilmasdan lokal yangilaymiz — har ochilishda/har kelgan
    // xabarda og'ir listConversations so'rovi ketmasin (100k miqyos)
    qc.setQueryData<Conversation[]>(['chat-conversations'], (prev) =>
      prev?.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
    );
    void qc.invalidateQueries({ queryKey: ['chat-unread'] });
  }, [conversationId, qc]);

  // Initial load
  useEffect(() => {
    let active = true;
    setLoading(true);
    setMessages([]);
    Promise.all([chatApi.conversation(conversationId), chatApi.messages(conversationId, { limit: 30 })])
      .then(([c, m]) => {
        if (!active) return;
        setConv(c);
        setMessages(m.data);
        setCursor(m.nextCursor);
        if (c.otherUser?.lastSeenAt) {
          setOnline(Date.now() - new Date(c.otherUser.lastSeenAt).getTime() < 2 * 60 * 1000);
        }
        setLoading(false);
        scrollToBottom();
        markRead();
      })
      .catch(() => active && setLoading(false));
    return () => { active = false; };
  }, [conversationId, scrollToBottom, markRead]);

  // Socket real-time
  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit('conversation:join', { conversationId });

    const onNew = (msg: ChatMessage & { clientId?: string }) => {
      if (msg.conversationId !== conversationId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        const idx = msg.clientId ? prev.findIndex((m) => m.id === msg.clientId) : -1;
        if (idx >= 0) {
          const copy = prev.slice();
          copy[idx] = msg;
          return copy;
        }
        return [...prev, msg];
      });
      const mine = msg.sender?.id === me?.id;
      if (!mine) { markRead(); setPeerRead(false); }
      // O'z xabaring — har doim pastga; boshqaniki — faqat pastda turgan bo'lsang
      if (mine || atBottomRef.current) scrollToBottom(true);
      else setNewCount((c) => c + 1);
    };
    const onTyping = (t: { conversationId: string; user: { id: string; fullName: string }; typing: boolean }) => {
      if (t.conversationId !== conversationId || t.user.id === me?.id) return;
      if (t.typing) {
        setTypingUser(t.user.fullName);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTypingUser(null), 3500);
      } else setTypingUser(null);
    };
    const onPresence = (p: { userId: string; online: boolean }) => {
      if (conv?.otherUser && p.userId === conv.otherUser.id) setOnline(p.online);
    };
    const onRead = (r: { conversationId: string; userId: string }) => {
      if (r.conversationId === conversationId && r.userId !== me?.id) setPeerRead(true);
    };
    const onEdited = (msg: ChatMessage) => {
      if (msg.conversationId !== conversationId) return;
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
    };

    socket.on('message:new', onNew);
    socket.on('typing', onTyping);
    socket.on('presence', onPresence);
    socket.on('message:read', onRead);
    socket.on('message:edit', onEdited);
    return () => {
      socket.off('message:new', onNew);
      socket.off('typing', onTyping);
      socket.off('presence', onPresence);
      socket.off('message:read', onRead);
      socket.off('message:edit', onEdited);
    };
  }, [conversationId, me?.id, conv?.otherUser, markRead, scrollToBottom]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    try {
      const m = await chatApi.messages(conversationId, { limit: 30, before: cursor });
      setMessages((prev) => [...m.data, ...prev]);
      setCursor(m.nextCursor);
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - prevHeight;
      });
    } finally {
      setLoadingMore(false);
    }
  }

  function handleSend(payload: SendMessagePayload) {
    const clientId = newClientId();
    const optimistic: ChatMessage = {
      id: clientId,
      conversationId,
      type: payload.type,
      content: payload.content ?? null,
      attachments: payload.attachments ?? [],
      createdAt: new Date().toISOString(),
      editedAt: null,
      isDeleted: false,
      sender: me ? { id: me.id, username: me.username, fullName: me.fullName, avatarUrl: me.avatarUrl } : null,
      replyTo: replyTo
        ? { id: replyTo.id, type: replyTo.type, content: replyTo.content, senderName: replyTo.sender?.fullName ?? null }
        : null,
      clientId,
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setPeerRead(false);
    scrollToBottom(true);
    getSocket().emit(
      'message:send',
      { conversationId, ...payload, clientId },
      (ack: { ok?: boolean; message?: ChatMessage; error?: string }) => {
        if (ack?.error) {
          // Fallback REST
          chatApi.send(conversationId, { ...payload, clientId })
            .then((real) => setMessages((prev) => prev.map((m) => (m.id === clientId ? real : m))))
            .catch(() => setMessages((prev) => prev.filter((m) => m.id !== clientId)));
        } else if (ack?.message) {
          setMessages((prev) => prev.some((m) => m.id === ack.message!.id)
            ? prev.filter((m) => m.id !== clientId)
            : prev.map((m) => (m.id === clientId ? ack.message! : m)));
        }
        void qc.invalidateQueries({ queryKey: ['chat-conversations'] });
      },
    );
  }

  async function handleEditSave(id: string, content: string) {
    const updated = await chatApi.editMessage(id, content);
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
  }

  function emitTyping() {
    getSocket().emit('typing', { conversationId, typing: true });
  }

  async function handleLeave() {
    setLeaving(true);
    try {
      await chatApi.leaveGroup(conversationId);
      void qc.invalidateQueries({ queryKey: ['chat-conversations'] });
      void qc.invalidateQueries({ queryKey: ['chat-unread'] });
      toast.success('Guruhdan chiqdingiz');
      router.push('/messages');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setLeaving(false);
      setLeaveOpen(false);
    }
  }

  if (!conv) {
    // Keshda ham yo'q — to'liq skeleton (header + xabarlar + composer shakli)
    if (loading) return <ChatOpeningSkeleton />;
    return (
      <div className="flex h-full w-full items-center justify-center text-subhead text-slate-500">
        Suhbat topilmadi
      </div>
    );
  }

  const isGroup = conv.type === 'group';
  const headerHref = conv.otherUser ? profileHref(conv.otherUser) : '#';
  const isOwner = conv.myRole === 'owner';
  const isSuperadmin = me?.role === 'superadmin';
  const canBypassRestrictions = isOwner || conv.myRole === 'admin' || isSuperadmin;
  // Guruh sozlamalari — egasi YOKI superadmin (backend ham shu qoidани tekshiradi)
  const canManageGroup = isOwner || isSuperadmin;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Header — z-30 so the group menu paints above message bubbles (z-10) */}
      <div className="material-bar hairline-b relative z-30 flex items-center gap-3 px-3 py-2.5">
        <button
          onClick={() => router.push('/messages')}
          aria-label="Ortga"
          title="Ortga"
          className="tappable flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-accent-700"
        >
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={3} />
        </button>
        {isGroup ? (
          <button onClick={() => setInfoOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full bg-iris-500 text-white">
            {conv.avatarUrl ? <Avatar src={conv.avatarUrl} name={conv.title} size={40} /> : <Hash className="h-5 w-5" />}
          </button>
        ) : (
          <Link href={headerHref}><Avatar src={conv.avatarUrl} name={conv.title} size={40} online={online} /></Link>
        )}
        {/* Guruhda — ma'lumot modali; shaxsiy suhbatda — suhbatdosh PROFILI */}
        <HeaderIdentity isGroup={isGroup} href={headerHref} onInfo={() => setInfoOpen(true)}>
          <p className="truncate text-callout font-semibold text-brand-900">{conv.title}</p>
          <p className="truncate text-footnote text-slate-500">
            {typingUser ? <span className="text-accent-600">yozmoqda…</span>
              : isGroup ? <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {conv.participantCount} a&apos;zo{conv.username ? <span className="text-iris-500"> · @{conv.username}</span> : null}</span>
              : online ? <span className="text-accent-600">onlayn</span>
              : conv.otherUser?.lastSeenAt ? `oxirgi faollik ${timeAgo(conv.otherUser.lastSeenAt)}` : ''}
          </p>
        </HeaderIdentity>

        {/* Group menu */}
        {isGroup && (
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menyu"
              className="tappable flex h-9 w-9 items-center justify-center rounded-full text-accent-700"
            >
              <MoreHorizontal className="h-[22px] w-[22px]" />
            </button>
            {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div
                    className="material-menu absolute right-0 top-11 z-50 w-60 max-w-[calc(100vw-1.5rem)] origin-top-right animate-scale-in overflow-hidden rounded-ios-lg p-1 shadow-modal ring-1 ring-black/[0.06]"
                  >
                    <button onClick={() => { setInfoOpen(true); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-[9px] px-3 py-2.5 text-body text-brand-900 transition-colors duration-150 active:bg-fill-tertiary">
                      <Info className="h-4 w-4 text-slate-400" /> Guruh ma&apos;lumoti
                    </button>
                    {canManageGroup && (
                      <button onClick={() => { setSettingsOpen(true); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-[9px] px-3 py-2.5 text-body text-brand-900 transition-colors duration-150 active:bg-fill-tertiary">
                        <Settings className="h-4 w-4 text-slate-400" /> Guruh sozlamalari
                      </button>
                    )}
                    {!isOwner && (
                      <button onClick={() => { setLeaveOpen(true); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-[9px] px-3 py-2.5 text-body text-rose-600 transition-colors duration-150 active:bg-rose-50">
                        <LogOut className="h-4 w-4" /> Guruhdan chiqish
                      </button>
                    )}
                  </div>
                </>
              )}
          </div>
        )}
      </div>

      {/* Messages — yuklanishda Telegram uslubidagi bubble skeletonlar */}
      {loading ? (
        <div className="min-h-0 flex-1 overflow-hidden bg-white">
          <MessagesSkeleton />
        </div>
      ) : (
      <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollTop < 60) void loadMore();
          const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
          atBottomRef.current = bottom;
          setAtBottom(bottom);
          if (bottom && newCount) setNewCount(0);
        }}
        className="chat-scroll flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-white px-3 py-4"
      >
        {messages.length === 0 && (
          <ChatEmptyState
            isGroup={isGroup}
            title={conv.title}
            onPick={(text) => setPresetDraft((p) => ({ text, n: (p?.n ?? 0) + 1 }))}
          />
        )}
        {/* mt-auto — kam xabarda suhbat PASTDAN boshlanadi (Telegram) */}
        <div className="mt-auto flex flex-col space-y-1.5">
        {loadingMore && <div className="flex justify-center py-2"><Spinner className="h-4 w-4 animate-spin text-slate-300" /></div>}
        {messages.map((m, i) => {
          const mine = m.sender?.id === me?.id;
          const prev = messages[i - 1];
          const showAvatar = !prev || prev.sender?.id !== m.sender?.id;
          const isLastMine = mine && i === messages.length - 1;
          // Kun almashganda — yopishqoq sana ajratkichi (Telegram naqshi):
          // uzun suhbatda "qachon?" savoli scroll paytida ham javobsiz qolmaydi.
          const showDay = !prev || !sameDay(prev.createdAt, m.createdAt);
          return (
            <Fragment key={m.id}>
              {showDay && <span className="date-chip my-1.5">{dayLabel(m.createdAt)}</span>}
              <MessageBubble
                message={m}
                animate={new Date(m.createdAt).getTime() > openedAt.current}
                mine={mine}
                isGroup={isGroup}
                showAvatar={showAvatar}
                read={isLastMine ? peerRead : undefined}
                onReply={setReplyTo}
                onEdit={setEditing}
              />
            </Fragment>
          );
        })}
        {/* Yozmoqda — yalang'och nuqtalar emas, haqiqiy kiruvchi pufak ichida */}
        {typingUser && (
          <div className="flex items-end gap-2">
            <div className="bubble-in bubble-tail-in msg-pop msg-pop-in relative rounded-[18px] px-3.5 py-2.5">
              {isGroup && (
                <span className="mb-0.5 block text-caption-2 font-semibold text-iris-600">
                  {typingUser}
                </span>
              )}
              <span className="flex items-center gap-1">
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </span>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* "Pastga" — faqat kerak bo'lganda (pastda emassan). Yangi xabar
          kelgan bo'lsa soni bilan: nima o'tkazib yuborilganini aytadi. */}
      {!atBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          aria-label={newCount ? `${newCount} ta yangi xabar — pastga` : 'Pastga'}
          className="jump-btn material-thick tappable-scale absolute bottom-3 right-3 z-20 flex h-11 w-11 items-center justify-center rounded-full text-accent-700 shadow-card-hover ring-1 ring-black/[0.04]"
        >
          <ArrowDown className="h-[19px] w-[19px]" strokeWidth={2.5} />
          {newCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-600 px-1 text-caption-2 font-semibold text-white">
              {newCount > 99 ? '99+' : newCount}
            </span>
          )}
        </button>
      )}
      </div>
      )}

      <Composer
        onSend={handleSend}
        onTyping={emitTyping}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        editing={editing}
        onEditSave={handleEditSave}
        onCancelEdit={() => setEditing(null)}
        blockedMessageTypes={isGroup ? (conv.blockedMessageTypes ?? []) : []}
        canBypassRestrictions={canBypassRestrictions}
        presetDraft={presetDraft}
      />

      {/* Group info */}
      <Modal open={infoOpen} onClose={() => setInfoOpen(false)} title="Guruh ma'lumoti">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-iris-500 text-white">
              {conv.avatarUrl ? <Avatar src={conv.avatarUrl} name={conv.title} size={56} /> : <Hash className="h-6 w-6" />}
            </span>
            <div className="min-w-0">
              <p className="truncate text-title-3 font-bold text-brand-900">{conv.title}</p>
              {conv.username && <p className="text-subhead text-iris-600">@{conv.username}</p>}
              <p className="flex items-center gap-1 text-caption-1 text-slate-500"><Users className="h-3 w-3" /> {conv.participantCount} a&apos;zo</p>
            </div>
          </div>
          {conv.description && <p className="text-subhead leading-relaxed text-slate-600">{conv.description}</p>}
          {(conv.blockedMessageTypes ?? []).length > 0 && (
            <div className="rounded-2xl bg-rose-50 p-3 text-caption-1 text-rose-700">
              Cheklovlar yoqilgan: {(conv.blockedMessageTypes ?? []).map((t) => RESTRICTION_LABEL[t] ?? t).join(', ')}
            </div>
          )}
        </div>
      </Modal>

      {/* Guruh sozlamalari — egasi yoki superadmin */}
      {canManageGroup && (
        <GroupSettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          conversation={conv}
          onUpdated={(c) => setConv(c)}
        />
      )}

      {/* Leave confirm */}
      <Modal open={leaveOpen} onClose={() => !leaving && setLeaveOpen(false)} title="Guruhdan chiqish">
        <div className="space-y-4">
          <p className="text-subhead text-slate-600">
            <span className="font-semibold text-brand-900">{conv.title}</span> guruhidan chiqmoqchimisiz? Keyin uni qidiruvdan qayta topib qo&apos;shilishingiz mumkin.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setLeaveOpen(false)} disabled={leaving} className="rounded-xl px-4 py-2 text-subhead font-semibold text-slate-600 hover:bg-surface-soft">Bekor</button>
            <button onClick={handleLeave} disabled={leaving} className="tappable flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-subhead font-semibold text-white hover:bg-rose-600 disabled:opacity-60">
              {leaving ? <Spinner className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />} Chiqish
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const RESTRICTION_LABEL: Record<string, string> = {
  text: 'Matn', image: 'Rasm', video: 'Video', voice: 'Ovozli xabar', round_video: 'Video xabar',
};
