'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/** Logo bo'lmaganda — ism asosidagi barqaror gradient (hech qachon bo'sh ko'rinmaydi). */
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

/**
 * Startap logosi — mahsulot uslubidagi yumaloq-kvadrat (squircle).
 * Rasm bo'lsa ko'rsatadi; rasm yuklanmasa yoki yo'q bo'lsa — gradient + bosh harf.
 * (onError zaxira: buzilgan/yetib bo'lmas URL'da ham bo'sh ko'rinmaydi.)
 */
export function StartupLogo({
  src,
  title,
  size = 48,
  className,
}: {
  src?: string | null;
  title: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const gradient = GRADIENTS[hashString(title || 'startup') % GRADIENTS.length];
  const fontSize = Math.max(13, Math.round(size * 0.42));
  const showImg = !!src && !failed;

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl',
        !showImg && `bg-gradient-to-br ${gradient}`,
        className,
      )}
      style={{ height: size, width: size }}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-black leading-none text-white" style={{ fontSize }}>
          {title?.trim()?.[0]?.toUpperCase() ?? '?'}
        </span>
      )}
    </span>
  );
}
