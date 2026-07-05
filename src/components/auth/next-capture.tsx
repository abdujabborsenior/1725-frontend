'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * `?next=` parametrini sessionStorage'ga saqlaydi. Auth oqimining istalgan
 * sahifasida (login, register va variantlari, verify-email) ishlaydi —
 * ro'yxatdan o'tish/kirish tugagach foydalanuvchi AYNAN maqsad sahifasiga
 * qaytadi (masalan, startap joylash yoki yechim berish).
 */
export function NextCapture() {
  const pathname = usePathname();

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get('next');
    if (next && next.startsWith('/')) sessionStorage.setItem('sh_next', next);
  }, [pathname]);

  return null;
}

/** Saqlangan maqsad manzilini olib (bir martalik) tozalaydi. */
export function consumeNext(): string | null {
  const next = sessionStorage.getItem('sh_next');
  sessionStorage.removeItem('sh_next');
  return next && next.startsWith('/') ? next : null;
}
