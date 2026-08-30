'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { API_URL, STORAGE } from '@/lib/constants';

/**
 * **Tashrif signali** — har marshrut almashganda serverga bitta kichik xabar.
 *
 * Nega tashqi analitika (GA va h.k.) emas:
 *  · sahifaga uchinchi tomon skripti yuklanmaydi — Lighthouse va yuklanish
 *    tezligiga ta'sir NOL (bizda perf byudjeti qat'iy, §7);
 *  · reklama bloklovchilar to'smaydi — reklama kunidagi raqamlar haqiqiy;
 *  · ma'lumot o'z serverimizda qoladi.
 *
 * Xatolar butunlay jim: analitika hech qachon sahifaning ishlashiga
 * aralashmasligi kerak.
 */

const VISITOR_KEY = 'mm_vid';
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Brauzerga tegishli barqaror identifikator.
 *
 * FAQAT shu saytda ishlatiladi (cross-site kuzatuv emas), server uni xom
 * holda saqlamaydi. Xotira yopiq bo'lsa (inkognito, bloklangan) — `undefined`,
 * bunda server IP+UA ning KUNLIK tuz bilan xeshlangan zaxirasiga tushadi.
 */
function visitorId(): string | undefined {
  try {
    const stored = localStorage.getItem(VISITOR_KEY);
    if (stored && UUID_RE.test(stored)) return stored;

    const fresh =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : undefined;
    if (!fresh) return undefined;
    localStorage.setItem(VISITOR_KEY, fresh);
    return fresh;
  } catch {
    return undefined;
  }
}

/** Tashqi yo'naltiruvchi (o'z sahifamizdan o'tish manba hisoblanmaydi). */
function externalReferrer(): string | undefined {
  try {
    const ref = document.referrer;
    if (!ref) return undefined;
    return new URL(ref).host === window.location.host ? undefined : ref;
  } catch {
    return undefined;
  }
}

function utmSource(): string | undefined {
  try {
    return (
      new URLSearchParams(window.location.search).get('utm_source') ?? undefined
    );
  } catch {
    return undefined;
  }
}

export function TrafficBeacon() {
  const pathname = usePathname();
  /** Bir xil sahifa ikki marta yozilmasin (Strict Mode / tez qayta render). */
  const lastSent = useRef<{ path: string; at: number } | null>(null);

  useEffect(() => {
    if (!pathname) return;

    // Sahifa oldindan yuklanayotgan bo'lsa (hali ko'rilmagan) — hisoblamaymiz.
    const doc = document as Document & { prerendering?: boolean };
    if (doc.prerendering) return;

    const now = Date.now();
    const previous = lastSent.current;
    if (previous && previous.path === pathname && now - previous.at < 1000) {
      return;
    }
    lastSent.current = { path: pathname, at: now };

    let token: string | null = null;
    try {
      token = localStorage.getItem(STORAGE.token);
    } catch {
      /* xotira yopiq — mehmon sifatida yoziladi */
    }

    void fetch(`${API_URL}/traffic/collect`, {
      method: 'POST',
      // `keepalive` — sahifadan chiqib ketilsa ham so'rov yuboriladi
      // (`sendBeacon` esa Authorization sarlavhasini qo'ya olmaydi, shuning
      // uchun kirgan foydalanuvchini ajratib bo'lmasdi).
      keepalive: true,
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        path: pathname,
        ref: externalReferrer(),
        src: utmSource(),
        vid: visitorId(),
      }),
    }).catch(() => {
      /* jim: analitika hech qachon foydalanuvchiga ko'rinmaydi */
    });
  }, [pathname]);

  return null;
}
