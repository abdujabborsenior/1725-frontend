'use client';

import { useAuthStore } from '@/store/auth.store';

/**
 * SSR (ISR) ma'lumotini React Query'ga "urug'" qilib berish — YAGONA qoida
 * (2026-09-21, 1M bir vaqtdagi foydalanuvchi miqyosi).
 *
 * Muammo (prod'da o'lchandi): ilgari har ro'yxat `initialDataUpdatedAt: 0`
 * bilan SSR ma'lumotini darhol "eskirgan" deb belgilardi — natijada MEHMON ham
 * har sahifa ochilishida o'sha ro'yxatni API'dan QAYTA so'rardi. Ya'ni HTML
 * allaqachon keshdan (ISR) kelgan bo'lsa ham, har ko'rish backend'ga bitta
 * to'liq so'rov bo'lardi: 1M mehmon = 1M keraksiz API chaqiruvi.
 *
 * Qoida:
 *  · `personal: true` — javobda SHAXSIY maydonlar bor (`likedByMe`,
 *    `bookmarkedByMe`, `votedOptionId`, `isFollowedByMe`...). Mehmonda ular
 *    baribir bo'sh → SSR ma'lumoti yakuniy, API'ga so'rov YO'Q. Kirgan
 *    foydalanuvchida esa auth tiklanishi bilan jimgina bitta yangilash
 *    (shaxsiy belgilar to'g'ri ko'rinsin).
 *  · `personal: false` — ommaviy ma'lumot: hech kimda qayta so'ralmaydi
 *    (ISR yoshi — 30–60 s — yetarli).
 *
 * SSR xato bergan bo'lsa (`initial` = null) — oddiy client fetch (fail-open).
 * Filtr/sahifa o'zgarganda chaqiruvchi `initial` o'rniga `undefined` beradi —
 * o'sha kalit uchun odatdagidek so'raladi.
 *
 * ⚠️ DETAL sahifalarida ishlatilmaydi: u yerda client so'rovi ko'rishlar
 * sonini ham hisoblaydi (`ViewsService`) — mehmon ko'rishlari yo'qolardi.
 */
export function useSsrSeed<T>(
  initial: T | null | undefined,
  { personal }: { personal: boolean },
): { initialData?: T; initialDataUpdatedAt?: number; enabled?: boolean } {
  const token = useAuthStore((s) => s.token);
  if (initial == null) return {};
  if (!personal) return { initialData: initial };
  // `enabled` auth tiklangach (hydrate) yoqiladi — updatedAt 0 bo'lgani uchun
  // shu zahoti bitta yangilash ketadi; mehmonda umuman ketmaydi.
  return { initialData: initial, initialDataUpdatedAt: 0, enabled: !!token };
}
