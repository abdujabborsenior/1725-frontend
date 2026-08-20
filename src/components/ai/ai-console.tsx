'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { AlertCircle, RefreshCw } from '@/components/icons';
import { AiComposer } from './ai-composer';
import { AiAnswer } from './ai-answer';
import { AiWelcome } from './ai-welcome';
import { AiThinkingPanel } from './ai-thinking';
import { AiPublishSheet, DRAFT_STORAGE_KEY } from './ai-publish-sheet';
import { aiApi, getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import type { AiDraft, AiSolveResult } from '@/types';

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
              ? { ...t, status: 'error', error: getErrorMessage(err, 'Javob olinmadi. Bir oz kutib, qayta urinib ko‘ring.') }
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
      {/* Kontent tabiiy oqimda: composer undan darhol keyin keladi (bo'sh
          holatda "osilib qolgan" input yo'q), javob kelgach esa u sahifa
          pastiga yopishadi. */}
      <div className="flex-1 space-y-6">
        {turns.length === 0 ? (
          <AiWelcome
            onPick={(q) => (token ? void ask(q) : requireAuth(q))}
            disabled={disabled}
          />
        ) : (
          turns.map((turn) => (
            <div key={turn.id} className="space-y-4">
              {/* Savol — iMessage "chiquvchi" pufagi (spring bilan chiqadi) */}
              <div className="flex justify-end">
                <p className="ai-ask bubble bubble-out relative max-w-[85%] whitespace-pre-line px-4 py-2.5 text-body leading-snug sm:max-w-[70%]">
                  {turn.question}
                </p>
              </div>

              {turn.status === 'thinking' && <AiThinkingPanel />}

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
          'sticky -mx-4 mt-6 bg-surface-soft px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:-mx-2 md:bottom-0 md:px-2',
          token ? 'bottom-16' : 'bottom-0',
        )}
      >
        {/* Kontent composer ostiga YUMSHOQ kirib ketsin: qattiq chekka
            "kesilgan matn" taassurotini berardi (yarim ko'rinadigan qator). */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-surface-soft to-transparent"
        />
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
