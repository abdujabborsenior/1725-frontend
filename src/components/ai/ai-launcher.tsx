'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

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
 * Bosh sahifadagi **Yechim AI** kirish nuqtasi.
 *
 * Dizayn mantiqi (2026-08-28 qayta ko'rib chiqildi — o'lcham intizomi):
 * ilgari kirish maydoni kartaning butun kengligiga cho'zilardi (desktopda
 * 1040×56) — bu boshqaruv emas, "tarnov" bo'lib ko'rinardi va sahifadagi
 * eng aqlli element eng qo'pol elementga aylanardi. Yangi tuzilma:
 *  · **chapda — nima ekani** (marka + sarlavha + bir jumla),
 *    **o'ngda — nima qilish kerakligi** (maydon + tez savollar).
 *    Modul CTA banner ritmiga tushadi va balandligi ~40% qisqaradi;
 *  · maydon **kengligi cheklangan** (`26rem`) va balandligi `/ai`
 *    sahifasidagi composer bilan AYNAN bir xil (52px, 40px boshqaruvlar) —
 *    bir mahsulotda bitta boshqaruv ikki xil o'lchamda bo'lmaydi;
 *  · sirt tinch, "tirik" hoshiya faqat maydonda (bitta ekranda bitta
 *    diqqat markazi) — fokusda jonlanadi.
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
      <div className="ai-surface rounded-ios-3xl px-5 py-6 shadow-card md:px-8 md:py-7">
        {/* Ikki ustun faqat `lg` dan: 768px'da o'ng ustun uchun joy yetmaydi
            (sarlavha ustuni 200px'gacha siqilardi) — u yerda tabiiy stack. */}
        <div className="lg:flex lg:items-center lg:gap-10">
          {/* ── Chap: bu nima ────────────────────────────────────────── */}
          <div className="min-w-0 lg:flex-1">
            <div className="flex items-center gap-3.5">
              <span className="relative shrink-0">
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full bg-accent-500/10 blur-2xl"
                />
                <YechimMark size={48} />
              </span>
              <div className="min-w-0">
                <p className="text-caption-1 font-semibold uppercase tracking-[0.08em] text-accent-700">
                  Yechim AI
                </p>
                <h2
                  id="yechim-ai-title"
                  className="mt-0.5 text-title-3 font-semibold tracking-tight text-brand-900 md:text-title-2"
                >
                  Muammoingizni ayting — yechimini topaman
                </h2>
              </div>
            </div>
            {/* Bir jumla. Ikkinchisi faqat keng ekranda — tor ustunda u
                uch qatorga bo'linib, maydonni pastga surardi.
                `lg:pl-…` — marka kengligi (48) + oraliq (14): keng ekranda
                jumla sarlavha bilan bitta chap qirraga tushadi. Mobilda
                ataylab to'liq kenglik: 62px chekinish uni 3 qatorga
                bo'lib, kartani bekorga cho'zardi. */}
            <p className="mt-2.5 text-subhead leading-relaxed text-slate-500 lg:pl-[3.875rem]">
              Yozib yoki aytib bering — platformadagi mos loyihani topib beraman.
              <span className="hidden xl:inline">
                {' '}
                Topilmasa, muammoingizni hamjamiyatga qo‘yishga yordam beraman.
              </span>
            </p>
          </div>

          {/* ── O'ng: nima qilish kerak ───────────────────────────────── */}
          <div className="mt-5 w-full max-w-[26rem] lg:mt-0 lg:w-[26rem] lg:shrink-0">
            {/* Nur tinch holatda ham ozgina yonib turadi (`.ai-aura-idle`):
                shu bitta detal maydonni oq kartadan ajratib ko'rsatadi,
                fokusda esa jonlanadi. */}
            <form
              onSubmit={(e) => go(undefined, e)}
              className="ai-aura ai-aura-idle flex items-center gap-1 rounded-full p-1.5 shadow-card-hover"
            >
              <span className="relative min-w-0 flex-1">
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  maxLength={300}
                  enterKeyHint="go"
                  autoComplete="off"
                  /* O'zbekcha matn brauzer lug'atida yo'q — spellcheck butun
                     savolni qizil to'lqin bilan chizib, maydonni "xato"
                     ko'rinishga soladi. */
                  spellCheck={false}
                  aria-label="Muammoingiz"
                  className="w-full bg-transparent px-3 py-2 text-body text-brand-900 focus:outline-none"
                />
                {/* Ghost matn maydon ICHIGA qamalgan: `right-1` chegarasi
                    tufayli u hech qachon mikrofon tugmasi ustiga chiqmaydi. */}
                {!value && (
                  <span
                    ref={ghostRef}
                    aria-hidden
                    className="no-scrollbar pointer-events-none absolute inset-y-0 left-3 right-1 flex items-center overflow-hidden whitespace-nowrap text-body text-slate-500"
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
                className="btn-round flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500"
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                type="submit"
                aria-label="Yechim izlash"
                className="btn-send flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              >
                <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.8} />
              </button>
            </form>

            {/* Tez savollar — "nima so'rash mumkin"ni ko'rsatadi. Yorliq
                qisqa bo'lgani uchun uchalasi bir qatorga sig'adi (mobilda
                ham o'ralmaydi, desktopda ham ustun ichida qoladi). */}
            <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto px-1">
              {CHIPS.map(({ label, q }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(q)}
                  aria-label={`So‘rash: ${q}`}
                  className="tappable shrink-0 rounded-full bg-fill-tertiary px-3 py-1.5 text-footnote text-slate-600 transition-colors duration-150 ease-ios hover:bg-accent-50 hover:text-accent-700"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
