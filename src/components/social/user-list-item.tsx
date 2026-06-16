'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { FollowButton } from './follow-button';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import type { PublicUserCard } from '@/types';

export function profileHref(u: { username: string | null; id: string }): string {
  return u.username ? `/u/${u.username}` : `/u/${u.id}`;
}

interface Props {
  user: PublicUserCard;
  onClick?: () => void;
  className?: string;
  showFollow?: boolean;
}

export function UserListItem({ user, onClick, className, showFollow = true }: Props) {
  const me = useAuthStore((s) => s.user);
  const href = profileHref(user);
  const isMe = me?.id === user.id;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl p-2.5 hover:bg-surface-soft transition-colors',
        className,
      )}
    >
      <Link href={href} onClick={onClick} className="shrink-0">
        <Avatar src={user.avatarUrl} name={user.fullName} size={46} />
      </Link>
      <Link href={href} onClick={onClick} className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-brand-900">
          {user.fullName}
        </p>
        <p className="truncate text-xs text-slate-500">
          {user.username ? `@${user.username}` : null}
          {user.username && user.headline ? ' · ' : ''}
          {user.headline ?? ''}
        </p>
      </Link>
      {showFollow && !isMe && (
        <FollowButton
          userId={user.id}
          initialFollowing={user.isFollowedByMe}
          size="sm"
        />
      )}
    </div>
  );
}
