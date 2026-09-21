/**
 * Tilni biladigan navigatsiya — `next/link` va `next/navigation` O'RNIGA
 * ilova bo'ylab FAQAT shular ishlatiladi:
 *  · `Link` / `useRouter().push('/startups')` — joriy til prefiksini o'zi
 *    qo'shadi (ruscha sahifada → `/ru/startups`);
 *  · `usePathname()` — prefikssiz yo'l qaytaradi (`/startups`), shuning uchun
 *    faol menyu bandi va marshrut tekshiruvlari har tilda bir xil ishlaydi.
 *
 * `Link` — NIYAT bo'yicha prefetch qiluvchi o'ram (`intent-link.tsx`):
 * ko'rinishdagi hamma havolani oldindan yuklamaydi (server yuki, 1M miqyos).
 *
 * `useSearchParams`, `useParams`, `notFound` — `next/navigation` dan (tilga
 * bog'liq emas).
 */
export { redirect, usePathname, useRouter, getPathname } from './navigation-core';
export { Link } from './intent-link';
