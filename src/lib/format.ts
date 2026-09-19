import { useCallback } from 'react';
import { useLocale } from 'next-intl';
import type { AppLocale } from '@/i18n/routing';

/**
 * Sonlarni formatlash — DETERMINISTIK (qo'lda).
 *
 * `toLocaleString`/`Intl.NumberFormat` natijasi muhitga bog'liq: Node (SSR) va
 * brauzer ICU versiyalari ajratkichni turlicha berishi mumkin (oddiy bo'shliq,
 * U+00A0 yoki U+202F) — hidratsiya matni farqlanib, raqam "sakraydi". Shuning
 * uchun ajratkich shu yerda qat'iy:
 *   uz, ru → 1 234 567 (bo'linmas bo'shliq U+00A0 — raqam qatorga bo'linmaydi)
 *   en     → 1,234,567
 */
const GROUP: Record<AppLocale, string> = { uz: ' ', ru: ' ', en: ',' };

export function formatNumber(value: number, locale: AppLocale): string {
  if (!Number.isFinite(value)) return '—';
  const sign = value < 0 ? '-' : '';
  const int = String(Math.trunc(Math.abs(value)));
  return sign + int.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP[locale]);
}

/** Client komponentlar uchun (server'da `formatNumber(n, locale)`): joriy tilga bog'langan `fmt(1234)` → "1 234". */
export function useFormatNumber(): (value: number) => string {
  const locale = useLocale() as AppLocale;
  return useCallback((value: number) => formatNumber(value, locale), [locale]);
}
