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
    <div className="rounded-ios-lg border border-slate-200 bg-surface-soft">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left"
      >
        <Info className="h-4 w-4 shrink-0 text-iris-500" />
        <span className="flex-1 text-subhead font-semibold text-brand-900">
          O&apos;rinlar qanday hisoblanadi?
        </span>
        <span className="hidden text-footnote text-slate-400 sm:inline">
          O&apos;rtacha = {formula.c.toFixed(2)} · ishonch ostonasi (m) ={' '}
          {formula.m}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-slate-400 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <div className="space-y-3 border-t border-slate-200 px-4 py-4 text-subhead text-slate-600">
          <p>
            Baholar <b>10&nbsp;ballik</b> shkalada. Oddiy o&apos;rtacha adolatsiz
            bo&apos;lardi: bitta 10&nbsp;ball olgan startap, 1000 ta ovozli
            9.6&nbsp;li startapdan yuqori chiqib ketardi. Shuning uchun biz IMDB
            Top-250 kabi <b>Bayes (vaznli) reyting</b> ishlatamiz — ovozlar kam
            bo&apos;lsa, ball umumiy o&apos;rtachaga &laquo;tortiladi&raquo;.
          </p>
          <div className="overflow-x-auto rounded-ios-md bg-brand-900 px-4 py-3 font-mono text-[13px] text-slate-100">
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
