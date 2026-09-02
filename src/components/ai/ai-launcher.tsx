'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { ArrowUp, Mic } from '@/components/icons';
import { useAuthStore } from '@/store/auth.store';
import { useTypewriter } from '@/lib/use-typewriter';
import { YechimOrb } from './yechim-mark';

/** Jonli placeholder — real foydalanuvchi savollari ohangida. */
const PROMPTS = [
  'ingliz tilini arzon o‘rganmoqchiman',
  'kichik biznesim uchun buxgalteriya kerak',
  'mahsulotlarimni onlayn sotmoqchiman',
  'qishloqda internet sekin — nima qilay?',
];

/**
 * Bir bosishli savollar. Yorliq QISQA (chiplar bir qatorga sig'adi), AI ga
 * esa to'liq savol ketadi — model kontekstsiz "Buxgalteriya" so'zidan
 * foydalanuvchi nima istayotganini taxmin qilmasin.
 */
const CHIPS: { label: string; q: string }[] = [
  { label: 'Ingliz tili', q: 'Ingliz tilini arzon o‘rganmoqchiman' },
  { label: 'Buxgalteriya', q: 'Kichik biznesim uchun buxgalteriya kerak' },
  { label: 'Onlayn sotuv', q: 'Mahsulotlarimni onlayn sotmoqchiman' },
];

/**
 * Bosh sahifadagi **Yechim AI** kirish nuqtasi — Studio'ning "eshigi".
 *
 * Nega to'q: butun bosh sahifa oq va tinch; shu bitta blok tungi bo'lgani
 * uchun ko'z avtomatik unga tushadi va foydalanuvchi bosgach AYNAN shu
 * muhitga (Studio) kiradi — o'tish uzluksiz, "boshqa saytga tushdim"
 * hissiyoti yo'q.
 *
 * O'lcham intizomi (2026-08-28 darsi): kirish maydoni kartaning butun
 * kengligiga cho'zilmaydi — chapda "bu nima", o'ngda "nima qilish kerak".
 */
export function AiLauncher() {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();
  const [value, setValue] = useState('');
  const typed = useTypewriter(PROMPTS);
  const ghostRef = useRef<HTMLSpanElement>(null);

  /**
   * Ghost matn HAQIQIY maydon kabi tutadi: sig'masa chapdan surilib ketadi
   * va oxiri (kursor bilan) doim ko'rinadi. Kesib "…" qo'yish matnni
   * buzilgandek ko'rsatardi.
   */
  useEffect(() => {
    const el = ghostRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [typed]);

  /**
   * AI ga yozish ro'yxatdan o'tishni talab qiladi. Mehmon savoli
   * YO'QOLMAYDI: `?next=/ai?q=…` bilan register'ga o'tadi va qaytgach
   * savol o'zi yuboriladi.
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
    <section
      aria-labelledby="yechim-ai-title"
      className="yz yz-band relative overflow-hidden rounded-ios-3xl px-5 py-7 shadow-lift md:px-9 md:py-9"
    >
      <span aria-hidden className="yz-grain" />

      {/* Ikki ustun faqat `lg` dan: 768px'da o'ng ustun uchun joy yetmaydi
          (sarlavha ustuni 200px'gacha siqilardi) — u yerda tabiiy stack. */}
      <div className="relative lg:flex lg:items-center lg:gap-10">
        {/* ── Chap: bu nima ──────────────────────────────────────── */}
        <div className="min-w-0 lg:flex-1">
          <div className="flex items-center gap-3.5">
            <YechimOrb size={52} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-caption-1 font-semibold uppercase tracking-[0.09em] text-[color:var(--yz-blue)]">
                Yechim AI
              </p>
              <h2
                id="yechim-ai-title"
                className="mt-0.5 text-title-3 font-semibold tracking-tight text-[color:var(--yz-ink)] md:text-title-2"
              >
                Muammoingizni ayting — yechimini topaman
              </h2>
            </div>
          </div>
          <p className="mt-2.5 text-subhead leading-relaxed text-[color:var(--yz-ink-2)] lg:pl-[4.1rem]">
            Yozib yoki aytib bering — platformadagi mos loyihani topib beraman
          </p>
        </div>

        {/* ── O'ng: nima qilish kerak ────────────────────────────── */}
        <div className="mt-5 w-full max-w-[26rem] lg:mt-0 lg:w-[26rem] lg:shrink-0">
          <form
            onSubmit={(e) => go(undefined, e)}
            className="yz-ring flex items-center gap-1 rounded-full p-1.5"
          >
            <span className="relative min-w-0 flex-1">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                maxLength={300}
                enterKeyHint="go"
                autoComplete="off"
                /* O'zbekcha matn brauzer lug'atida yo'q — spellcheck butun
                   savolni qizil to'lqin bilan chizib qo'yardi. */
                spellCheck={false}
                aria-label="Muammoingiz"
                className="w-full bg-transparent px-3 py-2 text-body text-[color:var(--yz-ink)] focus:outline-none"
              />
              {/* Ghost matn maydon ICHIGA qamalgan: `right-1` chegarasi
                  tufayli u hech qachon mikrofon tugmasi ustiga chiqmaydi. */}
              {!value && (
                <span
                  ref={ghostRef}
                  aria-hidden
                  className="no-scrollbar pointer-events-none absolute inset-y-0 left-3 right-1 flex items-center overflow-hidden whitespace-nowrap text-body text-[color:var(--yz-ink-3)]"
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
              className="yz-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[color:var(--yz-ink-2)]"
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              type="submit"
              aria-label="Yechim izlash"
              className="yz-send flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            >
              <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.8} />
            </button>
          </form>

          {/* Tez savollar — "nima so'rash mumkin"ni ko'rsatadi */}
          <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto px-1">
            {CHIPS.map(({ label, q }) => (
              <button
                key={label}
                type="button"
                onClick={() => go(q)}
                aria-label={`So‘rash: ${q}`}
                className="yz-btn shrink-0 rounded-full bg-white/[0.07] px-3 py-1.5 text-footnote text-[color:var(--yz-ink-2)]"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
