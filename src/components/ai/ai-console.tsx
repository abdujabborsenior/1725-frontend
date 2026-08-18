'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { AlertCircle, Mic, RefreshCw } from '@/components/icons';
import { YechimMark, YechimThinking } from './yechim-mark';
import { AiComposer } from './ai-composer';
import { AiAnswer } from './ai-answer';
import { AiPublishSheet, DRAFT_STORAGE_KEY } from './ai-publish-sheet';
import { aiApi, getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import type { AiDraft, AiSolveResult } from '@/types';

/** Bosh sahifadan tanish bo'lgan namunalar — bo'sh ekranda "nima yozay?" savoliga javob. */
const EXAMPLES = [
  'Ingliz tilini o‘rganmoqchiman, lekin kurslar juda qimmat',
  'Kichik biznesim uchun arzon buxgalteriya yechimi kerak',
  'Qishloqda internet sekin — onlayn darslarga ulana olmayapman',
  'Fermer mahsulotlarimni to‘g‘ridan-to‘g‘ri sotmoqchiman',
];

interface Turn {
  id: string;
  question: string;
  status: 'thinking' | 'done' | 'error';
  result?: AiSolveResult;
  error?: string;
}

/**
 * "Yechim AI" konsoli — muammo → yechim oqimi.
 *
 * UX qarorlari:
 *  · Suhbat **ketma-ketligi** saqlanadi (bir necha muammo ketma-ket so'raladi),
 *    lekin har savol mustaqil — server holat saqlamaydi (stateless, scale).
 *  · Savol o'ngda (iMessage "chiquvchi"), javob esa pufak EMAS — oq varaq:
 *    ichida ro'yxatlar, tugmalar bor, pufakka sig'maydi.
 *  · Composer pastda **yopishqoq** (mobil klaviatura ustida qoladi).
 */
export function AiConsole() {
  const params = useSearchParams();
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [publish, setPublish] = useState<{ draft: AiDraft; queryId?: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  const { data: status } = useQuery({
    queryKey: ['ai-status'],
    queryFn: () => aiApi.status(),
    staleTime: 60_000,
    retry: 0,
  });

  const busy = turns.some((t) => t.status === 'thinking');

  const ask = useCallback(
    async (question: string, source: 'text' | 'voice' = 'text') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setTurns((prev) => [...prev, { id, question, status: 'thinking' }]);
      try {
        const result = await aiApi.solve(question, source);
        setTurns((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: 'done', result } : t)),
        );
      } catch (err) {
        setTurns((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, status: 'error', error: getErrorMessage(err, 'Javob olinmadi') }
              : t,
          ),
        );
      }
    },
    [],
  );

  /**
   * Mehmonni ro'yxatdan o'tishga yuboradi va **savolini yo'qotmaydi**:
   * `?next=/ai?q=<savol>` bilan qaytadi, sahifa esa uni darhol yuboradi.
   */
  const requireAuth = useCallback(
    (question?: string) => {
      const q = question?.trim();
      const next = q && q.length >= 8 ? `/ai?q=${encodeURIComponent(q)}` : '/ai';
      router.push(`/register?next=${encodeURIComponent(next)}`);
    },
    [router],
  );

  // Bosh sahifadan (yoki register'dan keyin) `?q=` bilan kelinganda savol
  // darhol yuboriladi — faqat sessiya tiklangach va foydalanuvchi kirgan bo'lsa.
  useEffect(() => {
    if (!hasHydrated) return;
    const q = params.get('q')?.trim();
    if (seeded.current || !q || q.length < 8) return;
    seeded.current = true;
    if (token) void ask(q, 'text');
    else requireAuth(q);
  }, [params, ask, hasHydrated, token, requireAuth]);

  // Mehmon ro'yxatdan o'tib qaytdi — saqlangan qoralamani tiklaymiz.
  useEffect(() => {
    if (!hasHydrated || !token) return;
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as AiDraft;
      if (draft?.title && draft?.description) setPublish({ draft });
    } catch {
      /* buzuq qiymat — e'tiborsiz qoldiramiz */
    }
  }, [hasHydrated, token]);

  // Yangi javob kelganda pastga siljish (foydalanuvchi kutgan joyga).
  useEffect(() => {
    if (turns.length > 0) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns]);

  const disabled = status?.enabled === false;

  return (
    <div className="flex flex-col">
      {/* min-h faqat bo'sh holat uchun havo beradi; javob kelganda kontent
          undan baland bo'lgani uchun hech qanday "o'lik bo'shliq" qolmaydi. */}
      <div className="min-h-[38vh] flex-1 space-y-6">
        {turns.length === 0 ? (
          <Welcome
            onPick={(q) => (token ? void ask(q) : requireAuth(q))}
            disabled={disabled}
          />
        ) : (
          turns.map((turn) => (
            <div key={turn.id} className="space-y-4">
              {/* Savol — iMessage "chiquvchi" pufagi */}
              <div className="flex justify-end">
                <p className="bubble-out bubble-tail-out max-w-[85%] whitespace-pre-line px-3.5 py-2 text-body text-white sm:max-w-[70%]">
                  {turn.question}
                </p>
              </div>

              {turn.status === 'thinking' && (
                <div className="pl-1 pt-1">
                  <YechimThinking />
                </div>
              )}

              {turn.status === 'error' && (
                <div className="flex items-start gap-3 rounded-ios-xl bg-white p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-subhead text-slate-700">{turn.error}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setTurns((prev) => prev.filter((t) => t.id !== turn.id));
                        void ask(turn.question);
                      }}
                      className="tappable mt-2 inline-flex items-center gap-1.5 text-subhead font-medium text-accent-700"
                    >
                      <RefreshCw className="h-4 w-4" /> Qayta urinish
                    </button>
                  </div>
                </div>
              )}

              {turn.status === 'done' && turn.result && (
                <AiAnswer
                  result={turn.result}
                  onPublish={() =>
                    turn.result?.draft &&
                    setPublish({ draft: turn.result.draft, queryId: turn.result.queryId })
                  }
                />
              )}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* ── Composer — pastda yopishqoq ───────────────────────────
          Mobilda kirgan foydalanuvchida pastki tab bar (fixed, 4rem) bor —
          composer uning ORTIDA qolib ketmasligi uchun shuncha ko'tariladi. */}
      <div
        className={cn(
          'sticky -mx-4 mt-6 bg-surface-soft/80 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:-mx-2 md:bottom-0 md:px-2',
          token ? 'bottom-16' : 'bottom-0',
        )}
      >
        {disabled ? (
          <p className="rounded-ios-xl bg-white px-4 py-3.5 text-center text-subhead text-slate-500">
            Yechim AI hozircha o‘chirilgan. Tez orada qaytadi.
          </p>
        ) : (
          <>
            {/* Mehmon ham yozadi — yuborganda ro'yxatdan o'tishga o'tadi va
                savoli saqlanib qoladi (bo'sh devorga urilmaydi). */}
            <AiComposer
              onSubmit={(q, s) => (token ? void ask(q, s) : requireAuth(q))}
              onRequireAuth={token ? undefined : requireAuth}
              disabled={busy}
            />
            <p className="mt-2 text-center text-caption-2 text-slate-400">
              {!hasHydrated || token
                ? status && status.remaining <= 5
                  ? `Bugun yana ${status.remaining} ta so‘rov qoldi`
                  : 'Yechim AI xato qilishi mumkin — muhim qarorlarni tekshirib ko‘ring'
                : 'Yechim AI dan foydalanish uchun ro‘yxatdan o‘ting — bir daqiqada, bepul'}
            </p>
          </>
        )}
      </div>

      {publish && (
        <AiPublishSheet
          open
          onClose={() => setPublish(null)}
          draft={publish.draft}
          queryId={publish.queryId}
        />
      )}
    </div>
  );
}

/** Bo'sh holat — AI nima qila olishini bir qarashda tushuntiradi. */
function Welcome({ onPick, disabled }: { onPick: (q: string) => void; disabled?: boolean }) {
  return (
    <div className="py-6 text-center">
      <YechimMark size={64} className="mx-auto" />
      <h2 className="mt-5 text-title-2 font-semibold tracking-tight text-brand-900">
        Muammoingizni ayting — yechimini topaman
      </h2>
      <p className="mx-auto mt-2 max-w-md text-callout leading-relaxed text-slate-500">
        Yechim AI platformadagi barcha loyihalarni ko‘rib chiqadi va sizga
        haqiqatan yordam beradiganini topib beradi. Topilmasa — muammoingizni
        hamjamiyatga qo‘yishga yordam beradi.
      </p>

      <p className="mt-7 flex items-center justify-center gap-1.5 text-footnote text-slate-400">
        <Mic className="h-4 w-4" /> Yozishga vaqt yo‘qmi? Aytib bering — o‘zim yozib olaman
      </p>

      {!disabled && (
        <div className="mx-auto mt-4 grid max-w-2xl gap-2 sm:grid-cols-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onPick(example)}
              className="tappable rounded-ios-lg bg-white px-4 py-3 text-left text-subhead leading-snug text-slate-600"
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
