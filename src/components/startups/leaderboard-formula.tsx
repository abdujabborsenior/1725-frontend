'use client';

import { useState } from 'react';
import { Info, ChevronDown } from '@/components/icons';
import type { LeaderboardFormula } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Shaffoflik banneri — IMDB Top-250 kabi vaznli (Bayes) reyting formulasini
 * va joriy konstantalarni ko'rsatadi. Yig'iladi/yoziladi.
 */
export function FormulaExplainer({ formula }: { formula: LeaderboardFormula }) {
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
          O&apos;rinlar qanday hisoblanadi?
        </span>
        <span className="hidden text-footnote text-slate-600 sm:inline">
          O&apos;rtacha ={' '}
          <b className="font-semibold tabular-nums text-brand-900">
            {formula.c.toFixed(2)}
          </b>{' '}
          · ishonch ostonasi (m) ={' '}
          <b className="font-semibold tabular-nums text-brand-900">{formula.m}</b>
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
          <p>
            Baholar <b>10&nbsp;ballik</b> shkalada. Oddiy o&apos;rtacha adolatsiz
            bo&apos;lardi: bitta 10&nbsp;ball olgan startap, 1000 ta ovozli
            9.6&nbsp;li startapdan yuqori chiqib ketardi. Shuning uchun biz IMDB
            Top-250 kabi <b>Bayes (vaznli) reyting</b> ishlatamiz — ovozlar kam
            bo&apos;lsa, ball umumiy o&apos;rtachaga &laquo;tortiladi&raquo;.
          </p>
          <div className="overflow-x-auto rounded-ios-md bg-brand-900 px-4 py-3 font-mono text-footnote text-slate-100">
            WR = (v / (v + m)) · R + (m / (v + m)) · C
          </div>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            <li>
              <b className="text-brand-900">R</b> — startapning o&apos;rtacha
              reytingi (0–10)
            </li>
            <li>
              <b className="text-brand-900">v</b> — ovozlar (baholar) soni
            </li>
            <li>
              <b className="text-brand-900">m</b> = {formula.m} — ishonchli
              bo&apos;lish uchun zarur ovoz
            </li>
            <li>
              <b className="text-brand-900">C</b> = {formula.c.toFixed(2)} —
              barcha startaplar o&apos;rtachasi
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
