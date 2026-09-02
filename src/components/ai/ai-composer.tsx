'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { ArrowUp, Mic, Spinner, StopCircleFill, X } from '@/components/icons';
import {
  MAX_SECONDS,
  useWavRecorder,
  type RecorderFailure,
} from '@/lib/wav-recorder';
import { aiApi, getErrorMessage } from '@/lib/api';

const MAX_CHARS = 1200;

/** Yozuv yuborilmaganda — sababi bo'yicha aniq maslahat (umumiy xato emas). */
const FAILURE_HINT: Record<RecorderFailure, string> = {
  empty: 'Yozuv olinmadi. Mikrofonni bosib, gapirib bo‘lgach to‘xtating.',
  'too-short': 'Juda qisqa bo‘ldi — kamida bir gap ayting.',
  silent:
    'Ovoz eshitilmadi. Mikrofon ochiqligini tekshiring va yaqinroq gapiring.',
};

/**
 * Studio kirish maydoni — "buyruq paneli".
 *
 * Ikki rejim:
 *  · **Matn** — o'sib boruvchi textarea; Enter yuboradi, Shift+Enter yangi qator.
 *  · **Ovoz** — mikrofon bosilganda jonli to'lqin bilan yozuv rejimi ochiladi;
 *    to'xtatilganda audio matnga o'giriladi va **maydonga tushadi** (darhol
 *    yuborilmaydi — nutq tanish 100% aniq emas, matnni tasdiqlash — hurmat).
 *
 * ⚠️ O'lcham intizomi: maydon bir qator balandligida turadi va faqat YOZILGAN
 * matn bilan o'sadi. Placeholder bo'yicha o'sish mumkin emas — Chrome'da
 * `scrollHeight` placeholder o'ralganini ham hisoblaydi (mobilda maydon ikki
 * qator bo'lib ketardi).
 */
export function AiComposer({
  onSubmit,
  onRequireAuth,
  disabled,
  autoFocus,
}: {
  onSubmit: (question: string, source: 'text' | 'voice') => void;
  /**
   * Berilgan bo'lsa — foydalanuvchi kirmagan: mikrofon UMUMAN ochilmaydi
   * (ruxsat bekorga so'ralmaydi), o'rniga ro'yxatdan o'tishga yo'naltiriladi.
   * Yozilgan matn yo'qolmasin deb u ham uzatiladi.
   */
  onRequireAuth?: (question?: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState('');
  const [fromVoice, setFromVoice] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  /** Yozuv davomida hech bo'lmasa bir marta ovoz eshitildimi. */
  const [heard, setHeard] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const finishing = useRef(false);
  const recorder = useWavRecorder();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = '';
    if (!value) return; // bo'sh maydon — CSS'dagi bir qator balandligi
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  // Mikrofon jim qolayotganini DARHOL ko'rsatamiz — foydalanuvchi 90 soniya
  // gapirib bo'lib, oxirida "ovoz yo'q" xabarini ko'rmasin.
  useEffect(() => {
    if (!recorder.recording) {
      setHeard(false);
      return;
    }
    if (recorder.level > 0.02) setHeard(true);
  }, [recorder.level, recorder.recording]);

  useEffect(() => {
    if (recorder.recording && recorder.seconds >= MAX_SECONDS) {
      void finishRecording();
    }
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
    if (onRequireAuth) {
      onRequireAuth(value);
      return;
    }
    const ok = await recorder.start();
    if (!ok) toast.error(recorder.error ?? 'Mikrofonni ochib bo‘lmadi');
  }

  async function finishRecording() {
    if (finishing.current) return; // avto-to'xtash va bosish bir vaqtda
    finishing.current = true;
    const res = await recorder.stop();
    finishing.current = false;
    // Jim / juda qisqa yozuv serverga UMUMAN yuborilmaydi: model bunday
    // audioda matn "o'ylab topadi" — foydalanuvchi aytmagan gapini ko'radi.
    if (!res.ok) {
      if (res.reason !== 'empty' || !recorder.error) {
        toast.error(FAILURE_HINT[res.reason]);
      }
      return;
    }
    setTranscribing(true);
    try {
      const { text } = await aiApi.transcribe(res.result.blob);
      setValue((prev) =>
        (prev ? `${prev.trim()} ${text}` : text).slice(0, MAX_CHARS),
      );
      setFromVoice(true);
      ref.current?.focus();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Ovozni matnga o‘girib bo‘lmadi'));
    } finally {
      setTranscribing(false);
    }
  }

  /* ── Yozuv rejimi ────────────────────────────────────────────── */
  const noSignal = recorder.recording && !heard && recorder.seconds >= 3;
  if (recorder.recording) {
    return (
      <div
        className="yz-ring flex h-[54px] items-center gap-3 px-2.5"
        data-state="busy"
      >
        <button
          type="button"
          onClick={recorder.cancel}
          aria-label="Bekor qilish"
          className="yz-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[color:var(--yz-ink-2)]"
        >
          <X className="h-5 w-5" strokeWidth={2.5} />
        </button>

        <span className="flex h-2 w-2 shrink-0 rounded-full bg-rose-400 motion-safe:animate-pulse" />
        <span className="shrink-0 text-subhead font-medium tabular-nums text-[color:var(--yz-ink)]">
          {formatTime(recorder.seconds)}
        </span>

        {noSignal ? (
          <p className="min-w-0 flex-1 truncate text-footnote text-rose-300">
            Ovoz eshitilmayapti
          </p>
        ) : (
          <div className="flex h-7 min-w-0 flex-1 items-center gap-[3px] overflow-hidden text-[color:var(--yz-blue)]">
            {Array.from({ length: 22 }).map((_, i) => (
              <span
                key={i}
                className="yz-bar"
                style={
                  {
                    '--amp': Math.max(
                      0.06,
                      recorder.level * (0.55 + Math.sin(i * 1.7) * 0.45),
                    ),
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => void finishRecording()}
          aria-label="Yozuvni tugatish"
          className="yz-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[color:var(--yz-blue)]"
        >
          <StopCircleFill className="h-8 w-8" />
        </button>
      </div>
    );
  }

  /* ── Matn rejimi ─────────────────────────────────────────────── */
  const canSend = value.trim().length >= 8 && !disabled;

  return (
    <div
      className="yz-ring flex items-end gap-1.5 p-1.5"
      data-state={disabled ? 'busy' : undefined}
    >
      <textarea
        ref={ref}
        rows={1}
        value={value}
        maxLength={MAX_CHARS}
        disabled={transcribing}
        spellCheck={false}
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
        /* Javob kutilayotganda Enter jimgina e'tiborsiz qolmasin: holat
           maydonning O'ZIDA aytiladi (yozishga ruxsat qoladi — foydalanuvchi
           keyingi savolini tayyorlab turishi mumkin). */
        placeholder={
          transcribing
            ? 'Ovoz matnga o‘girilmoqda…'
            : disabled
              ? 'Javob tayyorlanmoqda…'
              : 'Muammoni yozing yoki ayting…'
        }
        aria-busy={disabled || undefined}
        aria-label="Muammoingiz"
        className="max-h-[132px] min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-body leading-snug text-[color:var(--yz-ink)] placeholder:overflow-hidden placeholder:text-ellipsis placeholder:whitespace-nowrap placeholder:text-[color:var(--yz-ink-3)] focus:outline-none disabled:opacity-60"
      />

      <button
        type="button"
        onClick={() => void startRecording()}
        disabled={disabled || transcribing}
        aria-label="Ovozli xabar"
        className="yz-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[color:var(--yz-ink-2)] disabled:opacity-40"
      >
        {transcribing ? (
          <Spinner className="h-5 w-5 animate-spin" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </button>

      {value.trim().length > 0 && (
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Yuborish"
          title={canSend ? 'Yuborish' : 'Kamida 8 ta belgi yozing'}
          className="yz-send flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
        >
          <ArrowUp className="h-5 w-5" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

function formatTime(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
