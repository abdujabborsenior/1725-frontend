'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { consumeNext } from '@/components/auth/next-capture';
import { navigateAfterAuthChange } from '@/lib/auth-navigation';

/**
 * Login/Register sahifalari uchun: foydalanuvchi ALLAQACHON kirgan bo'lsa
 * (localStorage'da sessiya bor), unga qayta ro'yxatdan o'tish/kirish formasi
 * ko'rsatilmaydi — maqsad sahifasiga (?next=) yoki bosh sahifaga qaytariladi.
 * Middleware buni faqat amaldagi cookie bilan qiladi; bu komponent cookie
 * eskirgan/yo'qolgan holatni yopadi (hydrate() cookie'ni allaqachon tiklagan
 * bo'ladi, shuning uchun redirect'dan keyin protected sahifa ochiladi).
 *
 * Faqat hydration paytidagi holatga qaraydi — sahifadagi keyingi harakatlar
 * (masalan login formasi o'z push'i) bilan RAQOBATLASHMAYDI.
 */
export function AuthedRedirect() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const done = useRef(false);

  useEffect(() => {
    if (!hasHydrated || done.current) return;
    done.current = true;
    if (useAuthStore.getState().token) {
      // To'liq yuklash bilan (`navigateAfterAuthChange`) — chunki bu yerga
      // tushishning O'ZI ko'pincha mehmon davrida keshlangan redirect
      // sababli bo'ladi. Soft `router.replace` ishlatilsa maqsad sahifasi
      // ham o'sha keshdan redirect qaytarib, ping-pong hosil bo'lardi.
      navigateAfterAuthChange(consumeNext() ?? '/');
    }
  }, [hasHydrated]);

  return null;
}
