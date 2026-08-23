'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { ArrowUp, Mic } from '@/components/icons';
import { useAuthStore } from '@/store/auth.store';
import { useTypewriter } from '@/lib/use-typewriter';
import { YechimMark } from './yechim-mark';

/** Jonli placeholder — real foydalanuvchi savollari ohangida. */
const PROMPTS = [
  'ingliz tilini arzon o‘rganmoqchiman',
  'kichik biznesim uchun buxgalteriya kerak',
  'mahsulotlarimni onlayn sotmoqchiman',
  'qishloqda internet sekin — nima qilay?',
];

/** Bir bosishli savollar — to'liq, AI tushunadigan shaklda. */
const CHIPS = [
  'Ingliz tilini arzon o‘rganmoqchiman',
  'Kichik biznesim uchun buxgalteriya kerak',
  'Mahsulotlarimni onlayn sotmoqchiman',
];

/**
 * Bosh sahifadagi **Yechim AI** kirish nuqtasi.
 *
 * Dizayn mantiqi (2026-08-23 qayta ko'rib chiqildi): sahifadagi asosiy
 * harakat — SAVOL YOZISH, demak diqqat markazi bitta bo'lishi kerak.
 * Shuning uchun:
 *  · karta sirti TINCH (oq, ringsiz) — ilgari butun karta spektr hoshiya
 *    bilan "yonardi" va kirish maydoni uning ichida yo'qolib ketardi;
 *  · "tirik" hoshiya (`.ai-aura`) endi FAQAT kirish maydonida — u past
 *    intensivlikdagi nur bilan sirtdan ko'tarilib turadi va fokusda
 *    jonlanadi (harakat foydalanuvchi niyatiga javob beradi);
 *  · atrofdagi matn qisqartirildi — maydonni "matn devori" bosmaydi.
 */
export function AiLauncher() {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();
  const [value, setValue] = useState('');
  const typed = useTypewriter(PROMPTS);
  const ghostRef = useRef<HTMLSpanElement>(null);

  /**
   * Ghost matn HAQIQIY maydon kabi tutadi: sig'masa chapdan "surilib"
   * ketadi va oxiri (kursor bilan) doim ko'rinadi. Kesib "…" qo'yish
   * matnni buzilgandek ko'rsatardi; bu esa yozilayotgan his beradi.
   */
  useEffect(() => {
    const el = ghostRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [typed]);

  /**
   * AI ga yozish ro'yxatdan o'tishni talab qiladi. Mehmon savolini yozgan
   * bo'lsa — u YO'QOLMAYDI: `?next=/ai?q=…` bilan register'ga o'tadi va
   * qaytgach savol o'zi yuboriladi.
   */
  function go(question?: string, e?: React.FormEvent) {
    e?.preventDefault();
    const q = (question ?? value).trim();
    const target = q.length >= 8 ? `/ai?q=${encodeURIComponent(q)}` : '/ai';
    // Hidratsiya tugamaguncha `/ai` ga yuboramiz — u yerda holat aniq bo'ladi.
    router.push(
      hasHydrated && !token ? `/register?next=${encodeURIComponent(target)}` : target,
    );
  }

  return (
    <section aria-labelledby="yechim-ai-title" className="relative">
      <div className="ai-surface rounded-ios-3xl px-5 py-7 shadow-card md:px-10 md:py-9">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:gap-7 md:text-left">
          {/* Mark — orqasida juda past intensivlikdagi nur (chuqurlik hissi) */}
          <span className="relative shrink-0">
            <span
              aria-hidden
              className="absolute inset-0 -z-10 rounded-full bg-accent-500/10 blur-2xl"
            />
            <YechimMark size={68} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-accent-700">
              Yechim AI
            </p>
            <h2
              id="yechim-ai-title"
              className="mt-1 text-title-1 font-semibold tracking-tight text-brand-900 md:text-[2rem]"
            >
              Muammoingizni ayting — yechimini topaman
            </h2>
            {/* Qisqa: bir jumla. Ikkinchi jumla faqat desktopda — mobilda u
                kirish maydonini pastga surib, diqqatni tarqatardi. */}
            <p className="mx-auto mt-2 max-w-xl text-callout leading-relaxed text-slate-500 md:mx-0">
              Yozib yoki aytib bering — platformadagi mos loyihani topib beraman.
              <span className="hidden md:inline">
                {' '}
                Topilmasa, muammoingizni hamjamiyatga qo‘yishga yordam beraman.
              </span>
            </p>
          </div>
        </div>

        {/* ── Kirish maydoni — sahifadagi yagona "tirik" sirt ──────────
            Nur (`--ai-glow`) tinch holatda ham ozgina yonib turadi: shu
            bitta detal maydonni oq kartadan ajratib ko'rsatadi. */}
        <form
          onSubmit={(e) => go(undefined, e)}
          style={{ '--ai-glow': 0.14 } as CSSProperties}
          className="ai-aura mt-6 flex items-center gap-1.5 rounded-full p-1.5 shadow-card-hover"
        >
          <span className="relative min-w-0 flex-1">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={300}
              aria-label="Muammoingiz"
              className="w-full bg-transparent px-3.5 py-2.5 text-body text-brand-900 focus:outline-none"
            />
            {/* Ghost matn maydon ICHIGA qamalgan: `right-1` chegarasi va
                `truncate` tufayli u hech qachon mikrofon tugmasi ustiga
                chiqmaydi (ilgari chegara yo'q edi — matn tugmani yopardi). */}
            {!value && (
              <span
                ref={ghostRef}
                aria-hidden
                className="no-scrollbar pointer-events-none absolute inset-y-0 left-3.5 right-1 flex items-center overflow-hidden whitespace-nowrap text-body text-slate-400"
              >
                {typed}
                <i className="ai-caret shrink-0" />
              </span>
            )}
          </span>

          <button
            type="button"
            onClick={() => go()}
            aria-label="Ovozli xabar bilan so‘rash"
            className="btn-round flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500"
          >
            <Mic className="h-5 w-5" />
          </button>
          <button
            type="submit"
            aria-label="Yechim izlash"
            className="btn-send flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          >
            <ArrowUp className="h-5 w-5" strokeWidth={2.8} />
          </button>
        </form>

        {/* Bir bosishli kirish — "nima so'rash mumkin"ni ko'rsatadi.
            Mobilda BIR QATOR (gorizontal surish): ilgari uch qatorga
            o'ralib, kirish maydonidan ko'ra ko'proq joy egallardi. */}
        <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 md:mx-0 md:mt-4 md:flex-wrap md:px-0">
          {CHIPS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => go(p)}
              className="tappable shrink-0 rounded-full bg-fill-tertiary px-3.5 py-1.5 text-footnote text-slate-600 transition-colors duration-150 ease-ios hover:text-brand-900"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
