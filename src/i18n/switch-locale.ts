'use client';

import type { AppLocale } from './routing';
import { LOCALE_COOKIE, LOCALE_SUGGEST_DISMISSED, localizePath } from './locales';

/**
 * Tilni almashtirish — foydalanuvchining ANIQ tanlovi.
 *
 * 1) Tanlov cookie'ga yoziladi (1 yil): keyingi safar `mymarkaz.uz` ochilsa,
 *    bosh sahifa shu tilda kutib oladi (middleware).
 * 2) Joriy sahifaning o'zi (yo'l + so'rov + #) tanlangan tilda TO'LIQ
 *    yuklanadi. Nega SPA navigatsiya emas: React Query keshida oldingi tilda
 *    olingan matnlar (kategoriya nomlari, bildirishnomalar) qolib ketardi —
 *    to'liq yuklash barcha holatni bitta qoida bilan yangilaydi. Til kamdan-kam
 *    almashtiriladi, narxi — bitta yuklanish.
 */
export function rememberLocale(locale: AppLocale): void {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax${secure}`;
  try {
    // Tanlov qilindi — taklif bandi endi kerak emas
    localStorage.setItem(LOCALE_SUGGEST_DISMISSED, locale);
  } catch {
    /* xotira yopiq — muhim emas */
  }
}

export function switchLocale(locale: AppLocale, pathname: string): void {
  rememberLocale(locale);
  const { search, hash } = window.location;
  window.location.assign(`${localizePath(locale, pathname)}${search}${hash}`);
}
