'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/* iOS system ranglari — TEKIS (gradientsiz), Kontaktlar/Xabarlar ilovasidagidek. */
const TINTS = [
  'bg-[#007AFF]', // systemBlue
  'bg-[#5856D6]', // systemIndigo
  'bg-[#34C759]', // systemGreen
  'bg-[#FF9500]', // systemOrange
  'bg-[#FF2D55]', // systemPink
  'bg-[#AF52DE]', // systemPurple
  'bg-[#30B0C7]', // systemTeal
  'bg-[#A2845E]', // systemBrown
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
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [src]);
  const seed = name || 'user';
  const tint = TINTS[hashString(seed) % TINTS.length];
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
          tint,
        )}
      >
        {/* Rasm yuklanguncha rangli fon + initsiallar turadi (Telegram uslubi) */}
        {(!showImg || !loaded) && (
          <span className="font-medium tracking-tight text-white" style={{ fontSize }}>
            {initials(name ?? '')}
          </span>
        )}
        {showImg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src as string}
            alt={name ?? ''}
            width={size}
            height={size}
            ref={(el) => {
              // Keshdagi rasmda onLoad hidratsiyadan oldin otilib ketishi mumkin
              if (el?.complete && el.naturalWidth > 0) setLoaded(true);
            }}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-200',
              loaded ? 'opacity-100' : 'opacity-0',
            )}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )}
      </span>
    </span>
  );
}
