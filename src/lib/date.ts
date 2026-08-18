import {
  format,
  formatDistanceToNow,
  formatDistanceToNowStrict,
  isSameDay,
  isToday,
  isYesterday,
} from 'date-fns';
import { uz } from 'date-fns/locale';

/**
 * Sana/vaqt formatlashning YAGONA joyi.
 *
 * i18n siyosati (§9): interfeys qaysi tilda bo'lsa, HAR BIR yozuv o'sha tilda.
 * date-fns'ni to'g'ridan chaqirish "1 day ago", "about 2 months" kabi inglizcha
 * matn beradi — shuning uchun komponentlar shu yerdagi yordamchilarni ishlatadi.
 * Til qo'shilganda locale shu faylda almashtiriladi (bitta nuqta).
 */
const locale = uz;

/** "3 kun oldin" — taxminiy, qo'shimchali (ro'yxat/izoh vaqtlari). */
export function timeAgo(date: string | number | Date): string {
  return formatDistanceToNow(toDate(date), { addSuffix: true, locale });
}

/** "3 kun" — qat'iy va qisqa (chat ro'yxatidagi kabi tor joylar uchun). */
export function timeAgoShort(date: string | number | Date): string {
  return formatDistanceToNowStrict(toDate(date), { locale });
}

/** Sana — "12-avgust, 2026" uslubida (profil "qo'shilgan sana" va h.k.). */
export function formatDate(date: string | number | Date, pattern = 'd MMMM, yyyy'): string {
  return format(toDate(date), pattern, { locale });
}

/** Soat — "14:05" (chat pufaklari). */
export function formatTime(date: string | number | Date): string {
  return format(toDate(date), 'HH:mm', { locale });
}

function toDate(date: string | number | Date): Date {
  return date instanceof Date ? date : new Date(date);
}

/**
 * Chat sana ajratkichi uchun yorliq: "Bugun" / "Kecha" / "12-avgust" /
 * "12-avgust, 2025" (o'tgan yil bo'lsa yil ham qo'shiladi).
 */
export function dayLabel(date: string | number | Date): string {
  const d = toDate(date);
  if (isToday(d)) return 'Bugun';
  if (isYesterday(d)) return 'Kecha';
  const sameYear = d.getFullYear() === new Date().getFullYear();
  // O'zbek imlosida oy nomi kichik harf bilan yoziladi ("13-iyun"),
  // date-fns esa locale'dan bosh harfli qaytaradi.
  return format(d, sameYear ? 'd-MMMM' : 'd-MMMM, yyyy', { locale }).toLowerCase();
}

/** Ikki vaqt bir kunda bo'lsa — true (sana ajratkichini qo'yish qarori). */
export function sameDay(a: string | number | Date, b: string | number | Date): boolean {
  return isSameDay(toDate(a), toDate(b));
}
