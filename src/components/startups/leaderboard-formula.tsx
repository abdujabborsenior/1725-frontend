'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Info, ChevronDown } from '@/components/icons';
import type { LeaderboardFormula } from '@/types';
import { cn } from '@/lib/utils';
import { useFormatNumber } from '@/lib/format';

/**
 * Shaffoflik banneri — IMDB Top-250 kabi vaznli (Bayes) reyting formulasini
 * va joriy konstantalarni ko'rsatadi. Yig'iladi/yoziladi.
 * Matnlar — lug'atda (`leaderboard.formula.*`); formula belgilari (WR, R, v,
 * m, C) matematik yozuv — tarjima qilinmaydi.
 */
export function FormulaExplainer({ formula }: { formula: LeaderboardFormula }) {
  const t = useTranslations('leaderboard.formula');
  const fmt = useFormatNumber();
  const [open, setOpen] = useState(false);
  return (
    /* Sirt OQ: ilgari panel `surface-soft` (kulrang) edi va sahifa foni ham
       kulrang — panel fondan ajralmasdi, ichidagi `slate-400` matn esa
       amalda o'qilmasdi. Endi oq karta + hairline, matnlar `slate-600`. */
    <div className="overflow-hidden rounded-ios-lg bg-white shadow-card">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-4 py-3.5 text-left hv-row"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
          <Info className="h-4 w-4" />
        </span>
        <span className="flex-1 text-subhead font-semibold text-brand-900">
          {t('question')}
        </span>
        <span className="hidden text-footnote text-slate-600 sm:inline">
          {t.rich('stats', {
            c: formula.c.toFixed(2),
            m: fmt(formula.m),
            b: (chunks) => (
              <b className="font-semibold tabular-nums text-brand-900">{chunks}</b>
            ),
          })}
        </span>
        {/* Strelka O'RALGAN: yalang'och ikonka kulrang fonda yo'qolib ketardi —
            endi o'z doirasida turadi va tugma ekani ko'rinadi. */}
        <span
          aria-hidden
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fill-tertiary text-slate-600 transition-transform duration-250 ease-ios',
            open && 'rotate-180',
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      {open && (
        <div className="hairline-t space-y-3 px-4 py-4 text-subhead text-slate-600">
          <p>{t.rich('intro', { b: (chunks) => <b>{chunks}</b> })}</p>
          <div className="overflow-x-auto rounded-ios-md bg-brand-900 px-4 py-3 font-mono text-footnote text-slate-100">
            WR = (v / (v + m)) · R + (m / (v + m)) · C
          </div>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            <li>
              <b className="text-brand-900">R</b> — {t('legend.r')}
            </li>
            <li>
              <b className="text-brand-900">v</b> — {t('legend.v')}
            </li>
            <li>
              <b className="text-brand-900">m</b> = {formula.m} — {t('legend.m')}
            </li>
            <li>
              <b className="text-brand-900">C</b> = {formula.c.toFixed(2)} — {t('legend.c')}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
