'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import {
  Check,
  ChevronRight,
  Lightbulb,
  MessageSquare,
  ThumbsDown,
  ThumbsDownFill,
  ThumbsUp,
  ThumbsUpFill,
} from '@/components/icons';
import { YechimMark } from './yechim-mark';
import { AiMatchCard } from './ai-match-card';
import { aiApi, getErrorMessage } from '@/lib/api';
import type { AiSolveResult } from '@/types';

/**
 * AI javobi — "natija varag'i".
 *
 * Ierarxiya (ataylab shu tartibda): javob matni → topilgan loyihalar →
 * amaliy qadamlar → o'xshash muhokamalar → baho. Foydalanuvchi eng muhim
 * savolga ("yechim bormi?") birinchi javob oladi.
 *
 * Motion: javob **materializatsiya** bo'ladi — mark bir marta "topildi"
 * portlashini beradi, matn bo'ylab yorug'lik yugurib uni ochadi
 * (`.ai-reveal`), bloklar esa blur'dan fokusga ketma-ket keladi. Hech
 * qanday takrorlanuvchi (cheksiz) animatsiya yo'q: harakat faqat javob
 * kelgan LAHZAda bor, keyin varaq mutlaqo tinch.
 */
export function AiAnswer({
  result,
  onPublish,
}: {
  result: AiSolveResult;
  onPublish: () => void;
}) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);

  async function sendFeedback(value: 'up' | 'down') {
    if (vote || !result.queryId) return;
    setVote(value);
    try {
      await aiApi.feedback(result.queryId, value);
    } catch (err) {
      setVote(null);
      toast.error(getErrorMessage(err, 'Baho yuborilmadi'));
    }
  }

  return (
    <div className="flex gap-3">
      <YechimMark size={30} state="found" className="mt-0.5" />

      <div className="min-w-0 flex-1 space-y-5">
        {/* ── Javob matni — yorug'lik bilan ochiladi ─────────────── */}
        <p className="ai-reveal whitespace-pre-line text-body leading-relaxed text-brand-900">
          {result.answer}
        </p>

        {/* ── Topilgan loyihalar ──────────────────────────────────── */}
        {result.matches.length > 0 && (
          <section>
            <h3 className="ios-section-header !px-0">
              Sizga mos {result.matches.length} ta loyiha
            </h3>
            <div className="space-y-2">
              {result.matches.map((m, i) => (
                <AiMatchCard key={m.startup.id} match={m} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── Yechim topilmadi → e'lon qilish taklifi ─────────────── */}
        {result.noSolution && result.draft && (
          <section
            className="ai-focus-in ai-aura overflow-hidden rounded-ios-2xl p-5"
            style={{ '--ai-delay': '0.14s' } as CSSProperties}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-brand-900 text-white">
                <Lightbulb className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-callout font-semibold text-brand-900">
                  Hozircha bunga tayyor yechim topilmadi
                </p>
                <p className="mt-1 text-subhead leading-relaxed text-slate-600">
                  Muammoingizni platformaga qo‘yamizmi? Hamjamiyat uni ko‘radi,
                  muhokama qiladi va yechim taklif etadi — shu yerdan real loyihalar
                  tug‘iladi. Matnni siz uchun tayyorlab qo‘ydim, faqat ko‘rib chiqing.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onPublish}
              className="tappable-scale mt-4 flex h-11 w-full items-center justify-center rounded-full bg-accent-600 px-5 text-callout font-semibold text-white active:bg-accent-700"
            >
              Muammoni ko‘rib chiqish va joylash
            </button>
          </section>
        )}

        {/* ── Amaliy qadamlar — vertikal timeline ─────────────────── */}
        {result.steps.length > 0 && (
          <section
            className="ai-focus-in"
            style={{ '--ai-delay': '0.2s' } as CSSProperties}
          >
            <h3 className="ios-section-header !px-0">Shu bugun qila oladiganingiz</h3>
            <ol className="relative space-y-3 rounded-ios-xl bg-white p-4">
              {result.steps.map((step, i) => (
                <li key={i} className="relative flex gap-3">
                  {/* Qadamlarni bog'lovchi chiziq — oxirgisidan keyin yo'q */}
                  {i < result.steps.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute -bottom-3 left-[11px] top-7 w-px bg-separator"
                    />
                  )}
                  <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-50 text-caption-1 font-semibold text-accent-700">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-subhead leading-relaxed text-slate-700">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ── Platformadagi o'xshash muhokamalar ──────────────────── */}
        {result.relatedProblems.length > 0 && (
          <section
            className="ai-focus-in"
            style={{ '--ai-delay': '0.26s' } as CSSProperties}
          >
            <h3 className="ios-section-header !px-0">Shu mavzudagi muhokamalar</h3>
            <div className="ios-list" style={{ '--row-inset': '3.25rem' } as CSSProperties}>
              {result.relatedProblems.map((p) => (
                <Link key={p.id} href={`/problems/${p.id}`} className="ios-row gap-3 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fill-tertiary text-slate-500">
                    <MessageSquare className="h-[15px] w-[15px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-subhead font-medium text-brand-900">
                      {p.title}
                    </span>
                    <span className="block text-caption-1 text-slate-500">
                      {p.solutionCount > 0
                        ? `${p.solutionCount} ta yechim taklif qilingan`
                        : 'Hali yechim yo‘q — birinchi bo‘ling'}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" strokeWidth={2.5} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Baho ─────────────────────────────────────────────────── */}
        <div
          className="ai-focus-in flex items-center gap-1.5 pt-0.5"
          style={{ '--ai-delay': '0.32s' } as CSSProperties}
        >
          <span className="text-caption-1 text-slate-400">Javob foydali bo‘ldimi?</span>
          <button
            type="button"
            onClick={() => void sendFeedback('up')}
            aria-label="Foydali"
            aria-pressed={vote === 'up'}
            disabled={!!vote}
            className="tappable flex h-8 w-8 items-center justify-center rounded-full text-slate-400 disabled:opacity-100"
          >
            {vote === 'up' ? (
              <ThumbsUpFill className="h-[17px] w-[17px] text-accent-600" />
            ) : (
              <ThumbsUp className="h-[17px] w-[17px]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => void sendFeedback('down')}
            aria-label="Foydali emas"
            aria-pressed={vote === 'down'}
            disabled={!!vote}
            className="tappable flex h-8 w-8 items-center justify-center rounded-full text-slate-400 disabled:opacity-100"
          >
            {vote === 'down' ? (
              <ThumbsDownFill className="h-[17px] w-[17px] text-slate-600" />
            ) : (
              <ThumbsDown className="h-[17px] w-[17px]" />
            )}
          </button>
          {vote && (
            <span className="ai-focus-in flex items-center gap-1 text-caption-1 text-slate-400">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> Rahmat
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
