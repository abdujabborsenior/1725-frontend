'use client';

import type { CSSProperties } from 'react';

import { ArrowUpRight } from '@/components/icons';
import { cn } from '@/lib/utils';
import { YechimOrb } from './yechim-mark';

/**
 * Bo'sh ekran — "nima yozay?" savoliga javob.
 *
 * ⚠️ Uzunlik intizomi: har namuna mobilda BIR QATORGA sig'adi, bo'sh holat
 * kichik ekranda ham (667px) composerga tegmasdan to'liq ko'rinadi.
 */
const EXAMPLES = [
  'Ingliz tilini arzon o‘rganmoqchiman',
  'Kichik biznesim uchun buxgalteriya kerak',
  'Mahsulotlarimni onlayn sotmoqchiman',
  'Qishloqda internet sekin',
];

export function AiWelcome({
  onPick,
  disabled,
}: {
  onPick: (q: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center px-1 text-center">
      <YechimOrb size={92} className="yz-rise" />

      <h2
        className="yz-rise mt-5 max-w-md text-title-2 font-semibold tracking-tight text-[color:var(--yz-ink)] sm:text-title-1"
        style={{ '--d': '0.08s' } as CSSProperties}
      >
        Muammoingizni ayting — yechimini topaman
      </h2>
      <p
        className="yz-rise mt-2 max-w-sm text-callout leading-relaxed text-[color:var(--yz-ink-2)]"
        style={{ '--d': '0.16s' } as CSSProperties}
      >
        Platformadagi loyihalar orasidan sizga mos keladiganini topaman
      </p>

      {!disabled && (
        <div className="mt-7 grid w-full max-w-xl gap-2 sm:grid-cols-2">
          {EXAMPLES.map((example, i) => (
            <button
              key={example}
              type="button"
              onClick={() => onPick(example)}
              style={{ '--d': `${0.24 + i * 0.06}s` } as CSSProperties}
              className={cn(
                'yz-rise yz-card yz-card-tap group flex items-center gap-2.5 px-4 py-3 text-left',
                // Mobilda faqat ikkitasi: qolgani composer ostiga tushib
                // "yarim kesilgan" bo'lib ko'rinardi.
                i > 1 && 'hidden sm:flex',
              )}
            >
              <span className="min-w-0 flex-1 text-subhead leading-snug text-[color:var(--yz-ink-2)]">
                {example}
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-[color:var(--yz-ink-3)] transition-transform duration-200 ease-ios group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
