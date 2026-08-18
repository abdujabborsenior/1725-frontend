'use client';

import { useEffect, useState } from 'react';

/**
 * Jonli "yozilayotgan" matn — bosh sahifadagi AI maydonining placeholderi
 * uchun. Maqsad dekor emas: foydalanuvchi bir necha soniyada AI ga QANDAY
 * savol berish mumkinligini o'qib ulguradi (bo'sh maydon "nima yozay?"
 * savolini tug'diradi — bu esa kirish nuqtasidagi eng katta yo'qotish).
 *
 * SSR: boshlang'ich qiymat — birinchi frazaning to'liq matni, shuning uchun
 * server va klient bir xil chiqadi (hidratsiya nomuvofiqligi yo'q) va JS
 * o'chiq bo'lsa ham ma'noli matn turadi.
 */
export function useTypewriter(
  phrases: string[],
  { typeMs = 42, eraseMs = 22, holdMs = 1900 } = {},
): string {
  const [text, setText] = useState(phrases[0] ?? '');
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'hold' | 'erase' | 'type'>('hold');

  useEffect(() => {
    if (phrases.length < 2) return;
    const current = phrases[index % phrases.length];
    let t: ReturnType<typeof setTimeout>;

    if (phase === 'hold') {
      t = setTimeout(() => setPhase('erase'), holdMs);
    } else if (phase === 'erase') {
      if (text.length === 0) {
        setIndex((i) => (i + 1) % phrases.length);
        setPhase('type');
        return;
      }
      t = setTimeout(() => setText((s) => s.slice(0, -1)), eraseMs);
    } else {
      if (text.length >= current.length) {
        setPhase('hold');
        return;
      }
      t = setTimeout(() => setText(current.slice(0, text.length + 1)), typeMs);
    }
    return () => clearTimeout(t);
  }, [text, phase, index, phrases, typeMs, eraseMs, holdMs]);

  return text;
}
