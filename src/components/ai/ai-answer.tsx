'use client';

import { Fragment, useState, type CSSProperties } from 'react';
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
import { YechimOrb } from './yechim-mark';
import { AiMatchCard } from './ai-match-card';
import { aiApi, getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { AiConversationTurn, AiSolveResult } from '@/types';

/** Javob varag'i uchun yetarli shakl — jonli javob ham, tarixdagisi ham. */
export type AnswerData = Pick<
  AiSolveResult,
  | 'queryId'
  | 'answer'
  | 'matches'
  | 'relatedProblems'
  | 'steps'
  | 'noSolution'
  | 'draft'
> &
  Partial<Pick<AiConversationTurn, 'feedback'>>;

/**
 * AI javobi — "natija varag'i".
 *
 * Ierarxiya ataylab shu tartibda: javob matni → topilgan loyihalar →
 * keyingi qadamlar → o'xshash muhokamalar → baho. Foydalanuvchi eng
 * muhim savolga ("yechim bormi?") birinchi javob oladi.
 *
 * Motion: javob **so'zma-so'z materializatsiya** bo'ladi (fikr shakllanishi),
 * bloklar esa blur'dan fokusga ketma-ket keladi. Harakat FAQAT javob
 * kelgan lahzada bor — tarixdan ochilgan javob (`animate=false`) darhol
 * to'liq ko'rinadi, chunki uni qayta "yozib berish" — soxta taassurot.
 */
export function AiAnswer({
  data,
  animate,
  onPublish,
}: {
  data: AnswerData;
  animate: boolean;
  onPublish: () => void;
}) {
  const [vote, setVote] = useState<'up' | 'down' | null>(data.feedback ?? null);

  async function sendFeedback(value: 'up' | 'down') {
    if (vote || !data.queryId) return;
    setVote(value);
    try {
      await aiApi.feedback(data.queryId, value);
    } catch (err) {
      setVote(null);
      toast.error(getErrorMessage(err, 'Baho yuborilmadi'));
    }
  }

  return (
    <div className="flex gap-3.5">
      <YechimOrb
        size={34}
        state={animate ? 'found' : 'idle'}
        className="mt-0.5"
      />

      <div className="min-w-0 flex-1 space-y-5">
        <p className="whitespace-pre-line text-body leading-relaxed text-[color:var(--yz-ink)]">
          <Materialize text={data.answer} animate={animate} />
        </p>

        {/* ── Topilgan loyihalar ─────────────────────────────────── */}
        {data.matches.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-caption-1 font-semibold uppercase tracking-[0.07em] text-[color:var(--yz-ink-3)]">
              {data.matches.length} ta mos loyiha
            </h3>
            {data.matches.map((m, i) => (
              <AiMatchCard
                key={m.startup.id}
                match={m}
                index={i}
                animate={animate}
              />
            ))}
          </section>
        )}

        {/* ── Yechim topilmadi → e'lon qilish ────────────────────── */}
        {data.noSolution && data.draft && (
          <section
            className={cn(
              'yz-card yz-sheen overflow-hidden p-5',
              animate && 'yz-rise',
            )}
            style={{ '--d': '0.18s' } as CSSProperties}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[color:var(--yz-mint)]/15 text-[color:var(--yz-mint)]">
                <Lightbulb className="h-5 w-5" />
              </span>
              <p className="min-w-0 text-subhead leading-relaxed text-[color:var(--yz-ink-2)]">
                <span className="font-semibold text-[color:var(--yz-ink)]">
                  Platformada bunga tayyor yechim yo‘q.
                </span>{' '}
                Muammoingizni hamjamiyatga qo‘ysak — ko‘rib chiqishadi va
                yechim taklif qilishadi. Matnni tayyorlab qo‘ydim.
              </p>
            </div>
            <button
              type="button"
              onClick={onPublish}
              className="yz-send mt-4 flex h-11 w-full items-center justify-center rounded-full px-5 text-callout font-semibold"
            >
              Ko‘rib chiqib joylash
            </button>
          </section>
        )}

        {/* ── Keyingi qadamlar ───────────────────────────────────── */}
        {data.steps.length > 0 && (
          <section
            className={cn('space-y-2', animate && 'yz-rise')}
            style={{ '--d': '0.24s' } as CSSProperties}
          >
            <h3 className="text-caption-1 font-semibold uppercase tracking-[0.07em] text-[color:var(--yz-ink-3)]">
              Keyingi qadamlar
            </h3>
            <ol className="yz-card space-y-3 p-4">
              {data.steps.map((step, i) => (
                <li key={i} className="relative flex gap-3">
                  {i < data.steps.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute -bottom-3 left-[11px] top-7 w-px bg-white/10"
                    />
                  )}
                  <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--yz-blue)]/16 text-caption-1 font-semibold text-[color:var(--yz-blue)]">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-subhead leading-relaxed text-[color:var(--yz-ink-2)]">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ── Platformadagi o'xshash muhokamalar ─────────────────── */}
        {data.relatedProblems.length > 0 && (
          <section
            className={cn('space-y-2', animate && 'yz-rise')}
            style={{ '--d': '0.3s' } as CSSProperties}
          >
            <h3 className="text-caption-1 font-semibold uppercase tracking-[0.07em] text-[color:var(--yz-ink-3)]">
              Shu mavzudagi muhokamalar
            </h3>
            <div className="yz-card divide-y divide-white/[0.07] overflow-hidden">
              {data.relatedProblems.map((p) => (
                <Link
                  key={p.id}
                  href={`/problems/${p.id}`}
                  className="yz-row flex items-center gap-3 rounded-none px-4 py-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[color:var(--yz-ink-3)]">
                    <MessageSquare className="h-[15px] w-[15px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-subhead font-medium text-[color:var(--yz-ink)]">
                      {p.title}
                    </span>
                    <span className="block text-caption-1 text-[color:var(--yz-ink-3)]">
                      {p.solutionCount > 0
                        ? `${p.solutionCount} ta yechim`
                        : 'Hali yechim yo‘q'}
                    </span>
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-[color:var(--yz-ink-3)]"
                    strokeWidth={2.5}
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Baho — matnsiz, ikki tinch tugma ───────────────────── */}
        {data.queryId && (
          <div className="flex items-center gap-1 pt-0.5">
            <button
              type="button"
              onClick={() => void sendFeedback('up')}
              aria-label="Javob foydali"
              aria-pressed={vote === 'up'}
              disabled={!!vote}
              className="yz-btn flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--yz-ink-3)] disabled:opacity-100"
            >
              {vote === 'up' ? (
                <ThumbsUpFill className="h-[17px] w-[17px] text-[color:var(--yz-mint)]" />
              ) : (
                <ThumbsUp className="h-[17px] w-[17px]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => void sendFeedback('down')}
              aria-label="Javob foydali emas"
              aria-pressed={vote === 'down'}
              disabled={!!vote}
              className="yz-btn flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--yz-ink-3)] disabled:opacity-100"
            >
              {vote === 'down' ? (
                <ThumbsDownFill className="h-[17px] w-[17px] text-[color:var(--yz-ink)]" />
              ) : (
                <ThumbsDown className="h-[17px] w-[17px]" />
              )}
            </button>
            {vote && (
              <Check
                className="ml-0.5 h-4 w-4 text-[color:var(--yz-mint)]"
                strokeWidth={2.5}
                aria-label="Baho qabul qilindi"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Matnni **so'zma-so'z** ochish. Haqiqiy token-streaming emas (server javobi
 * butun keladi), lekin fikr tug'ilishining hissini beradi va DOM bir marta
 * yoziladi → maket sakramaydi (CLS 0).
 *
 * ⚠️ So'zlar orasida HAQIQIY probel matn tugunlari qoladi: `inline-block`
 * span'lar ketma-ket yopishtirilsa brauzerda satr uzilish nuqtasi qolmaydi
 * va uzun javob o'ralmay ekrandan chiqib ketadi.
 */
function Materialize({ text, animate }: { text: string; animate: boolean }) {
  if (!animate) return <>{text}</>;
  let index = 0;
  return (
    <>
      {text.split('\n').map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split(/\s+/).map((word, wi) =>
            word ? (
              <Fragment key={wi}>
                {wi > 0 && ' '}
                <span
                  className="yz-word"
                  // Kechikish cheklangan: uzun javobning oxiri kutib
                  // qolmasin (44 × 24ms ≈ 1s — jonli, lekin sekin emas).
                  style={{ '--i': Math.min(index++, 44) } as CSSProperties}
                >
                  {word}
                </span>
              </Fragment>
            ) : null,
          )}
        </Fragment>
      ))}
    </>
  );
}
