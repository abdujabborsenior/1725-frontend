'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ArrowUp, Mic } from '@/components/icons';
import { useAuthStore } from '@/store/auth.store';
import { YechimMark } from './yechim-mark';

/**
 * Bosh sahifadagi **Yechim AI** kirish nuqtasi.
 *
 * Dizayn mantiqi: bu — sahifadagi yagona "aqlli" element, shuning uchun u
 * boshqa kartalardan farq qilishi KERAK, lekin bachkana bo'lmasligi ham
 * shart. Yechim: sirt oq va tinch qoladi (iOS), farq esa faqat **gradient
 * hoshiya** (`.yechim-frame`, 1.5px) va markaning o'zi orqali beriladi —
 * ya'ni "premium = restraint" tamoyili buzilmaydi.
 *
 * Foydalanuvchi shu yerda savolini yozib yuborishi mumkin (bir bosishda
 * `/ai?q=` ga o'tadi) yoki to'g'ridan-to'g'ri AI sahifasini ochadi.
 */
export function AiLauncher() {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();
  const [value, setValue] = useState('');

  /**
   * AI ga yozish ro'yxatdan o'tishni talab qiladi. Mehmon savolini yozgan
   * bo'lsa — u YO'QOLMAYDI: `?next=/ai?q=…` bilan register'ga o'tadi va
   * qaytgach savol o'zi yuboriladi.
   */
  function go(e?: React.FormEvent) {
    e?.preventDefault();
    const q = value.trim();
    const target = q.length >= 8 ? `/ai?q=${encodeURIComponent(q)}` : '/ai';
    // Hidratsiya tugamaguncha `/ai` ga yuboramiz — u yerda holat aniq bo'ladi
    // (sahifa o'zi kerak bo'lsa register'ga yo'naltiradi).
    router.push(
      hasHydrated && !token
        ? `/register?next=${encodeURIComponent(target)}`
        : target,
    );
  }

  return (
    <section aria-labelledby="yechim-ai-title">
      <div className="yechim-frame overflow-hidden rounded-ios-3xl px-5 py-7 md:px-10 md:py-9">
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-center md:gap-7">
          <YechimMark size={68} className="shrink-0" />

          <div className="min-w-0 flex-1 text-center md:text-left">
            <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-accent-700">
              Yechim AI
            </p>
            <h2
              id="yechim-ai-title"
              className="mt-1 text-title-1 font-semibold tracking-tight text-brand-900 md:text-[2rem]"
            >
              Muammoingizni ayting — yechimini topaman
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-callout leading-relaxed text-slate-500 md:mx-0">
              Yozib yoki aytib bering. Platformadagi yuzlab loyiha orasidan sizga
              mos keladiganini topib beraman — topilmasa, muammoingizni
              hamjamiyatga qo‘yishga yordam beraman.
            </p>
          </div>
        </div>

        {/* Kirish maydoni — bosilganda to'liq AI sahifasi ochiladi */}
        <form onSubmit={go} className="mt-6 flex items-center gap-2 rounded-full bg-fill-tertiary p-1.5">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={300}
            placeholder="Masalan: ingliz tilini arzon o‘rganmoqchiman"
            aria-label="Muammoingiz"
            className="min-w-0 flex-1 bg-transparent px-4 py-2 text-body text-brand-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => go()}
            aria-label="Ovozli xabar bilan so‘rash"
            className="tappable flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500"
          >
            <Mic className="h-[19px] w-[19px]" />
          </button>
          <button
            type="submit"
            aria-label="Yechim izlash"
            className="tappable-scale flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-600 text-white active:bg-accent-700"
          >
            <ArrowUp className="h-[19px] w-[19px]" strokeWidth={2.6} />
          </button>
        </form>
      </div>
    </section>
  );
}
