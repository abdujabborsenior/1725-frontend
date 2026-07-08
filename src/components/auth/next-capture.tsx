'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * `?next=` parametrini sessionStorage'ga saqlaydi. Auth oqimining istalgan
 * sahifasida (login, register va variantlari, verify-email) ishlaydi —
 * ro'yxatdan o'tish/kirish tugagach foydalanuvchi AYNAN maqsad sahifasiga
 * qaytadi (masalan, startap joylash yoki yechim berish).
 */
/**
 * Faqat XAVFSIZ ichki yo'l — open-redirect'ni to'sadi. `/`bilan boshlanishi
 * yetarli emas: `//evil.com` va `/\evil.com` brauzerда tashqi saytga
 * (protocol-relative) yo'naltiriladi. Shuning uchun bitta `/` + harf/raqam
 * talab qilinadi (ikkinchi belgi `/` yoki `\` bo'lmasin).
 */
function safeInternalPath(next: string | null): string | null {
  if (!next) return null;
  if (next[0] !== '/') return null;
  if (next[1] === '/' || next[1] === '\\') return null;
  return next;
}

export function NextCapture() {
  const pathname = usePathname();

  useEffect(() => {
    const next = safeInternalPath(
      new URLSearchParams(window.location.search).get('next'),
    );
    if (next) sessionStorage.setItem('sh_next', next);
  }, [pathname]);

  return null;
}

/** Saqlangan maqsad manzilini olib (bir martalik) tozalaydi. */
export function consumeNext(): string | null {
  const next = sessionStorage.getItem('sh_next');
  sessionStorage.removeItem('sh_next');
  return safeInternalPath(next);
}
