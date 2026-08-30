'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { startupsApi } from '@/lib/api';
import type { LinkMetadata, PlatformType } from '@/types';
import { PLATFORM_ORDER } from '@/lib/constants';
import { normalizeUrl, type LinkValues } from './link-fields';

/** Qaysi qatorda nima bo'layotgani — LinkFields shu bo'yicha belgi ko'rsatadi. */
export type AutofillState =
  | { status: 'loading'; type: PlatformType }
  | { status: 'done'; type: PlatformType; filled: FilledField[] }
  | { status: 'empty'; type: PlatformType }
  | null;

export type FilledField = 'logo' | 'cover' | 'title' | 'tagline' | 'description';

/** Avtomatik to'ldirish nimani o'zgartirishi mumkinligi (bo'sh maydonlar). */
export interface AutofillTargets {
  logo: string | null;
  cover: string | null;
  title: string;
  tagline: string;
  description: string;
}

export interface AutofillHandlers {
  setLogo: (url: string) => void;
  setCover: (url: string) => void;
  setTitle: (value: string) => void;
  setTagline: (value: string) => void;
  setDescription: (value: string) => void;
}

/** Havola yozib bo'lingunicha kutish — har harfda so'rov yuborilmasin. */
const DEBOUNCE_MS = 900;

/**
 * So'ralgan havolalar — MODUL darajasida (komponent emas).
 *
 * Nega: React Strict Mode dev'da effektni ikki marta ishga tushiradi va
 * komponent ichidagi `ref` ikkinchi mount'da yangidan yaratiladi — natijada
 * bitta havola uchun ikkita parallel so'rov ketardi (ortiqcha tashqi trafik).
 * Modul darajasidagi to'plam buni ham, sahifalar orasida qaytishni ham yopadi.
 */
const requestedUrls = new Set<string>();

/**
 * **Havoladan avtomatik logo, muqova, nom va tavsif.**
 *
 * Foydalanuvchi havola yozadi (sayt / App Store / Play Store / Telegram) — biz
 * o'sha manzildan loyihaning logotipi, muqovasi, nomi va TAVSIFINI topib,
 * formaning BO'SH maydonlarini to'ldiramiz. Tavsif manbaning o'z matni —
 * AI qayta yozmaydi (tez, bepul va o'ylab topilgan gap bo'lmaydi).
 *
 * Ikki qat'iy qoida:
 *  1. **Foydalanuvchi yozganini hech qachon bosib ketmaymiz** — to'ldirilgan
 *     maydon o'z holicha qoladi va serverdan ham so'ralmaydi.
 *  2. Topilmasa — bu **xato emas**: forma jimgina odatdagidek ishlayveradi
 *     (bu qulaylik, majburiyat emas).
 */
export function useLinkAutofill(
  links: LinkValues,
  targets: AutofillTargets,
  handlers: AutofillHandlers,
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;
  const [state, setState] = useState<AutofillState>(null);

  // Effekt ichida eng oxirgi qiymatlar kerak, lekin ular o'zgarganda effekt
  // QAYTA ishga tushmasligi kerak (aks holda har rasm to'lganda yana so'rov).
  const targetsRef = useRef(targets);
  const handlersRef = useRef(handlers);
  targetsRef.current = targets;
  handlersRef.current = handlers;

  /** Eskirgan javob yangi natijani bosib ketmasin. */
  const requestId = useRef(0);

  const apply = useCallback((meta: LinkMetadata): FilledField[] => {
    const t = targetsRef.current;
    const h = handlersRef.current;
    const filled: FilledField[] = [];

    if (meta.logo && !t.logo) {
      h.setLogo(meta.logo.url);
      filled.push('logo');
    }
    if (meta.cover && !t.cover) {
      h.setCover(meta.cover.url);
      filled.push('cover');
    }
    // Nom va bir jumlalik tavsif — faqat bo'sh bo'lsa (yordam, aralashuv emas).
    if (meta.title && !t.title.trim()) {
      h.setTitle(meta.title);
      filled.push('title');
    }
    if (meta.tagline && !t.tagline.trim()) {
      h.setTagline(meta.tagline);
      filled.push('tagline');
    }
    // To'liq tavsif — do'kon/sayt egasi yozgan matn. Foydalanuvchi uni
    // tahrirlaydi; biz faqat bo'sh maydonga qo'yamiz.
    if (meta.description && !t.description.trim()) {
      h.setDescription(meta.description);
      filled.push('description');
    }
    return filled;
  }, []);

  const run = useCallback(
    async (type: PlatformType, url: string) => {
      const t = targetsRef.current;
      // Hamma narsa allaqachon to'ldirilgan bo'lsa — so'rovning ma'nosi yo'q.
      if (
        t.logo &&
        t.cover &&
        t.title.trim() &&
        t.tagline.trim() &&
        t.description.trim()
      ) {
        return;
      }

      requestedUrls.add(url);
      const id = ++requestId.current;
      setState({ status: 'loading', type });

      try {
        const meta = await startupsApi.linkMetadata(url, {
          cover: !t.cover,
          logo: !t.logo,
          description: !t.description.trim(),
        });
        if (id !== requestId.current) return; // eskirgan javob
        const filled = apply(meta);
        setState(
          filled.length
            ? { status: 'done', type, filled }
            : { status: 'empty', type },
        );
      } catch {
        // Avtomatik to'ldirish — qulaylik. Xato ko'rsatilmaydi: foydalanuvchi
        // rasmni o'zi yuklashda davom etaveradi.
        if (id === requestId.current) setState({ status: 'empty', type });
      }
    },
    [apply],
  );

  // Havola yozib bo'lingach (debounce) — avtomatik ishga tushadi.
  useEffect(() => {
    if (!enabled) return;

    for (const type of PLATFORM_ORDER) {
      const raw = links[type];
      if (!raw?.trim()) continue;
      const url = normalizeUrl(raw, type);
      if (!url || requestedUrls.has(url)) continue;

      const timer = setTimeout(() => void run(type, url), DEBOUNCE_MS);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [links, enabled, run]);

  /** Maydondan chiqilganda darhol (debounce'ni kutmasdan) — mobil uchun muhim. */
  const flush = useCallback(
    (type: PlatformType) => {
      if (!enabled) return;
      const url = normalizeUrl(links[type] ?? '', type);
      if (!url || requestedUrls.has(url)) return;
      void run(type, url);
    },
    [links, enabled, run],
  );

  return { state, flush };
}
