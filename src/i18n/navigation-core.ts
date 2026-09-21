import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * next-intl navigatsiyasining XOM qatlami. Ilova kodi buni to'g'ridan-to'g'ri
 * import QILMAYDI — `@/i18n/navigation` dan oladi (u yerda `Link` prefetch
 * siyosati bilan o'ralgan). Bu fayl faqat o'sha o'ram va `navigation.ts`
 * uchun: ikkalasi bir-birini import qilsa aylanma bog'liqlik bo'lardi.
 */
export const {
  Link: BaseLink,
  redirect,
  usePathname,
  useRouter,
  getPathname,
} = createNavigation(routing);
