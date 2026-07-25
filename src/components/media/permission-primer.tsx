'use client';

import { useEffect, useState } from 'react';
import { Camera, Mic, X, Spinner } from '@/components/icons';
import {
  queryMediaPermission,
  requestMediaAccess,
} from '@/lib/media-permissions';
import { VOICE_ENABLED } from '@/lib/chat-features';

/** Doimiy belgi — ruxsat allaqachon so'ralgan (qayta bezovta qilmaymiz) */
const DONE_KEY = 'mm_media_perm_done';
/** Sessiya belgisi — "Keyinroq" bosilgan (keyingi tashrifda yana taklif) */
const SNOOZE_KEY = 'mm_media_perm_snooze';

/**
 * Saytga kirganda kamera/mikrofon ruxsatini bir marta nazokat bilan so'rovchi
 * primer (mobil + desktop). Brauzer prompt'ini to'g'ridan-to'g'ri otib
 * yubormaymiz — avval nima uchun kerakligini tushuntiruvchi karta ko'rsatamiz;
 * foydalanuvchi rozilik bersagina haqiqiy so'rov ochiladi (senior UX: kontekstsiz
 * prompt deyarli har doim rad etiladi va uni qaytarib bo'lmaydi).
 */
export function MediaPermissionPrimer() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (localStorage.getItem(DONE_KEY) || sessionStorage.getItem(SNOOZE_KEY)) return;
        // Ovozli xabarlar o'chirilgan bo'lsa — mikrofon so'ralmaydi (faqat kamera)
        const [cam, mic] = await Promise.all([
          queryMediaPermission('camera'),
          VOICE_ENABLED
            ? queryMediaPermission('microphone')
            : Promise.resolve('granted' as const),
        ]);
        // Hal bo'lgan (berilgan yoki qat'iy rad) — boshqa so'ramaymiz
        if (cam !== 'prompt' && mic !== 'prompt' && cam !== 'unsupported') {
          localStorage.setItem(DONE_KEY, '1');
          return;
        }
        // Sahifa o'tirishib olgach, sokin chiqamiz
        setTimeout(() => { if (alive) setShow(true); }, 1500);
      } catch { /* jim — primer majburiy emas */ }
    })();
    return () => { alive = false; };
  }, []);

  async function allow() {
    setBusy(true);
    const ok = await requestMediaAccess(true, VOICE_ENABLED);
    // Kamerasiz qurilma (NotFound) bo'lsa — hech bo'lmasa mikrofonni so'raymiz
    if (!ok && VOICE_ENABLED) await requestMediaAccess(false, true);
    localStorage.setItem(DONE_KEY, '1');
    setBusy(false);
    setShow(false);
  }

  function later() {
    sessionStorage.setItem(SNOOZE_KEY, '1');
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-4 z-50 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[380px] animate-slide-up">
      <div className="rounded-ios-2xl bg-white p-5 shadow-modal">
        <div className="flex items-start gap-3.5">
          <div className="flex shrink-0 -space-x-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-ios-md bg-brand-900 text-accent-400 ring-2 ring-white">
              <Camera className="h-5 w-5" />
            </span>
            {VOICE_ENABLED && (
              <span className="flex h-10 w-10 items-center justify-center rounded-ios-md bg-brand-900 text-accent-400 ring-2 ring-white">
                <Mic className="h-5 w-5" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-subhead font-bold text-brand-900">
              {VOICE_ENABLED ? 'Kamera va mikrofon' : 'Kameraga ruxsat'}
            </h3>
            <p className="mt-1 text-footnote leading-relaxed text-slate-600">
              {VOICE_ENABLED
                ? 'Chatdagi ovozli va video xabarlar uchun kerak bo‘ladi.'
                : 'Suhbatda to‘g‘ridan-to‘g‘ri surat olib yuborish uchun kerak bo‘ladi.'}{' '}
              Bir marta ruxsat bersangiz — keyin qayta so&apos;ralmaydi.
            </p>
          </div>
          <button
            onClick={later}
            aria-label="Yopish"
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-ios text-slate-400 transition-colors active:bg-fill-tertiary hover:text-brand-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={allow}
            disabled={busy}
            className="btn-lift inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-ios-md bg-accent-700 text-subhead font-semibold text-white transition-colors hover:bg-accent-800 disabled:opacity-60"
          >
            {busy ? <Spinner className="h-4 w-4 animate-spin" /> : 'Ruxsat berish'}
          </button>
          <button
            onClick={later}
            className="inline-flex h-10 items-center justify-center rounded-ios-md px-4 text-subhead font-semibold text-slate-500 transition-colors active:bg-fill-tertiary hover:text-brand-900"
          >
            Keyinroq
          </button>
        </div>
      </div>
    </div>
  );
}
