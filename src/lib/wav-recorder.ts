'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Ovozni **WAV (16 kHz, mono, 16-bit)** formatida yozib beruvchi hook.
 *
 * Nega `MediaRecorder` emas: brauzerlar `audio/webm;codecs=opus` beradi, uni
 * esa Gemini qabul QILMAYDI (qo'llanadigan formatlar: wav, mp3, ogg, flac,
 * aac, aiff). Serverda transkodlash uchun ffmpeg kerak bo'lardi — bu prod
 * image'ga og'ir bog'liqlik. Shuning uchun ovoz brauzerda darhol nutq uchun
 * ideal formatda (16 kHz mono PCM) yig'iladi:
 *   - hech qanday transkodlash yo'q, hamma brauzerda bir xil natija,
 *   - 16 kHz — ASR uchun yetarli va fayl kichik (~32 KB/s),
 *   - `MAX_SECONDS` bilan hajm qat'iy chegaralangan.
 */

/** Yozuvning maksimal davomiyligi (server limitiga mos: ~2 daqiqa < 8 MB). */
export const MAX_SECONDS = 90;
const TARGET_RATE = 16_000;

export interface WavResult {
  blob: Blob;
  durationSec: number;
}

export function useWavRecorder() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  /** Joriy ovoz balandligi 0..1 — to'lqin chiziqchalari uchun. */
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nodeRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const lengthRef = useRef(0);
  const rateRef = useRef(TARGET_RATE);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  const teardown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    try {
      nodeRef.current?.disconnect();
      sourceRef.current?.disconnect();
    } catch {
      /* allaqachon uzilgan */
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    void ctxRef.current?.close().catch(() => undefined);
    nodeRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    ctxRef.current = null;
    setRecording(false);
    setLevel(0);
  }, []);

  // Sahifadan chiqilsa mikrofon albatta o'chsin.
  useEffect(() => teardown, [teardown]);

  const start = useCallback(async (): Promise<boolean> => {
    setError(null);
    cancelledRef.current = false;
    chunksRef.current = [];
    lengthRef.current = 0;
    setSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      // 16 kHz'ni so'raymiz; brauzer bermasa o'z tezligida yozib, keyin
      // qo'lda pasaytiramiz (`downsample`).
      let ctx: AudioContext;
      try {
        ctx = new Ctx({ sampleRate: TARGET_RATE });
      } catch {
        ctx = new Ctx();
      }
      ctxRef.current = ctx;
      rateRef.current = ctx.sampleRate;
      // iOS Safari'da kontekst "suspended" holatda tug'iladi.
      if (ctx.state === 'suspended') await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const node = ctx.createScriptProcessor(4096, 1, 1);
      nodeRef.current = node;

      node.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        chunksRef.current.push(new Float32Array(input));
        lengthRef.current += input.length;
        // RMS — to'lqin balandligi uchun
        let sum = 0;
        for (let i = 0; i < input.length; i += 8) sum += input[i] * input[i];
        const rms = Math.sqrt(sum / (input.length / 8));
        setLevel(Math.min(1, rms * 4));
      };

      source.connect(node);
      // Chiqishga ulanmasa ba'zi brauzerlarda processor ishlamaydi; ovoz
      // qaytmasligi uchun nol kuchaytirgich orqali ulaymiz.
      const silent = ctx.createGain();
      silent.gain.value = 0;
      node.connect(silent);
      silent.connect(ctx.destination);

      setRecording(true);
      timerRef.current = setInterval(() => {
        setSeconds(Math.floor(lengthRef.current / rateRef.current));
      }, 200);
      return true;
    } catch (err) {
      teardown();
      const name = (err as DOMException)?.name;
      setError(
        name === 'NotAllowedError'
          ? 'Mikrofonga ruxsat berilmadi'
          : 'Mikrofonni ochib bo‘lmadi',
      );
      return false;
    }
  }, [teardown]);

  const stop = useCallback((): WavResult | null => {
    const rate = rateRef.current;
    const chunks = chunksRef.current;
    const total = lengthRef.current;
    teardown();
    if (cancelledRef.current || total === 0) return null;

    const merged = new Float32Array(total);
    let offset = 0;
    for (const c of chunks) {
      merged.set(c, offset);
      offset += c.length;
    }
    const pcm = rate === TARGET_RATE ? merged : downsample(merged, rate, TARGET_RATE);
    return {
      blob: encodeWav(pcm, TARGET_RATE),
      durationSec: Math.max(1, Math.round(total / rate)),
    };
  }, [teardown]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    teardown();
    setSeconds(0);
  }, [teardown]);

  return { recording, seconds, level, error, start, stop, cancel };
}

/** Chiziqli interpolyatsiya bilan pasaytirish (nutq uchun yetarli sifat). */
function downsample(input: Float32Array, from: number, to: number): Float32Array {
  if (to >= from) return input;
  const ratio = from / to;
  const out = new Float32Array(Math.floor(input.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const pos = i * ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const a = input[idx] ?? 0;
    const b = input[idx + 1] ?? a;
    out[i] = a + (b - a) * frac;
  }
  return out;
}

/** Float32 [-1..1] → 16-bit PCM WAV (RIFF konteyner). */
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM blok o'lchami
  view.setUint16(20, 1, true); // format = PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bit depth
  writeStr(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: 'audio/wav' });
}
