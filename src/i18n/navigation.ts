import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Tilni biladigan navigatsiya — `next/link` va `next/navigation` O'RNIGA
 * ilova bo'ylab FAQAT shular ishlatiladi:
 *  · `Link` / `useRouter().push('/startups')` — joriy til prefiksini o'zi
 *    qo'shadi (ruscha sahifada → `/ru/startups`);
 *  · `usePathname()` — prefikssiz yo'l qaytaradi (`/startups`), shuning uchun
 *    faol menyu bandi va marshrut tekshiruvlari har tilda bir xil ishlaydi.
 *
 * `useSearchParams`, `useParams`, `notFound` — `next/navigation` dan (tilga
 * bog'liq emas).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
