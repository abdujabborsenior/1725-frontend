'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from '@/components/icons';
import { cn } from '@/lib/utils';

/**
 * "Sizni nima to'xtatib turibdi?" — boshlashga xalaqit beradigan eng keng tarqalgan
 * shubhalar va ularning real javoblari. Foydalanuvchini ichidan gapiradi.
 * Savol/javob matnlari — lug'atda (`landing.doubts.<key>.{q,a}`).
 */
const DOUBTS = ['simple', 'code', 'alone', 'start'] as const;

export function Doubts() {
  const t = useTranslations('landing.doubts');
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();

  // --row-inset: ajratkich matn boshlanadigan joydan chiziladi (iOS qoidasi),
  // shuning uchun qator paddingiga (px-5 / md:px-6) tekislanadi.
  return (
    <div className="ios-list mx-auto max-w-3xl [--row-inset:1.25rem] md:[--row-inset:1.5rem]">
      {DOUBTS.map((key, i) => {
        const active = open === i;
        const headerId = `${uid}-h${i}`;
        const panelId = `${uid}-p${i}`;
        return (
          <div key={key} className="bg-white">
            <h3>
              <button
                type="button"
                id={headerId}
                onClick={() => setOpen(active ? null : i)}
                aria-expanded={active}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start hv-row md:px-6"
              >
                <span className="text-callout font-semibold text-brand-900 md:text-title-3">
                  {t(`${key}.q`)}
                </span>
                {/* Ochish/yopish ko'rsatkichi: chevron PASTGA → ochilganda YUQORIGA
                    buriladi (iOS disclosure naqshi). Bitta ikonka aylanadi —
                    ikkita ikonkani almashtirish silliq o'tishni buzadi. */}
                <span
                  className={cn(
                    'flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full transition-[transform,background-color,color] duration-250 ease-ios motion-reduce:transition-none',
                    active ? 'rotate-180 bg-accent-600 text-white' : 'bg-fill-tertiary text-slate-500',
                  )}
                >
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              </button>
            </h3>
            {/* CSS accordion (grid-rows trick) — framer height animatsiyasisiz;
                kontent doim DOM'da (SEO uchun ham foydali) */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className={cn('acc-panel', active && 'acc-panel-open')}
              aria-hidden={!active}
            >
              <div>
                <p className="px-5 pb-4 text-subhead leading-relaxed text-slate-500 md:px-6">
                  {t(`${key}.a`)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
