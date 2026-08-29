'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Spinner, Hash } from '@/components/icons';
import { chatApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { PublicGroup } from '@/types';
import toast from 'react-hot-toast';

/**
 * Ommaviy guruh kartasi (home + discover) — iOS uslubi: tinch oq sirt,
 * ilova-ikonkasi ko'rinishidagi kvadrat belgi va App Store'dagi kabi ixcham
 * kapsula tugma. Oxirgi xabar preview ATAYLAB ko'rsatilmaydi (2026-07-10
 * direktiva: bio bilan adashtirardi).
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
    <div className={cn('card-today flex h-full flex-col rounded-ios-2xl bg-white p-5 shadow-card', className)}>
      <div className="flex items-center gap-3">
        {group.avatarUrl ? (
          <Avatar src={group.avatarUrl} name={group.title ?? 'G'} size={48} />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] bg-accent-500 text-white">
            <Hash className="h-[22px] w-[22px]" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-callout font-semibold text-brand-900">{group.title}</h3>
          {group.username && (
            <p className="truncate text-footnote text-accent-700">@{group.username}</p>
          )}
          <p className="flex items-center gap-1 text-footnote text-slate-500">
            <Users className="h-3.5 w-3.5" /> {group.participantCount} a&apos;zo
          </p>
        </div>

        {/* App Store uslubidagi ixcham kapsula tugma */}
        <button
          onClick={handleClick}
          disabled={loading}
          className={cn(
            'tappable flex h-8 shrink-0 items-center justify-center rounded-full px-4 text-footnote font-semibold',
            'transition-[background-color,box-shadow] duration-150 ease-ios',
            isMember
              ? 'bg-fill-tertiary text-accent-700 enabled:hover:bg-fill-secondary'
              : 'bg-accent-600 text-white enabled:hover:bg-accent-700 enabled:hover:shadow-[0_6px_18px_-10px_rgba(0,113,227,0.7)]',
          )}
        >
          {loading ? (
            <Spinner className="h-4 w-4 animate-spin" />
          ) : isMember ? (
            'Ochish'
          ) : (
            "Qo'shilish"
          )}
        </button>
      </div>

      {group.description && (
        <p className="mt-3 line-clamp-2 text-footnote leading-relaxed text-slate-500">
          {group.description}
        </p>
      )}
    </div>
  );
}
