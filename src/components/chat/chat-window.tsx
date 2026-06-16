'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Users, Hash } from 'lucide-react';
import { chatApi, type SendMessagePayload } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { MessageBubble } from './message-bubble';
import { Composer } from './composer';
import { profileHref } from '@/components/social/user-list-item';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { ChatMessage, Conversation } from '@/types';

let cidCounter = 0;
const newClientId = () => `c${Date.now()}_${++cidCounter}`;

export function ChatWindow({ conversationId }: { conversationId: string }) {
  const me = useAuthStore((s) => s.user);
  const router = useRouter();
  const qc = useQueryClient();

  const [conv, setConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [online, setOnline] = useState(false);
  const [peerRead, setPeerRead] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback((smooth = false) => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    });
  }, []);

  const markRead = useCallback(() => {
    chatApi.read(conversationId).catch(() => undefined);
    getSocket().emit('message:read', { conversationId });
    void qc.invalidateQueries({ queryKey: ['chat-unread'] });
    void qc.invalidateQueries({ queryKey: ['chat-conversations'] });
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
      if (msg.sender?.id !== me?.id) { markRead(); setPeerRead(false); }
      scrollToBottom(true);
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

    socket.on('message:new', onNew);
    socket.on('typing', onTyping);
    socket.on('presence', onPresence);
    socket.on('message:read', onRead);
    return () => {
      socket.off('message:new', onNew);
      socket.off('typing', onTyping);
      socket.off('presence', onPresence);
      socket.off('message:read', onRead);
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

  function emitTyping() {
    getSocket().emit('typing', { conversationId, typing: true });
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>;
  }
  if (!conv) {
    return <div className="flex h-full items-center justify-center text-sm text-slate-500">Suhbat topilmadi</div>;
  }

  const isGroup = conv.type === 'group';
  const headerHref = conv.otherUser ? profileHref(conv.otherUser) : '#';

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white/90 px-3 py-2.5 backdrop-blur">
        <button
          onClick={() => router.push('/messages')}
          aria-label="Ortga"
          title="Ortga"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {isGroup ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-iris text-white">
            {conv.avatarUrl ? <Avatar src={conv.avatarUrl} name={conv.title} size={40} /> : <Hash className="h-5 w-5" />}
          </span>
        ) : (
          <Link href={headerHref}><Avatar src={conv.avatarUrl} name={conv.title} size={40} online={online} /></Link>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-brand-900">{conv.title}</p>
          <p className="truncate text-xs text-slate-500">
            {typingUser ? <span className="text-accent-600">yozmoqda…</span>
              : isGroup ? <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {conv.participantCount} a&apos;zo</span>
              : online ? <span className="text-accent-600">onlayn</span>
              : conv.otherUser?.lastSeenAt ? `oxirgi faollik ${formatDistanceToNow(new Date(conv.otherUser.lastSeenAt), { addSuffix: true })}` : ''}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={(e) => { if (e.currentTarget.scrollTop < 60) void loadMore(); }}
        className="chat-scroll flex-1 space-y-1.5 overflow-y-auto bg-surface-soft px-3 py-4"
      >
        {loadingMore && <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin text-slate-300" /></div>}
        {messages.map((m, i) => {
          const mine = m.sender?.id === me?.id;
          const prev = messages[i - 1];
          const showAvatar = !prev || prev.sender?.id !== m.sender?.id;
          const isLastMine = mine && i === messages.length - 1;
          return (
            <MessageBubble
              key={m.id}
              message={m}
              mine={mine}
              isGroup={isGroup}
              showAvatar={showAvatar}
              read={isLastMine ? peerRead : undefined}
              onReply={setReplyTo}
            />
          );
        })}
        {typingUser && (
          <div className="flex items-center gap-1 pl-2">
            <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
          </div>
        )}
      </div>

      <Composer onSend={handleSend} onTyping={emitTyping} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
    </div>
  );
}
