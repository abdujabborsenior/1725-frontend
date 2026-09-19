'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Close, Language } from '@/components/icons';
import { usePathname } from '@/i18n/navigation';
import {
  LOCALE_COOKIE,
  LOCALE_META,
  LOCALE_SUGGEST_DISMISSED,
  isAppLocale,
} from '@/i18n/locales';
import type { AppLocale } from '@/i18n/routing';
import { switchLocale } from '@/i18n/switch-locale';

/** Foydalanuvchi aniq tanlagan til (cookie) — bo'lmasa brauzer tili. */
function preferredLocale(): AppLocale | null {
  const saved = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${LOCALE_COOKIE}=`))
    ?.split('=')[1];
  if (isAppLocale(saved)) return saved;

  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.toLowerCase().split('-')[0];
    if (isAppLocale(base)) return base;
  }
  return null;
}

/** Diqqatni talab qiladigan ekranlar — bu yerda bant chiqmaydi. */
const QUIET_PATHS = ['/messages', '/ai'];

/**
 * **Til taklifi** — Google tavsiyasi bo'yicha AVTOMATIK REDIRECT o'rniga.
 *
 * Sahifa tili foydalanuvchi tanlagan (yoki brauzeri so'ragan) tildan farq
 * qilsa, pastda nozik band chiqadi — O'SHA TILDA: "Открыть на русском?".
 * Yopilsa — shu taklif qayta ko'rsatilmaydi. Hech narsa majburlanmaydi va
 * qidiruv botlariga ta'sir yo'q (ular JavaScript taklifini "bosmaydi").
 *
 * Performance: 1.2 s kechikish bilan (LCP bilan talashmaydi), `fixed` —
 * maketni surmaydi (CLS 0).
 */
export function LanguageSuggest() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const [suggested, setSuggested] = useState<AppLocale | null>(null);

  useEffect(() => {
    if (QUIET_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      setSuggested(null);
      return;
    }
    const timer = window.setTimeout(() => {
      try {
        const preferred = preferredLocale();
        if (!preferred || preferred === locale) return;
        if (localStorage.getItem(LOCALE_SUGGEST_DISMISSED) === preferred) return;
        setSuggested(preferred);
      } catch {
        /* xotira/cookie yopiq — taklif shart emas */
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [locale, pathname]);

  if (!suggested) return null;
  const meta = LOCALE_META[suggested];

  function dismiss() {
    try {
      localStorage.setItem(LOCALE_SUGGEST_DISMISSED, suggested!);
    } catch {
      /* muhim emas */
    }
    setSuggested(null);
  }

  return (
    <aside
      lang={suggested}
      aria-live="polite"
      // Mobilda TEPADA (navbar ostida) — pastdagi kamera/mikrofon taklifi va
      // tab bar bilan ustma-ust tushmaydi; desktopda chap pastda (taklif o'ngda).
      className="fixed inset-x-4 top-[calc(env(safe-area-inset-top)+3.75rem)] z-50 mx-auto flex max-w-md animate-slide-down items-center gap-3 rounded-ios-xl bg-white/[0.97] p-3 pl-4 shadow-modal ring-1 ring-black/[0.06] md:bottom-6 md:left-6 md:right-auto md:top-auto md:mx-0 md:animate-slide-up"
    >
      <Language aria-hidden className="h-[22px] w-[22px] shrink-0 text-accent-600" />
      <p className="min-w-0 flex-1 text-subhead font-medium text-brand-900">{meta.suggest.text}</p>
      <button
        type="button"
        onClick={() => switchLocale(suggested, pathname)}
        className="tappable shrink-0 rounded-full bg-accent-600 px-3.5 py-2 text-subhead font-semibold text-white active:bg-accent-700"
      >
        {meta.suggest.action}
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label={meta.suggest.dismiss}
        className="tappable hv-pop flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500"
      >
        <Close aria-hidden className="h-5 w-5" />
      </button>
    </aside>
  );
}
