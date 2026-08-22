'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Ovozni **WAV (16 kHz, mono, 16-bit)** formatida yozib beruvchi hook.
 *
 * Nega `MediaRecorder` emas: brauzerlar `audio/webm;codecs=opus` beradi, uni
 * esa Gemini qabul QILMAYDI (qo'llanadigan formatlar: wav, mp3, ogg, flac,
 * aac, aiff). Serverda transkodlash uchun ffmpeg kerak bo'lardi — bu prod
 * image'ga og'ir bog'liqlik. Shuning uchun ovoz brauzerda darhol nutq uchun
 * ideal formatda (16 kHz mono PCM) yig'iladi.
 *
 * ⚠️ Sifat — bu yerda HAL QILUVCHI: ASR modeli nima eshitsa, o'shani yozadi;
 * jim yoki buzilgan yozuvda esa model **o'ylab topadi** (gallyutsinatsiya).
 * Shuning uchun quvurda uchta himoya bor:
 *   1. **AudioWorklet** (asosiy yo'l) — audio ip (thread)da yig'iladi.
 *      `ScriptProcessorNode` asosiy ipda ishlaydi va React qayta render
 *      bo'lganda bufer TASHLAB KETADI → nutq "chopiladi" → model chalkashadi.
 *      Eski brauzerlar uchun ScriptProcessor zaxira sifatida qoladi.
 *   2. **To'g'ri resampling** — 48 kHz → 16 kHz `OfflineAudioContext` orqali
 *      (brauzerning anti-aliasing resampleri). Oldingi chiziqli interpolyatsiya
 *      alias (metall shovqin) berardi — ASR uchun eng yomon buzilish.
 *   3. **Jimlikni O'ZIMIZ aniqlaymiz** — jim yozuv serverga UMUMAN
 *      yuborilmaydi (bekorga pul va gallyutsinatsiya sababi).
 */

/** Yozuvning maksimal davomiyligi (server limitiga mos: ~2 daqiqa < 8 MB). */
export const MAX_SECONDS = 90;
/** Bundan qisqa yozuvda tushunarli nutq bo'lishi amalda mumkin emas. */
export const MIN_SECONDS = 0.7;
const TARGET_RATE = 16_000;
/** ~-42 dBFS: bundan past cho'qqi = mikrofon yopiq yoki umuman gapirilmagan. */
const SILENCE_PEAK = 0.008;
/** Normallashtirishda maksimal kuchaytirish (shovqinni portlatib yubormaslik). */
const MAX_GAIN = 10;
/** Kesishda saqlanadigan zaxira (so'z boshi/oxiri kesilmasin). */
const TRIM_PAD_SEC = 0.12;

export interface WavResult {
  blob: Blob;
  durationSec: number;
  /** Normallashtirishdan OLDINGI cho'qqi (0..1) — diagnostika uchun. */
  peak: number;
}

/** Nima uchun yozuv yuborilmadi (foydalanuvchiga tushunarli xabar uchun). */
export type RecorderFailure = 'empty' | 'too-short' | 'silent';

export type StopResult =
  | { ok: true; result: WavResult }
  | { ok: false; reason: RecorderFailure };

/** AudioWorklet moduli — PCM bloklarini asosiy ipga uzatadi (nusxa bilan). */
const WORKLET_SRC = `
class PcmCollector extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch && ch.length) {
      const copy = new Float32Array(ch);
      this.port.postMessage(copy, [copy.buffer]);
    }
    return true;
  }
}
registerProcessor('pcm-collector', PcmCollector);
`;

export function useWavRecorder() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  /** Joriy ovoz balandligi 0..1 — to'lqin chiziqchalari uchun. */
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const scriptRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const moduleUrlRef = useRef<string | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const lengthRef = useRef(0);
  const rateRef = useRef(TARGET_RATE);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);
  const stoppingRef = useRef(false);
  /** Level'ni ~12 fps'ga cheklaymiz: har buferda setState — bekorga render. */
  const lastLevelAt = useRef(0);

  const teardown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    try {
      if (workletRef.current) workletRef.current.port.onmessage = null;
      workletRef.current?.disconnect();
      if (scriptRef.current) scriptRef.current.onaudioprocess = null;
      scriptRef.current?.disconnect();
      sourceRef.current?.disconnect();
    } catch {
      /* allaqachon uzilgan */
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    void ctxRef.current?.close().catch(() => undefined);
    if (moduleUrlRef.current) URL.revokeObjectURL(moduleUrlRef.current);
    moduleUrlRef.current = null;
    workletRef.current = null;
    scriptRef.current = null;
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
    stoppingRef.current = false;
    chunksRef.current = [];
    lengthRef.current = 0;
    setSeconds(0);

    try {
      /*
       * Cheklovlar "ideal" sifatida beriladi (qat'iy emas): ba'zi Android
       * qurilmalari mono yoki echo-cancellation'ni qo'llab-quvvatlamaydi va
       * qat'iy cheklovda `OverconstrainedError` bilan umuman ochilmaydi.
       * Qo'shimcha himoya sifatida oddiy `{ audio: true }` bilan qayta
       * urinamiz — mikrofon har qanday qurilmada ochilsin.
       */
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: { ideal: 1 },
            echoCancellation: { ideal: true },
            noiseSuppression: { ideal: true },
            autoGainControl: { ideal: true },
          },
        });
      } catch (err) {
        if ((err as DOMException)?.name === 'NotAllowedError') throw err;
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      streamRef.current = stream;

      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      /*
       * ⚠️ Kontekst tezligi MAJBURLANMAYDI (ilgari `{ sampleRate: 16000 }`
       * berilardi). Sabab — mobil brauzerlarda `MediaStreamAudioSourceNode`
       * qurilma tezligidan FARQ QILUVCHI kontekstda **jimlik** chiqarishi
       * mumkin: yozuv "muvaffaqiyatli" tugaydi, lekin ichida ovoz yo'q.
       * Aynan shu holatda ASR modeli bo'shliqni tanish matn bilan to'ldiradi
       * (foydalanuvchi umuman aytmagan gapni ko'radi).
       * Endi mikrofon O'Z tezligida yoziladi, 16 kHz'ga esa oxirida
       * `OfflineAudioContext` (anti-aliasing bilan) pasaytiradi.
       */
      const ctx = new Ctx();
      ctxRef.current = ctx;
      rateRef.current = ctx.sampleRate;
      // iOS Safari'da kontekst "suspended" holatda tug'iladi.
      if (ctx.state === 'suspended') await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const collect = (input: Float32Array) => {
        chunksRef.current.push(input);
        lengthRef.current += input.length;
        const now = performance.now();
        if (now - lastLevelAt.current < 80) return;
        lastLevelAt.current = now;
        let sum = 0;
        for (let i = 0; i < input.length; i += 4) sum += input[i] * input[i];
        const rms = Math.sqrt(sum / Math.max(1, input.length / 4));
        setLevel(Math.min(1, rms * 4));
      };

      let attached = false;
      // 1-yo'l: AudioWorklet — audio ipda, render bosimidan mustaqil.
      if (ctx.audioWorklet) {
        try {
          const url = URL.createObjectURL(
            new Blob([WORKLET_SRC], { type: 'application/javascript' }),
          );
          moduleUrlRef.current = url;
          await ctx.audioWorklet.addModule(url);
          const node = new AudioWorkletNode(ctx, 'pcm-collector', {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            channelCount: 1,
            channelCountMode: 'explicit',
          });
          node.port.onmessage = (e: MessageEvent<Float32Array>) =>
            collect(e.data);
          workletRef.current = node;
          source.connect(node);
          // Grafik chiqishdan "tortiladi": tugun destination'ga ulanmasa
          // ba'zi brauzerlarda `process()` umuman chaqirilmaydi. Ovoz
          // qaytmasligi uchun nol kuchaytirgich orqali ulaymiz.
          connectSilently(ctx, node);
          attached = true;
        } catch {
          attached = false;
        }
      }

      // 2-yo'l (zaxira): eski brauzerlar uchun ScriptProcessor.
      if (!attached) {
        const node = ctx.createScriptProcessor(4096, 1, 1);
        node.onaudioprocess = (e) =>
          collect(new Float32Array(e.inputBuffer.getChannelData(0)));
        scriptRef.current = node;
        source.connect(node);
        connectSilently(ctx, node);
      }

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

  /**
   * Yozuvni tugatadi va **yuborishga yaroqli** WAV qaytaradi.
   * Yaroqsiz bo'lsa (bo'sh / juda qisqa / jim) — sababi bilan `ok:false`:
   * bunday yozuv serverga UMUMAN yuborilmaydi.
   */
  const stop = useCallback(async (): Promise<StopResult> => {
    if (stoppingRef.current) return { ok: false, reason: 'empty' };
    stoppingRef.current = true;

    const rate = rateRef.current;
    const chunks = chunksRef.current;
    const total = lengthRef.current;
    teardown();
    chunksRef.current = [];
    lengthRef.current = 0;
    if (cancelledRef.current || total === 0) return { ok: false, reason: 'empty' };

    const merged = new Float32Array(total);
    let offset = 0;
    for (const c of chunks) {
      merged.set(c, offset);
      offset += c.length;
    }
    if (total / rate < MIN_SECONDS) return { ok: false, reason: 'too-short' };

    const pcm =
      rate === TARGET_RATE ? merged : await resample(merged, rate, TARGET_RATE);

    // Boshdagi/oxirdagi jimlikni kesamiz — model "nima bo'ldi?" deb
    // o'ylamasin va fayl kichik qolsin.
    const trimmed = trimSilence(pcm, TARGET_RATE);
    const peak = peakOf(trimmed);
    if (peak < SILENCE_PEAK) return { ok: false, reason: 'silent' };
    if (trimmed.length / TARGET_RATE < MIN_SECONDS) {
      return { ok: false, reason: 'too-short' };
    }

    // Tinch yozuvni ASR uchun ko'taramiz (telefon qo'ldan uzoqda bo'lsa).
    normalize(trimmed, peak);

    return {
      ok: true,
      result: {
        blob: encodeWav(trimmed, TARGET_RATE),
        durationSec: Math.max(1, Math.round(trimmed.length / TARGET_RATE)),
        peak,
      },
    };
  }, [teardown]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    stoppingRef.current = true;
    teardown();
    setSeconds(0);
  }, [teardown]);

  return { recording, seconds, level, error, start, stop, cancel };
}

/* ── Signal yordamchilari ───────────────────────────────────────── */

/** Tugunni nol kuchaytirgich orqali chiqishga ulaydi (ovoz qaytmaydi). */
function connectSilently(ctx: AudioContext, node: AudioNode): void {
  const silent = ctx.createGain();
  silent.gain.value = 0;
  node.connect(silent);
  silent.connect(ctx.destination);
}

/**
 * Sifatli pasaytirish — brauzerning o'z resampleri (anti-aliasing bilan).
 * `OfflineAudioContext` bo'lmasa/yiqilsa — o'rtachalash filtri (box) bilan
 * desimatsiya: aliasni to'liq yo'qotmaydi, lekin chiziqli interpolyatsiyadan
 * ancha toza.
 */
async function resample(
  input: Float32Array,
  from: number,
  to: number,
): Promise<Float32Array> {
  if (to >= from) return input;
  const frames = Math.max(1, Math.round((input.length * to) / from));
  try {
    const OfflineCtx =
      window.OfflineAudioContext ||
      (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext })
        .webkitOfflineAudioContext;
    const ctx = new OfflineCtx(1, frames, to);
    const buffer = ctx.createBuffer(1, input.length, from);
    buffer.getChannelData(0).set(input);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    src.start();
    const rendered = await ctx.startRendering();
    return rendered.getChannelData(0).slice();
  } catch {
    return decimate(input, from, to);
  }
}

/** Zaxira: o'rtachalash (box) filtri bilan desimatsiya. */
function decimate(input: Float32Array, from: number, to: number): Float32Array {
  const ratio = from / to;
  const out = new Float32Array(Math.floor(input.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j];
    out[i] = end > start ? sum / (end - start) : 0;
  }
  return out;
}

function peakOf(samples: Float32Array): number {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = Math.abs(samples[i]);
    if (v > peak) peak = v;
  }
  return peak;
}

/** Boshi va oxiridagi jimlikni kesadi (o'rtasiga tegilmaydi). */
function trimSilence(samples: Float32Array, rate: number): Float32Array {
  const peak = peakOf(samples);
  if (peak === 0) return samples;
  // Chegara — cho'qqiga nisbatan (turli mikrofon darajalariga moslashadi).
  const gate = Math.max(peak * 0.06, 0.004);
  const pad = Math.floor(TRIM_PAD_SEC * rate);
  let first = 0;
  while (first < samples.length && Math.abs(samples[first]) < gate) first++;
  if (first >= samples.length) return samples;
  let last = samples.length - 1;
  while (last > first && Math.abs(samples[last]) < gate) last--;
  const from = Math.max(0, first - pad);
  const to = Math.min(samples.length, last + pad);
  return samples.subarray(from, to);
}

/** Cho'qqi bo'yicha normallashtirish (faqat KUCHAYTIRISH, cheklangan). */
function normalize(samples: Float32Array, peak: number): void {
  if (peak <= 0 || peak >= 0.9) return;
  const gain = Math.min(0.9 / peak, MAX_GAIN);
  if (gain <= 1.05) return;
  for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.max(-1, Math.min(1, samples[i] * gain));
  }
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
