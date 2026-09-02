'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { ArrowLeft, Clock, Plus, X } from '@/components/icons';
import { LogoMark } from '@/components/brand/logo-mark';
import { AiComposer } from './ai-composer';
import { AiHistory } from './ai-history';
import { AiPublishSheet, DRAFT_STORAGE_KEY } from './ai-publish-sheet';
import { AiStream, type Turn } from './ai-stream';
import { AiWelcome } from './ai-welcome';
import { YechimMark } from './yechim-mark';
import { aiApi, getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import type { AiDraft } from '@/types';

/**
 * "Yechim AI" Studio — ekranning o'zi.
 *
 * Maket (mahsulotning qolgan qismidan ATAYLAB boshqacha): chapda suhbatlar
 * tarixi (rail), o'ngda oqim va pastda buyruq paneli. Sahifa scroll
 * BO'LMAYDI — faqat oqim suriladi, shuning uchun kirish maydoni doim
 * ko'zda va uning ostida bo'sh joy qolmaydi.
 *
 * Holat boshqaruvi:
 *  · `threadRef` — joriy suhbat ID'sining DOIMIY manbai. `useState` bir
 *    tikda yangilanmagani uchun tez ketma-ket savollarda eskirgan closure
 *    ikkinchi savolni "yangi suhbat" qilib yuborardi.
 *  · Tarixdan suhbat ochilganda javoblar animatsiyasiz ko'rsatiladi
 *    (`fresh: false`) — eskisini qayta "yozib berish" soxta bo'lardi.
 */
export function AiWorkspace() {
  const params = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, hasHydrated } = useAuthStore();

  const [threadId, setThreadId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [opening, setOpening] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [publish, setPublish] = useState<{
    draft: AiDraft;
    queryId?: string;
  } | null>(null);

  const threadRef = useRef<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  const { data: status } = useQuery({
    queryKey: ['ai-status'],
    queryFn: () => aiApi.status(),
    staleTime: 60_000,
    retry: 0,
  });

  const history = useInfiniteQuery({
    queryKey: ['ai-conversations'],
    queryFn: ({ pageParam }) =>
      aiApi.conversations({ limit: 30, before: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!token,
    staleTime: 30_000,
  });
  const conversations = history.data?.pages.flatMap((p) => p.data) ?? [];

  const busy = turns.some((t) => t.status === 'thinking');
  const disabled = status?.enabled === false;

  /** Suhbatni almashtirish + URL sinxroni (yangilashda o'sha suhbat ochiladi). */
  const setThread = useCallback((id: string | null) => {
    threadRef.current = id;
    setThreadId(id);
    // `router.replace` sahifani qayta render qilardi (oqim titrardi) —
    // shuning uchun to'g'ridan-to'g'ri History API (yangi yozuv qo'shmaydi:
    // "ortga" tugmasi foydalanuvchini saytga qaytaradi).
    window.history.replaceState(null, '', id ? `/ai?c=${id}` : '/ai');
  }, []);

  /**
   * Mehmonni ro'yxatdan o'tishga yuboradi va savolini YO'QOTMAYDI:
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

  const ask = useCallback(
    async (question: string, source: 'text' | 'voice' = 'text') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setTurns((prev) => [
        ...prev,
        { id, question, status: 'thinking', fresh: true },
      ]);
      try {
        const result = await aiApi.solve(
          question,
          source,
          threadRef.current ?? undefined,
        );
        setTurns((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, status: 'done', data: result, fresh: true }
              : t,
          ),
        );
        if (!threadRef.current && result.conversationId) {
          setThread(result.conversationId);
        }
        // Tarixda yangi suhbat/yangi vaqt ko'rinsin
        void queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
        if (threadRef.current) {
          // Ochilgan suhbatning keshi eskirdi — keyingi ochilishda yangilanadi
          queryClient.removeQueries({
            queryKey: ['ai-conversation', threadRef.current],
          });
        }
      } catch (err) {
        setTurns((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: 'error',
                  error: getErrorMessage(
                    err,
                    'Javob olinmadi. Bir oz kutib, qayta urinib ko‘ring.',
                  ),
                }
              : t,
          ),
        );
      }
    },
    [queryClient, setThread],
  );

  const openConversation = useCallback(
    async (id: string) => {
      setDrawer(false);
      if (threadRef.current === id) return;
      setThread(id);
      setTurns([]);
      setOpening(true);
      try {
        const detail = await queryClient.fetchQuery({
          queryKey: ['ai-conversation', id],
          queryFn: () => aiApi.conversation(id),
          staleTime: 60_000,
        });
        // Foydalanuvchi kutish paytida boshqa suhbatga o'tgan bo'lishi
        // mumkin — eskirgan javob ekranni bosib ketmasin.
        if (threadRef.current !== id) return;
        setTurns(
          detail.turns.map((t) => ({
            id: t.queryId,
            question: t.question,
            status: 'done' as const,
            fresh: false,
            data: {
              queryId: t.queryId,
              answer: t.answer,
              matches: t.matches,
              relatedProblems: t.relatedProblems,
              steps: t.steps,
              noSolution: t.noSolution,
              draft: t.draft,
              feedback: t.feedback,
            },
          })),
        );
      } catch (err) {
        if (threadRef.current === id) setThread(null);
        toast.error(getErrorMessage(err, 'Suhbatni ochib bo‘lmadi'));
      } finally {
        setOpening(false);
      }
    },
    [queryClient, setThread],
  );

  const newThread = useCallback(() => {
    setDrawer(false);
    setThread(null);
    setTurns([]);
  }, [setThread]);

  const removeConversation = useCallback(
    async (id: string) => {
      try {
        await aiApi.removeConversation(id);
        if (threadRef.current === id) {
          setThread(null);
          setTurns([]);
        }
        queryClient.removeQueries({ queryKey: ['ai-conversation', id] });
        void queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      } catch (err) {
        toast.error(getErrorMessage(err, 'Suhbatni o‘chirib bo‘lmadi'));
      }
    },
    [queryClient, setThread],
  );

  /* Bosh sahifadan (yoki register'dan keyin) kelgan savol / suhbat havolasi */
  useEffect(() => {
    if (!hasHydrated || seeded.current) return;
    seeded.current = true;
    const q = params.get('q')?.trim();
    if (q && q.length >= 8) {
      if (token) void ask(q, 'text');
      else requireAuth(q);
      return;
    }
    const c = params.get('c');
    if (c && token) void openConversation(c);
  }, [params, hasHydrated, token, ask, requireAuth, openConversation]);

  /* Mehmon ro'yxatdan o'tib qaytdi — saqlangan qoralamani tiklaymiz */
  useEffect(() => {
    if (!hasHydrated || !token) return;
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as AiDraft;
      if (draft?.title && draft?.description) setPublish({ draft });
    } catch {
      /* buzuq qiymat — e'tiborsiz */
    }
  }, [hasHydrated, token]);

  /* Yangi javob kelganda pastga siljish (foydalanuvchi kutgan joyga) */
  useEffect(() => {
    if (turns.length > 0) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [turns]);

  /* Mobil drawer: Esc yopadi */
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawer]);

  const guest = hasHydrated && !token;
  const rail = (
    <AiHistory
      items={conversations}
      activeId={threadId}
      loading={history.isLoading}
      hasMore={!!history.hasNextPage}
      onSelect={(id) => void openConversation(id)}
      onNew={newThread}
      onDelete={(id) => void removeConversation(id)}
      onLoadMore={() => void history.fetchNextPage()}
    />
  );

  return (
    <>
      {/* ── Yuqori panel ──────────────────────────────────────────── */}
      <header className="yz-panel relative z-30 flex h-14 shrink-0 items-center gap-2 border-b border-white/[0.07] px-2 sm:px-4">
        <Link
          href="/"
          aria-label="Bosh sahifaga qaytish"
          className="yz-btn flex h-10 items-center gap-1.5 rounded-full pl-1.5 pr-3 text-[color:var(--yz-ink-2)]"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          <LogoMark className="h-[22px] w-[22px]" />
          <span className="hidden text-subhead font-semibold text-[color:var(--yz-ink)] sm:inline">
            MYMarkaz
          </span>
        </Link>

        <span className="mx-1 h-5 w-px shrink-0 bg-white/12" aria-hidden />

        <div className="flex min-w-0 items-center gap-2">
          <YechimMark size={19} />
          <h1 className="truncate text-subhead font-semibold text-[color:var(--yz-ink)]">
            Yechim AI
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-1">
          {!guest && (
            <>
              <button
                type="button"
                onClick={() => setDrawer(true)}
                aria-label="Suhbatlar tarixi"
                className="yz-btn flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--yz-ink-2)] lg:hidden"
              >
                <Clock className="h-[21px] w-[21px]" />
              </button>
              <button
                type="button"
                onClick={newThread}
                aria-label="Yangi suhbat"
                className="yz-btn flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--yz-ink-2)] lg:hidden"
              >
                <Plus className="h-[21px] w-[21px]" strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ── Tarix (desktop) ───────────────────────────────────── */}
        {!guest && (
          <aside className="hidden w-[272px] shrink-0 border-r border-white/[0.07] lg:block">
            {rail}
          </aside>
        )}

        {/* ── Tarix (mobil — ustki qatlam) ──────────────────────── */}
        {drawer && !guest && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Yopish"
              onClick={() => setDrawer(false)}
              className="absolute inset-0 bg-black/60 animate-fade-in"
            />
            <div className="yz-panel absolute inset-y-0 left-0 flex w-[86%] max-w-[320px] flex-col border-r border-white/10 shadow-modal yz-drawer">
              <div className="flex h-14 shrink-0 items-center justify-between px-3">
                <p className="text-subhead font-semibold text-[color:var(--yz-ink)]">
                  Suhbatlar
                </p>
                <button
                  type="button"
                  onClick={() => setDrawer(false)}
                  aria-label="Yopish"
                  className="yz-btn flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--yz-ink-2)]"
                >
                  <X className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </div>
              <div className="min-h-0 flex-1">{rail}</div>
            </div>
          </div>
        )}

        {/* ── Oqim + kirish maydoni ─────────────────────────────── */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div
            className={cn(
              'flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-2 pt-6 sm:px-6',
              // Bo'sh holat markazda: `safe` — kontent sig'masa TEPA
              // kesilmaydi (oddiy scroll bo'ladi).
              turns.length === 0 && '[justify-content:safe_center]',
            )}
          >
            {/* Qisqa suhbat oqim TEPASIDA emas, kirish maydoni YONIDA
                turadi (Telegram/ChatGPT xulqi): ko'z allaqachon pastda. */}
            <div
              className={cn(
                'mx-auto w-full max-w-[46rem]',
                // Auto margin faqat suhbat bor holatda: bo'sh holatda u
                // `justify-content` ni bosib, welcome'ni pastga tortardi.
                turns.length > 0 && 'mt-auto',
              )}
            >
              {opening ? (
                <ThreadSkeleton />
              ) : turns.length === 0 ? (
                <AiWelcome
                  onPick={(q) => (token ? void ask(q) : requireAuth(q))}
                  disabled={disabled}
                />
              ) : (
                <AiStream
                  turns={turns}
                  onRetry={(turn) => {
                    setTurns((prev) => prev.filter((t) => t.id !== turn.id));
                    void ask(turn.question);
                  }}
                  onPublish={(turn) =>
                    turn.data?.draft &&
                    setPublish({
                      draft: turn.data.draft,
                      queryId: turn.data.queryId,
                    })
                  }
                />
              )}
              <div ref={endRef} className="h-1" />
            </div>
          </div>

          <div className="relative shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-6 sm:pb-4">
            <span aria-hidden className="yz-horizon" />
            <div className="mx-auto w-full max-w-[46rem]">
              {disabled ? (
                <p className="yz-card px-4 py-3.5 text-center text-subhead text-[color:var(--yz-ink-2)]">
                  Yechim AI hozircha o‘chirilgan. Tez orada qaytadi.
                </p>
              ) : (
                <>
                  <AiComposer
                    onSubmit={(q, s) => (token ? void ask(q, s) : requireAuth(q))}
                    onRequireAuth={guest ? requireAuth : undefined}
                    disabled={busy}
                  />
                  {/* Faqat KERAK bo'lganda gapiradigan qator: limit tugay
                      deganda yoki mehmon uchun. Aks holda — jim. */}
                  {guest ? (
                    <p className="mt-2 text-center text-caption-2 text-[color:var(--yz-ink-3)]">
                      Ro‘yxatdan o‘ting — bir daqiqada, bepul
                    </p>
                  ) : (
                    status &&
                    status.remaining <= 5 && (
                      <p className="mt-2 text-center text-caption-2 text-[color:var(--yz-ink-3)]">
                        Bugun yana {status.remaining} ta so‘rov qoldi
                      </p>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {publish && (
        <AiPublishSheet
          open
          onClose={() => setPublish(null)}
          draft={publish.draft}
          queryId={publish.queryId}
        />
      )}
    </>
  );
}

/** Tarixdagi suhbat ochilayotgan payt — javob varag'ining shakli. */
function ThreadSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      {[0, 1].map((i) => (
        <div key={i} className="space-y-5">
          <div className="flex justify-end">
            <span className="h-10 w-2/5 rounded-[20px] rounded-br-[7px] bg-white/[0.07]" />
          </div>
          <div className="yz-scan yz-card space-y-2.5 p-4">
            <span className="block h-3 w-[88%] rounded-full bg-white/10" />
            <span className="block h-3 w-[64%] rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
