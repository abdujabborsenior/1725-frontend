'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MessageSquarePlus, Hash, Users, UsersRound, ArrowLeft } from 'lucide-react';
import { chatApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { CreateGroupModal } from './create-group-modal';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';

export function ConversationList({ activeId }: { activeId?: string }) {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const qc = useQueryClient();
  const [groupModal, setGroupModal] = useState(false);
  const isSuperadmin = user?.role === 'superadmin';

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

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/')}
            aria-label="Ortga"
            title="Ortga"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-black text-brand-900">Suhbatlar</h2>
        </div>
        <div className="flex items-center gap-1">
          {isSuperadmin && (
            <button onClick={() => setGroupModal(true)} aria-label="Guruh yaratish" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-iris-600">
              <UsersRound className="h-5 w-5" />
            </button>
          )}
          <Link href="/discover" aria-label="Yangi suhbat" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-brand-900">
            <MessageSquarePlus className="h-5 w-5" />
          </Link>
        </div>
      </div>
      {isSuperadmin && <CreateGroupModal open={groupModal} onClose={() => setGroupModal(false)} />}

      <div className="chat-scroll flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
        ) : conversations && conversations.length > 0 ? (
          conversations.map((c) => {
            const active = c.id === activeId;
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className={cn(
                  'flex items-center gap-3 rounded-2xl p-2.5 transition-colors',
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
                      <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-accent-500 px-1.5 text-[10px] font-bold text-white">
                        {c.unreadCount > 99 ? '99+' : c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="px-4 py-16 text-center">
            <MessageSquarePlus className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm font-semibold text-brand-900">Hali suhbatlar yo‘q</p>
            <p className="mt-1 text-xs text-slate-500">Hamjamiyatdan odam toping va suhbat boshlang.</p>
            <Link href="/discover" className="mt-3 inline-block text-xs font-semibold text-accent-700 hover:underline">Odamlarni topish →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
