'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/* iOS system ranglari — TEKIS (gradientsiz), Kontaktlar/Xabarlar ilovasidagidek.
   MUHIM: bu yerda system ranglarning YORQIN (500) darajasi emas, palitraning
   AA-xavfsiz darajasi ishlatiladi. Sabab o'lchov bilan aniqlandi: oq
   initsiallar #34C759 (yashil) ustida 2.2:1, #FF9500 (to'q sariq) ustida
   2.2:1 chiqardi — ya'ni suhbatni kim bilan olib borayotganingizni
   bildiruvchi harflar amalda o'qilmasdi. Hozirgi to'plamda eng pasti 4.5:1. */
const TINTS = [
  'bg-[#0071E3]', // systemBlue   4.70:1
  'bg-[#4B49C4]', // systemIndigo 6.89:1
  'bg-[#1D7333]', // systemGreen  5.91:1
  'bg-[#A85E00]', // systemOrange 4.92:1
  'bg-[#E5271B]', // systemRed    4.53:1
  'bg-[#8331AC]', // systemPurple 7.00:1
  'bg-[#1B7B8D]', // systemTeal   4.92:1
  'bg-[#7F6545]', // systemBrown  5.45:1
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
  className?: string;
}

export function Avatar({
  src,
  name = '',
  size = 40,
  online,
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
        className,
      )}
      style={{ height: size, width: size }}
    >
      <span
        className={cn(
          'relative flex h-full w-full items-center justify-center overflow-hidden rounded-full',
          tint,
        )}
      >
        {/* Rasm yuklanguncha rangli fon + initsiallar turadi (Telegram uslubi) */}
        {(!showImg || !loaded) && (
          <span className="font-semibold tracking-tight text-white" style={{ fontSize }}>
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
