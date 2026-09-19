import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Sana/vaqt formatlashning YAGONA joyi (§8 charter, i18n).
 *
 * Nega `date-fns` locale'lari emas: uch tilning locale obyektlari har
 * sahifaning JS'iga ~9 KB qo'shardi. Matnlar allaqachon lug'atda
 * (`time` nomlar maydoni, ICU plural bilan — rus tilidagi "1 минуту /
 * 3 минуты / 5 минут" to'g'ri) — formatlovchi shu lug'atdan quriladi.
 *
 * VAQT MINTAQASI — qat'iy Toshkent (UTC+5, 1992-yildan beri yozgi vaqt yo'q):
 * server (UTC, Docker) va brauzer AYNAN bir xil sanani chiqaradi. Aks holda
 * 21:00 UTC dagi yozuv serverda "12-avgust", brauzerda "13-avgust" bo'lib,
 * hidratsiya xatosi va matn "sakrashi" bo'lardi.
 */
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

type DateInput = string | number | Date;

/** `t` — `useTranslations('time')` yoki `getTranslations('time')` natijasi. */
export interface TimeTranslator {
  (key: string, values?: Record<string, string | number>): string;
}

export interface DateFormatter {
  /** "3 daqiqa oldin" · "3 минуты назад" · "3 minutes ago" */
  timeAgo(date: DateInput): string;
  /** "3 kun" · "3 дн." · "3 d" — tor joylar (chat ro'yxati) */
  timeAgoShort(date: DateInput): string;
  /** "12-avgust, 2026" · "12 августа 2026" · "August 12, 2026" */
  formatDate(date: DateInput, options?: { year?: boolean }): string;
  /** "Avgust, 2026" · "август 2026" (ru: `genitive` → "августа 2026") · "August 2026" */
  formatMonthYear(date: DateInput, options?: { genitive?: boolean }): string;
  /** "14:05" — 24 soatlik */
  formatTime(date: DateInput): string;
  /** Chat ajratkichi: "Bugun" / "Kecha" / "13-iyun" / "13-iyun, 2025" */
  dayLabel(date: DateInput): string;
}

function toDate(date: DateInput): Date {
  return date instanceof Date ? date : new Date(date);
}

/** Toshkent devor-soati komponentlari (UTC getter'lari orqali — muhitdan mustaqil). */
function wall(date: DateInput) {
  const d = new Date(toDate(date).getTime() + TASHKENT_OFFSET_MS);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hours: d.getUTCHours(),
    minutes: d.getUTCMinutes(),
  };
}

/** Ikki vaqt Toshkent bo'yicha bitta kunda bo'lsa — true (sana ajratkichi qarori). */
export function sameDay(a: DateInput, b: DateInput): boolean {
  const x = wall(a);
  const y = wall(b);
  return x.year === y.year && x.month === y.month && x.day === y.day;
}

const pad = (n: number) => String(n).padStart(2, '0');

function upperFirst(s: string): string {
  return s ? s.charAt(0).toLocaleUpperCase() + s.slice(1) : s;
}

export function createDateFormatter(t: TimeTranslator): DateFormatter {
  function elapsed(date: DateInput) {
    const seconds = Math.max(0, Math.round((Date.now() - toDate(date).getTime()) / 1000));
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30.4375);
    const years = Math.round(days / 365.25);
    return { seconds, minutes, hours, days, months, years };
  }

  function unit(date: DateInput): { key: 'minutes' | 'hours' | 'days' | 'months' | 'years'; count: number } | null {
    const e = elapsed(date);
    if (e.seconds < 45) return null;
    if (e.minutes < 60) return { key: 'minutes', count: Math.max(1, e.minutes) };
    if (e.hours < 24) return { key: 'hours', count: e.hours };
    if (e.days < 30) return { key: 'days', count: e.days };
    if (e.months < 12) return { key: 'months', count: Math.max(1, e.months) };
    return { key: 'years', count: Math.max(1, e.years) };
  }

  const month = (m: number) => t('monthOf', { month: String(m) });

  return {
    timeAgo(date) {
      const u = unit(date);
      return u ? t(`ago.${u.key}`, { count: u.count }) : t('justNow');
    },
    timeAgoShort(date) {
      const u = unit(date);
      return u ? t(`short.${u.key}`, { count: u.count }) : t('short.now');
    },
    formatDate(date, options) {
      const w = wall(date);
      const withYear = options?.year ?? true;
      return withYear
        ? t('date', { day: w.day, month: month(w.month), year: w.year })
        : t('dateNoYear', { day: w.day, month: month(w.month) });
    },
    formatMonthYear(date, options) {
      const w = wall(date);
      const name = options?.genitive
        ? t('monthOf', { month: String(w.month) })
        : upperFirst(t('month', { month: String(w.month) }));
      return t('monthYear', { month: name, year: w.year });
    },
    formatTime(date) {
      const w = wall(date);
      return `${pad(w.hours)}:${pad(w.minutes)}`;
    },
    dayLabel(date) {
      const now = Date.now();
      if (sameDay(date, now)) return t('today');
      if (sameDay(date, now - 24 * 60 * 60 * 1000)) return t('yesterday');
      const w = wall(date);
      const sameYear = w.year === wall(now).year;
      return sameYear
        ? t('dateNoYear', { day: w.day, month: month(w.month) })
        : t('date', { day: w.day, month: month(w.month), year: w.year });
    },
  };
}

/** Client komponentlar: `const fmt = useDateFormat(); fmt.timeAgo(x)`. */
export function useDateFormat(): DateFormatter {
  const t = useTranslations('time');
  return useMemo(() => createDateFormatter(t as unknown as TimeTranslator), [t]);
}
