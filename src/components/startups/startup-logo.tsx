'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/** Logo bo'lmaganda — ism asosidagi barqaror iOS system rangi (tekis). */
const TINTS = [
  'bg-[#007AFF]',
  'bg-[#5856D6]',
  'bg-[#34C759]',
  'bg-[#FF9500]',
  'bg-[#FF2D55]',
  'bg-[#AF52DE]',
  'bg-[#30B0C7]',
  'bg-[#A2845E]',
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Startap logosi — mahsulot uslubidagi yumaloq-kvadrat (squircle).
 * Rasm bo'lsa ko'rsatadi; rasm yuklanmasa yoki yo'q bo'lsa — tekis rang + bosh harf.
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
  const tint = TINTS[hashString(title || 'startup') % TINTS.length];
  const fontSize = Math.max(13, Math.round(size * 0.42));
  const showImg = !!src && !failed;

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl',
        !showImg && tint,
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
        <span className="font-semibold leading-none text-white" style={{ fontSize }}>
          {title?.trim()?.[0]?.toUpperCase() ?? '?'}
        </span>
      )}
    </span>
  );
}
