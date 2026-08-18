'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { ArrowUp, Mic, Spinner, StopCircleFill, X } from '@/components/icons';
import { MAX_SECONDS, useWavRecorder } from '@/lib/wav-recorder';
import { aiApi, getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

const MAX_CHARS = 1200;

/**
 * AI kirish maydoni — iOS kapsula composer (chat composer bilan bir tilda).
 *
 * Ikki rejim:
 *  · **Matn** — o'sib boruvchi textarea; Enter yuboradi, Shift+Enter yangi qator.
 *  · **Ovoz** — mikrofon bosilganda jonli to'lqin bilan yozuv rejimi ochiladi;
 *    to'xtatilganda audio serverga o'giriladi va **matn maydoniga tushadi**
 *    (darhol yuborilmaydi — foydalanuvchi ko'rib, tuzatib yuborishi mumkin).
 *    Bu ataylab: nutq tanish 100% aniq emas, matnni tasdiqlash — hurmat.
 */
export function AiComposer({
  onSubmit,
  onRequireAuth,
  disabled,
  autoFocus,
}: {
  onSubmit: (question: string, source: 'text' | 'voice') => void;
  /**
   * Berilgan bo'lsa — foydalanuvchi kirmagan: mikrofon **umuman ochilmaydi**
   * (ruxsat so'ralmaydi, ovoz yozilmaydi), o'rniga ro'yxatdan o'tishga
   * yo'naltiriladi. Yozilgan matn yo'qolmasin deb u ham uzatiladi.
   */
  onRequireAuth?: (question?: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState('');
  const [fromVoice, setFromVoice] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const recorder = useWavRecorder();

  // Balandlikni kontentga moslash (maks ~5 qator)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  // Maksimal davomiylikda avtomatik to'xtash (fayl hajmi cheklangan qoladi)
  useEffect(() => {
    if (recorder.recording && recorder.seconds >= MAX_SECONDS) void finishRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.recording, recorder.seconds]);

  function submit() {
    const q = value.trim();
    if (q.length < 8 || disabled) return;
    onSubmit(q, fromVoice ? 'voice' : 'text');
    setValue('');
    setFromVoice(false);
  }

  async function startRecording() {
    // Kirmagan foydalanuvchidan mikrofon ruxsatini so'ramaymiz — bu bekorga
    // bezovta qilish bo'lardi (baribir yubora olmaydi).
    if (onRequireAuth) {
      onRequireAuth(value);
      return;
    }
    const ok = await recorder.start();
    if (!ok) toast.error(recorder.error ?? 'Mikrofonni ochib bo‘lmadi');
  }

  async function finishRecording() {
    const res = recorder.stop();
    if (!res) return;
    setTranscribing(true);
    try {
      const { text } = await aiApi.transcribe(res.blob);
      setValue((prev) => (prev ? `${prev.trim()} ${text}` : text).slice(0, MAX_CHARS));
      setFromVoice(true);
      ref.current?.focus();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Ovozni matnga o‘girib bo‘lmadi'));
    } finally {
      setTranscribing(false);
    }
  }

  /* ── Yozuv rejimi ────────────────────────────────────────────── */
  if (recorder.recording) {
    return (
      <div className="ai-aura flex items-center gap-3 rounded-full px-4 py-2.5 shadow-card-hover" data-state="thinking">
        <button
          type="button"
          onClick={recorder.cancel}
          aria-label="Bekor qilish"
          className="tappable flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fill-tertiary text-slate-500"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={2.5} />
        </button>

        <span className="flex h-2 w-2 shrink-0 rounded-full bg-rose-500 motion-safe:animate-pulse" />
        <span className="shrink-0 text-subhead font-medium tabular-nums text-brand-900">
          {formatTime(recorder.seconds)}
        </span>

        {/* Jonli to'lqin — oxirgi amplituda bo'yicha */}
        <div className="flex h-7 min-w-0 flex-1 items-center gap-[3px] overflow-hidden text-accent-600">
          {Array.from({ length: 22 }).map((_, i) => (
            <span
              key={i}
              className="ai-bar"
              style={
                {
                  '--amp': Math.max(0.06, recorder.level * (0.55 + Math.sin(i * 1.7) * 0.45)),
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => void finishRecording()}
          aria-label="Yozuvni tugatish"
          className="tappable flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-accent-600"
        >
          <StopCircleFill className="h-8 w-8" />
        </button>
      </div>
    );
  }

  /* ── Oddiy (matn) rejimi ─────────────────────────────────────── */
  const canSend = value.trim().length >= 8 && !disabled;

  return (
    <div
      className="ai-aura flex items-end gap-2 rounded-[22px] px-2 py-2 shadow-card-hover"
      data-state={disabled ? 'thinking' : undefined}
    >
      <textarea
        ref={ref}
        rows={1}
        value={value}
        maxLength={MAX_CHARS}
        disabled={transcribing}
        onChange={(e) => {
          setValue(e.target.value);
          if (fromVoice) setFromVoice(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={
          transcribing ? 'Ovoz matnga o‘girilmoqda…' : 'Muammoingizni yozing yoki aytib bering…'
        }
        aria-label="Muammoingiz"
        className="max-h-[132px] min-h-[36px] flex-1 resize-none bg-transparent px-2.5 py-1.5 text-body leading-snug text-brand-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
      />

      <button
        type="button"
        onClick={() => void startRecording()}
        disabled={disabled || transcribing}
        aria-label="Ovozli xabar"
        className="tappable flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 disabled:opacity-40"
      >
        {transcribing ? (
          <Spinner className="h-[19px] w-[19px] animate-spin" />
        ) : (
          <Mic className="h-[19px] w-[19px]" />
        )}
      </button>

      <button
        type="button"
        onClick={submit}
        disabled={!canSend}
        aria-label="Yuborish"
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[background-color,opacity] duration-150 ease-ios',
          canSend
            ? 'tappable-scale bg-accent-600 text-white active:bg-accent-700'
            : 'bg-fill-tertiary text-slate-400',
        )}
      >
        <ArrowUp className="h-[19px] w-[19px]" strokeWidth={2.6} />
      </button>
    </div>
  );
}

function formatTime(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
