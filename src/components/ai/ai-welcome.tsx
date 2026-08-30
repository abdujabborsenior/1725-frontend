'use client';

import type { CSSProperties } from 'react';

import { ArrowUpRight, Mic, Search, Layers, Sparkles } from '@/components/icons';
import { cn } from '@/lib/utils';
import { YechimMark } from './yechim-mark';

/**
 * Bo'sh ekranda "nima yozay?" savoliga javob — real foydalanuvchi ohangi.
 * ⚠️ Uzunlik intizomi: har biri mobilda BIR QATORGA sig'adi — bo'sh holat
 * kichik ekranda ham (667px) composerga tegmasdan to'liq ko'rinishi kerak.
 */
const EXAMPLES = [
  'Ingliz tilini arzon o‘rganmoqchiman',
  'Buxgalteriya yechimi kerak',
  'Qishloqda internet sekin',
  'Mahsulotlarimni onlayn sotmoqchiman',
];

/**
 * Ochilish nuqtalari: burchak (a), boshlang'ich radius (r), kechikish (d),
 * rang (c). Radiuslar ATAYLAB har xil — teng aylana mexanik ko'rinardi;
 * turli masofa "turli joydan yig'ildi" hissini beradi.
 */
const GATHER = [
  { a: 12, r: 96, d: 0, c: '#0A84FF' },
  { a: 58, r: 74, d: 0.06, c: '#5856D6' },
  { a: 104, r: 108, d: 0.12, c: '#7B62E0' },
  { a: 150, r: 82, d: 0.04, c: '#0A84FF' },
  { a: 196, r: 100, d: 0.16, c: '#5856D6' },
  { a: 242, r: 70, d: 0.1, c: '#7B62E0' },
  { a: 288, r: 104, d: 0.02, c: '#5856D6' },
  { a: 334, r: 86, d: 0.14, c: '#0A84FF' },
];

/** AI qanday ishlashi — uch qadam. Ishonch: "qora quti" emas. */
const HOW = [
  { icon: Search, label: 'Muammoni tushunadi' },
  { icon: Layers, label: 'Barcha loyihalarni ko‘rib chiqadi' },
  { icon: Sparkles, label: 'Mos yechimni topadi' },
];

/**
 * Yechim AI bo'sh holati — sahifa ochilish sekvensiyasi shu yerda:
 * mark spring bilan "ochiladi", matn blur'dan fokusga keladi, namunalar
 * ketma-ket materializatsiya bo'ladi. Sekvensiya BIR MARTA o'ynaydi
 * (kirish taassuroti), keyin sirt butunlay tinch turadi.
 */
export function AiWelcome({
  onPick,
  disabled,
}: {
  onPick: (q: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="py-1 text-center sm:py-6">
      {/* Ochilish: sochilgan loyihalar markazga yig'iladi → uchqun yonadi.
          Nuqtalar mark BILAN BIR VAQTDA harakat qiladi (mark spring bilan
          ochilayotganda ular ichkariga cho'kadi) — bitta yaxlit lahza. */}
      <span className="relative mx-auto block w-fit">
        <span aria-hidden className="absolute inset-0 -z-10 rounded-full bg-iris-500/10 blur-2xl" />
        <span aria-hidden className="pointer-events-none absolute inset-0">
          {GATHER.map((g, i) => (
            <span
              key={i}
              className="ai-gather"
              style={
                {
                  '--a': `${g.a}deg`,
                  '--r': `${g.r}px`,
                  '--d': `${g.d}s`,
                  '--c': g.c,
                } as CSSProperties
              }
            />
          ))}
        </span>
        <YechimMark size={68} className="ai-open-mark relative" />
      </span>

      <h2
        className="ai-open-text mt-3 text-title-2 font-semibold tracking-tight text-brand-900 sm:mt-5"
        style={{ '--ai-delay': '0.12s' } as CSSProperties}
      >
        Muammoingizni ayting — yechimini topaman
      </h2>
      <p
        className="ai-open-text mx-auto mt-2 max-w-md text-callout leading-relaxed text-slate-500"
        style={{ '--ai-delay': '0.2s' } as CSSProperties}
      >
        Platformadagi loyihalar orasidan sizga mos keladiganini topib beraman.
        <span className="hidden sm:inline">
          {' '}
          Topilmasa — muammoingizni hamjamiyatga qo‘yishga yordam beraman.
        </span>
      </p>

      {/* Qanday ishlaydi — uch qadam. Mobilda ustun, desktopda bir qator:
          "qora quti" taassurotini yo'qotadi, ishonch beradi. */}
      <div
        className="ai-open-text mx-auto mt-3 flex w-fit flex-col items-start gap-1 sm:mt-6 sm:flex-row sm:items-center sm:gap-6"
        style={{ '--ai-delay': '0.28s' } as CSSProperties}
      >
        {HOW.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-2 text-caption-1 text-slate-500">
            <Icon className="h-3.5 w-3.5 shrink-0 text-accent-600" />
            {label}
          </span>
        ))}
      </div>

      {!disabled && (
        <div className="mx-auto mt-3 grid max-w-2xl gap-2 sm:mt-6 sm:grid-cols-2">
          {EXAMPLES.map((example, i) => (
            <button
              key={example}
              type="button"
              onClick={() => onPick(example)}
              style={{ '--ai-delay': `${0.34 + i * 0.06}s` } as CSSProperties}
              className={cn(
                'ai-focus-in tappable group flex items-start gap-2.5 rounded-ios-lg bg-white px-4 py-3 text-left shadow-card transition-shadow duration-250 ease-ios hover:shadow-[0_14px_32px_-18px_rgba(0,40,90,0.3),inset_0_0_0_1px_rgba(0,122,255,0.14)] sm:py-3.5',
                // Mobil ekranda faqat ikkitasi: qolgani composer ostiga
                // tushib "yarim kesilgan" bo'lib ko'rinardi.
                i > 1 && 'hidden sm:flex',
              )}
            >
              <span className="min-w-0 flex-1 text-subhead leading-snug text-slate-600">
                {example}
              </span>
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-all duration-200 ease-ios group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-600" />
            </button>
          ))}
        </div>
      )}

      <p
        className="ai-open-text mt-5 hidden items-center justify-center gap-1.5 text-footnote text-slate-500 sm:flex"
        style={{ '--ai-delay': '0.6s' } as CSSProperties}
      >
        <Mic className="h-4 w-4" /> Yozishga vaqt yo‘qmi? Aytib bering — o‘zim yozib olaman
      </p>
    </div>
  );
}
