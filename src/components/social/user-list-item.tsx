'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { FollowButton } from './follow-button';
import { FounderBadge } from './founder-badge';
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
        'ios-row',
        className,
      )}
    >
      <Link href={href} onClick={onClick} className="shrink-0 transition-opacity hover:opacity-80">
        <Avatar src={user.avatarUrl} name={user.fullName} size={44} />
      </Link>
      <Link href={href} onClick={onClick} className="group/name min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-body text-brand-900">
          <span className="truncate transition-colors group-hover/name:text-accent-700">{user.fullName}</span>
          {user.isFounder && <FounderBadge size="xs" className="shrink-0" />}
        </p>
        <p className="truncate text-footnote text-slate-500">
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
