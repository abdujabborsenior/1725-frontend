'use client';

import {
  forwardRef,
  useRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react';
import { PrefetchKind } from 'next/dist/client/components/router-reducer/router-reducer-types';

import { BaseLink, useRouter } from './navigation-core';

type LinkProps = ComponentPropsWithoutRef<typeof BaseLink>;
type Href = Parameters<ReturnType<typeof useRouter>['prefetch']>[0];

/**
 * Ilovadagi YAGONA `Link` — "niyat bo'yicha" prefetch (2026-09-21).
 *
 * Nega: Next'ning standart `<Link>` i ko'rinish maydoniga tushgan HAR havolani
 * oldindan yuklaydi. O'lchandi (prod, bitta sahifa ochilishi): `/startups` —
 * 16, `/problems` — 18, bosh sahifa — 10 ta qo'shimcha so'rov (+ o'sha
 * sahifalarning JS bo'laklari). Ya'ni 1 ko'rish = serverga ~17 so'rov; 1M bir
 * vaqtdagi foydalanuvchida bu Node serverni o'ldiradi, foydalanuvchining
 * trafigini esa bekorga yeydi (ularning ko'pchiligiga hech qachon kirilmaydi).
 *
 * Endi: ko'rinishda prefetch YO'Q; foydalanuvchi NIYAT bildirganda —
 * sichqoncha ustiga olib borsa, klaviatura fokusi tushsa yoki barmoq tekkanda —
 * aynan o'sha bitta sahifa oldindan yuklanadi. Hover → bosish orasidagi
 * ~150–300 ms ko'p hollarda sahifani tayyorlab ulguradi, ya'ni o'tish hamon
 * tez (Next 14 da `prefetch={false}` hover-prefetch'ni ham o'chiradi — shuning
 * uchun uni shu yerda qo'lda qaytaramiz).
 *
 * ⚠️ `kind: AUTO` MAJBURIY — Next'ning o'z `<Link>` i hover'da aynan shuni
 * ishlatadi. `router.prefetch()` esa standart holatda FULL qiladi: dinamik
 * sahifani (startap/muammo detali) ma'lumoti bilan TO'LIQ server-render
 * qiladi. Hover'lar bosishlardan ko'p marta ko'p — FULL har "shunchaki
 * sichqoncha o'tib ketdi" holatini to'liq render'ga aylantirardi (o'lchandi).
 * AUTO: statik sahifa to'liq, dinamigi faqat umumiy qobig'igacha.
 *
 * Chaqiruvchi `prefetch` ni ANIQ bersa (true/false) — o'sha hurmat qilinadi.
 * SEO'ga ta'sir yo'q: havola va `href` HTML'da o'zgarishsiz.
 */
export const Link = forwardRef<ElementRef<typeof BaseLink>, LinkProps>(function Link(
  { prefetch, onMouseEnter, onFocus, onTouchStart, href, ...rest },
  ref,
) {
  const router = useRouter();
  const warmed = useRef<string | null>(null);
  const byIntent = prefetch == null;

  const warm = () => {
    if (!byIntent) return;
    const key = typeof href === 'string' ? href : JSON.stringify(href);
    if (warmed.current === key) return;
    warmed.current = key;
    try {
      router.prefetch(href as Href, { kind: PrefetchKind.AUTO });
    } catch {
      /* prefetch — faqat tezlashtirish; xatosi navigatsiyaga ta'sir qilmaydi */
    }
  };

  return (
    <BaseLink
      ref={ref}
      href={href}
      prefetch={byIntent ? false : prefetch}
      onMouseEnter={(e) => {
        onMouseEnter?.(e);
        warm();
      }}
      onFocus={(e) => {
        onFocus?.(e);
        warm();
      }}
      onTouchStart={(e) => {
        onTouchStart?.(e);
        warm();
      }}
      {...rest}
    />
  );
});
