'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Loader2, Hash, MessageCircle } from 'lucide-react';
import { chatApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { PublicGroup } from '@/types';
import toast from 'react-hot-toast';

export function GroupCard({ group, className }: { group: PublicGroup; className?: string }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const isMember = !!group.isMember;

  async function handleClick() {
    if (!token) {
      router.push('/login');
      return;
    }
    // A'zo bo'lsa qayta qo'shilmasdan ochamiz
    if (isMember) {
      router.push(`/messages/${group.id}`);
      return;
    }
    setLoading(true);
    try {
      const conv = await chatApi.joinGroup(group.slug ?? group.id);
      router.push(`/messages/${conv.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'group flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft transition-colors hover:border-iris-200 hover:shadow-card-hover',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {group.avatarUrl ? (
          <Avatar src={group.avatarUrl} name={group.title ?? 'G'} size={48} />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-iris text-white transition-transform group-hover:scale-105">
            <Hash className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-brand-900">{group.title}</h3>
          {group.username && (
            <p className="truncate text-xs font-semibold text-iris-600">@{group.username}</p>
          )}
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <Users className="h-3 w-3" /> {group.participantCount} a&apos;zo
          </p>
        </div>
      </div>

      {group.description && (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600">
          {group.description}
        </p>
      )}

      {group.lastMessagePreview && (
        <p className="mt-3 truncate rounded-xl bg-surface-soft px-3 py-2 text-xs text-slate-500">
          {group.lastMessagePreview}
        </p>
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          'btn-lift mt-4 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-white transition-colors',
          isMember ? 'bg-iris-600 hover:bg-iris-700' : 'bg-brand-900 hover:bg-brand-800',
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isMember ? (
          <>
            <MessageCircle className="h-4 w-4" /> Ochish
          </>
        ) : (
          <>
            Qo&apos;shilish <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </motion.div>
  );
}
