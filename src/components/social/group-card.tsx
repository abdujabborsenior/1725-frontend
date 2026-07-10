'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ArrowRight, Loader2, Hash, MessageCircle } from 'lucide-react';
import { chatApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { PublicGroup } from '@/types';
import toast from 'react-hot-toast';

/**
 * Ommaviy guruh kartasi (home + discover) — shaffof havo-rang sirt, atrofga
 * yoyiluvchi yumshoq sky nur. Oxirgi xabar preview ATAYLAB ko'rsatilmaydi
 * (2026-07-10 direktiva: bio bilan adashtirardi); tugma har doim kartaning
 * pastida bir tekis turadi (mt-auto) — kontent uzunligiga bog'lanmaydi.
 */
export function GroupCard({ group, className }: { group: PublicGroup; className?: string }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const isMember = !!group.isMember;

  async function handleClick() {
    if (!token) {
      router.push('/register?next=%2Fdiscover');
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
    <div
      className={cn(
        'group flex h-full flex-col rounded-3xl border border-sky-200/70 bg-sky-50/60 p-5 backdrop-blur-sm shadow-glow-sky transition-all duration-200 hover:-translate-y-[3px] hover:border-sky-300/70 hover:shadow-glow-sky-lg',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {group.avatarUrl ? (
          <Avatar src={group.avatarUrl} name={group.title ?? 'G'} size={48} />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-soft transition-transform group-hover:scale-105">
            <Hash className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-brand-900">{group.title}</h3>
          {group.username && (
            <p className="truncate text-xs font-semibold text-sky-700">@{group.username}</p>
          )}
          <p className="flex items-center gap-1 text-xs text-slate-600">
            <Users className="h-3 w-3" /> {group.participantCount} a&apos;zo
          </p>
        </div>
      </div>

      {group.description && (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600">
          {group.description}
        </p>
      )}

      {/* Tugma — doim pastda, barcha kartalarda bir chiziqda */}
      <div className="mt-auto pt-4">
        <button
          onClick={handleClick}
          disabled={loading}
          className={cn(
            'btn-lift inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-white transition-colors',
            isMember ? 'bg-sky-600 hover:bg-sky-700' : 'bg-brand-900 hover:bg-brand-800',
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
      </div>
    </div>
  );
}
