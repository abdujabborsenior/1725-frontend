'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { VerifiedBadge } from './verified-badge';
import { cn } from '@/lib/utils';
import type { PublicAuthor } from '@/types';

interface Props {
  author?: PublicAuthor | null;
  size?: number;
  subtitle?: string;
  fallbackName?: string;
  className?: string;
}

/** Avatar + ism — agar username mavjud bo'lsa ommaviy profilga bog'lanadi. */
export function AuthorLink({
  author,
  size = 36,
  subtitle,
  fallbackName = 'Foydalanuvchi',
  className,
}: Props) {
  const name = author?.fullName ?? fallbackName;
  const href = author?.username
    ? `/u/${author.username}`
    : author?.id
      ? `/u/${author.id}`
      : null;

  const inner = (
    <span className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <Avatar src={author?.avatarUrl} name={name} size={size} />
      <span className="min-w-0">
        <span className="flex min-w-0 items-center gap-1">
          <span className="truncate text-subhead font-semibold text-brand-900">{name}</span>
          {author?.isVerified && <VerifiedBadge size={14} />}
        </span>
        {subtitle && <span className="block truncate text-caption-1 text-slate-500">{subtitle}</span>}
      </span>
    </span>
  );

  return href ? (
    <Link href={href} className="group hv-avatar">
      {inner}
    </Link>
  ) : (
    inner
  );
}
