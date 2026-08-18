'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ArrowUp, Mic, Sparkles } from '@/components/icons';
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

/**
 * Bosh sahifadagi **Yechim AI** kirish nuqtasi.
 *
 * Dizayn mantiqi: bu — sahifadagi yagona "aqlli" element, shuning uchun u
 * ajralib turishi SHART, lekin bachkana bo'lmasligi ham shart. Yechim:
 * sirt oq va tinch qoladi (iOS), farq esa faqat **aylanuvchi spektr
 * hoshiya** (`.ai-aura`) va markaning o'zi orqali beriladi. Fokusga
 * olinganda hoshiya jonlanadi — ya'ni harakat foydalanuvchi niyatiga
 * javob beradi, o'z-o'zidan shovqin qilmaydi.
 */
export function AiLauncher() {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();
  const [value, setValue] = useState('');
  const typed = useTypewriter(PROMPTS);

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
      <div className="ai-aura overflow-hidden rounded-ios-3xl px-5 py-7 md:px-10 md:py-9">
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-center md:gap-7">
          {/* Mark — orqasida juda past intensivlikdagi nur (chuqurlik hissi) */}
          <span className="relative shrink-0">
            <span
              aria-hidden
              className="absolute inset-0 -z-10 rounded-full bg-accent-500/10 blur-2xl"
            />
            <YechimMark size={72} />
          </span>

          <div className="min-w-0 flex-1 text-center md:text-left">
            <p className="flex items-center justify-center gap-1.5 text-footnote font-semibold uppercase tracking-[0.06em] text-accent-700 md:justify-start">
              <Sparkles className="h-3.5 w-3.5" />
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

        {/* Kirish maydoni — jonli placeholder bilan (bo'sh maydon "nima yozay?"
            savolini tug'diradi; yozilayotgan namuna uni darhol yopadi). */}
        <form
          onSubmit={(e) => go(undefined, e)}
          className="relative mt-6 flex items-center gap-2 rounded-full bg-fill-tertiary p-1.5 transition-colors duration-250 ease-ios focus-within:bg-fill-quaternary"
        >
          <span className="relative min-w-0 flex-1">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={300}
              aria-label="Muammoingiz"
              className="w-full bg-transparent px-4 py-2 text-body text-brand-900 focus:outline-none"
            />
            {!value && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-4 flex items-center truncate text-body text-slate-400"
              >
                {typed}
                <i className="ai-caret" />
              </span>
            )}
          </span>

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

        {/* Bir bosishli kirish — "nima so'rash mumkin"ni ko'rsatadi va
            birinchi savolgacha bo'lgan ishqalanishni nolga tushiradi. */}
        <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
          {PROMPTS.slice(0, 3).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => go(p)}
              className="tappable rounded-full bg-fill-tertiary px-3.5 py-1.5 text-footnote text-slate-600 transition-colors duration-150 ease-ios hover:text-brand-900"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
