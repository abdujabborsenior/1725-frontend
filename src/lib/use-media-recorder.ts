'use client';

import { useCallback, useRef, useState } from 'react';

export type RecordKind = 'audio' | 'video';

export interface RecordResult {
  blob: Blob;
  durationSec: number;
  waveform: number[];
  mimeType: string;
}

function pickMime(kind: RecordKind): string {
  const cands =
    kind === 'audio'
      ? ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg']
      : ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
  for (const c of cands) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c)) return c;
  }
  return kind === 'audio' ? 'audio/webm' : 'video/webm';
}

export function useMediaRecorder() {
  const [recording, setRecording] = useState(false);
  const [kind, setKind] = useState<RecordKind | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const waveRef = useRef<number[]>([]);
  const cancelledRef = useRef(false);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    void audioCtxRef.current?.close().catch(() => undefined);
    audioCtxRef.current = null;
    streamRef.current = null;
    setStream(null);
    setRecording(false);
    setKind(null);
    setSeconds(0);
  }, []);

  const start = useCallback(async (k: RecordKind) => {
    cancelledRef.current = false;
    chunksRef.current = [];
    waveRef.current = [];
    setWaveform([]);
    const media = await navigator.mediaDevices.getUserMedia(
      k === 'audio'
        ? { audio: true }
        : { audio: true, video: { facingMode: 'user', width: 480, height: 480 } },
    );
    streamRef.current = media;
    setStream(media);

    // Live waveform via analyser
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(media);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      let last = 0;
      const tick = () => {
        analyser.getByteFrequencyData(buf);
        const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
        const now = performance.now();
        if (now - last > 120 && waveRef.current.length < 48) {
          waveRef.current.push(Math.min(100, Math.round((avg / 160) * 100)));
          setWaveform([...waveRef.current]);
          last = now;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      /* analyser ixtiyoriy */
    }

    const mime = pickMime(k);
    const mr = new MediaRecorder(media, { mimeType: mime });
    mediaRef.current = mr;
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.start();

    startedRef.current = Date.now();
    setKind(k);
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds(Math.round((Date.now() - startedRef.current) / 1000));
    }, 250);
  }, []);

  const stop = useCallback((): Promise<RecordResult | null> => {
    return new Promise((resolve) => {
      const mr = mediaRef.current;
      if (!mr) { cleanup(); resolve(null); return; }
      const mime = mr.mimeType || 'audio/webm';
      const durationSec = Math.max(1, Math.round((Date.now() - startedRef.current) / 1000));
      const wf = waveRef.current.slice();
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        cleanup();
        if (cancelledRef.current || blob.size === 0) resolve(null);
        else resolve({ blob, durationSec, waveform: wf, mimeType: mime });
      };
      mr.stop();
    });
  }, [cleanup]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    try { mediaRef.current?.stop(); } catch { /* ignore */ }
    cleanup();
  }, [cleanup]);

  return { recording, kind, seconds, stream, waveform, start, stop, cancel };
}
