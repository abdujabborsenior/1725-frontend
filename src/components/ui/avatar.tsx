'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const GRADIENTS = [
  'from-emerald-400 to-teal-500',
  'from-indigo-400 to-violet-500',
  'from-sky-400 to-blue-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-fuchsia-400 to-purple-500',
  'from-cyan-400 to-emerald-500',
  'from-violet-400 to-indigo-500',
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  /** Diametr (px) */
  size?: number;
  online?: boolean;
  /** Tashqi halqa (story-style) */
  ring?: boolean;
  className?: string;
}

export function Avatar({
  src,
  name = '',
  size = 40,
  online,
  ring,
  className,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const seed = name || 'user';
  const gradient = GRADIENTS[hashString(seed) % GRADIENTS.length];
  const fontSize = Math.max(10, Math.round(size * 0.4));
  const showImg = !!src && !failed;

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full',
        online && 'ring-online',
        ring && 'p-[2px] bg-gradient-to-br from-accent-400 to-iris-500',
        className,
      )}
      style={{ height: size, width: size }}
    >
      <span
        className={cn(
          'relative flex h-full w-full items-center justify-center overflow-hidden rounded-full',
          ring && 'ring-2 ring-white',
          !showImg && `bg-gradient-to-br ${gradient}`,
        )}
      >
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src as string}
            alt={name ?? ''}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="font-bold text-white" style={{ fontSize }}>
            {initials(name ?? '')}
          </span>
        )}
      </span>
    </span>
  );
}
