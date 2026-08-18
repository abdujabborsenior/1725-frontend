'use client';

import { useId } from 'react';

import { cn } from '@/lib/utils';

/**
 * "Yechim AI" belgisi — loyihaga MAXSUS chizilgan mark (emoji yoki tayyor
 * ikonka EMAS).
 *
 * Ma'nosi (brend geometriyasi bilan bog'liq):
 *  - **Tashqi uzuq halqa** — qidiruv maydoni: AI platformadagi loyihalarni
 *    aylanib skanerlaydi. Halqadagi bo'shliq — "hali topilmagan" qismi.
 *  - **Markazdagi uchqun (4 nurli)** — topilgan yechim. Nurlari MYMarkaz
 *    logosidagi radial "markaz" motivini takrorlaydi.
 *  - **Halqadagi nuqta** — skaner: `thinking` holatida halqa bo'ylab aylanadi.
 *
 * Dizayn izohi (Charter §2.1 dan ataylab chekinish): mark ichida ko'k→indigo→
 * siyoh gradienti ishlatiladi. Charter gradientni FAQAT brend belgisiga ruxsat
 * beradi; bu — AI ning brend belgisi va ranglar Apple system palitrasidan
 * (systemBlue → systemIndigo → systemPurple). Gradient boshqa sirtlarga
 * TARQALMAYDI.
 */

export type YechimMarkState = 'idle' | 'thinking';

interface YechimMarkProps {
  /** Piksel o'lchami (kvadrat). */
  size?: number;
  state?: YechimMarkState;
  /** iOS ilova-ikonkasi kvadrati ichida (squircle fon bilan). */
  boxed?: boolean;
  className?: string;
}

export function YechimMark({
  size = 28,
  state = 'idle',
  boxed = false,
  className,
}: YechimMarkProps) {
  // Gradient id'lari sahifada bir nechta mark bo'lganda to'qnashmasligi kerak;
  // `useId` SSR va klientda bir xil qiymat beradi (hidratsiya mos keladi).
  const id = useId().replace(/:/g, '');
  const thinking = state === 'thinking';

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center',
        boxed && 'rounded-[29%] bg-brand-900',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        width={boxed ? size * 0.72 : size}
        height={boxed ? size * 0.72 : size}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`${id}-g`} x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0A84FF" />
            <stop offset="0.55" stopColor="#5856D6" />
            <stop offset="1" stopColor="#AF52DE" />
          </linearGradient>
          <linearGradient id={`${id}-r`} x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0A84FF" />
            <stop offset="1" stopColor="#AF52DE" />
          </linearGradient>
        </defs>

        {/* Skaner halqasi — uzuq (qidiruv davom etmoqda) */}
        <g className={thinking ? 'yechim-orbit' : undefined} style={{ transformOrigin: '24px 24px' }}>
          <circle
            cx="24"
            cy="24"
            r="17.5"
            stroke={`url(#${id}-r)`}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeDasharray="82 28"
            opacity={thinking ? 0.95 : 0.6}
          />
          {/* Topilgan nuqta — halqa boshida */}
          <circle cx="24" cy="6.5" r="2.9" fill={`url(#${id}-r)`} />
        </g>

        {/* Markaz: yechim uchquni */}
        <path
          className={thinking ? 'yechim-spark' : undefined}
          style={{ transformOrigin: '24px 24px' }}
          d="M24 11.5c1.05 6.1 6.4 11.45 12.5 12.5-6.1 1.05-11.45 6.4-12.5 12.5-1.05-6.1-6.4-11.45-12.5-12.5 6.1-1.05 11.45-6.4 12.5-12.5Z"
          fill={`url(#${id}-g)`}
        />
      </svg>
    </span>
  );
}

/**
 * Kichik "AI o'ylayapti" indikatori — uch nuqta emas, iOS uslubidagi
 * to'lqinli chiziqcha (chat "typing" dan farq qilsin).
 */
export function YechimThinking({ label = 'Yechim izlanmoqda' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5" role="status" aria-live="polite">
      <YechimMark size={22} state="thinking" />
      <span className="yechim-shimmer text-subhead font-medium">{label}…</span>
    </div>
  );
}
