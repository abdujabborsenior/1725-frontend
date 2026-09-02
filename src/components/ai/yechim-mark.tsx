'use client';

import { useId } from 'react';

import { cn } from '@/lib/utils';

/**
 * "Yechim AI" belgisi — loyihaga MAXSUS chizilgan (emoji yoki tayyor ikonka
 * EMAS). Ikki ko'rinishi bor, ikkalasi ham bitta geometriyadan:
 *
 *  · `YechimMark` — tekis belgi. Kichik o'lchamlar va oq sirtlar uchun
 *    (navbar, bosh sahifa, sheet sarlavhasi).
 *  · `YechimOrb` — Studio ekranining "tirik" sharsi: chuqurlik, yorug'lik,
 *    orbitadagi yo'ldoshlar. Faqat to'q sirtda ishlatiladi.
 *
 * Ma'no (ikkalasida ham bir xil): **uzuq halqa** — hali ko'rilmagan qidiruv
 * maydoni; **4 nurli uchqun** — topilgan yechim (MYMarkaz logosidagi radial
 * "markaz" motivining aksi); **yo'ldoshlar** — ko'rib chiqilayotgan loyihalar.
 *
 * Harakat holatga bog'liq: `idle` — deyarli tinch, `thinking` — qidiruv,
 * `found` — bir martalik "topildi". Bezak uchun aylanish yo'q.
 */

export type YechimMarkState = 'idle' | 'thinking' | 'found';

interface MarkProps {
  size?: number;
  state?: YechimMarkState;
  /** iOS ilova-ikonkasi kvadrati ichida (to'q squircle fon bilan). */
  boxed?: boolean;
  className?: string;
}

/** Spektr — AI ning YAGONA gradienti. Boshqa sirtlarga tarqalmaydi. */
const SPECTRUM = ['#0A84FF', '#5B8DFF', '#8B7BF3'] as const;

export function YechimMark({
  size = 28,
  state = 'idle',
  boxed = false,
  className,
}: MarkProps) {
  // SSR va klientda bir xil (hidratsiya mos keladi), sahifada bir nechta
  // belgi bo'lganda gradient id'lari to'qnashmaydi.
  const id = useId().replace(/:/g, '');
  const thinking = state === 'thinking';
  const found = state === 'found';
  const small = size <= 24;

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
          <linearGradient
            id={`${id}-g`}
            x1="10"
            y1="6"
            x2="38"
            y2="42"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={SPECTRUM[0]} />
            <stop offset="0.55" stopColor={SPECTRUM[1]} />
            <stop offset="1" stopColor={SPECTRUM[2]} />
          </linearGradient>
        </defs>

        <g
          className={thinking ? 'ai-orbit' : undefined}
          style={{
            transformOrigin: '24px 24px',
            ['--ai-orbit-dur' as string]: '2.6s',
          }}
        >
          <circle
            cx="24"
            cy="24"
            r="17.5"
            stroke={`url(#${id}-g)`}
            strokeWidth={small ? 3 : 2.6}
            strokeLinecap="round"
            strokeDasharray="80 30"
            opacity={thinking ? 1 : 0.62}
          />
          <circle cx="24" cy="6.5" r={small ? 3.2 : 2.9} fill={`url(#${id}-g)`} />
        </g>

        <path
          className={found ? 'ai-found' : thinking ? 'ai-breath' : undefined}
          style={{ transformOrigin: '24px 24px' }}
          d="M24 11.5c1.05 6.1 6.4 11.45 12.5 12.5-6.1 1.05-11.45 6.4-12.5 12.5-1.05-6.1-6.4-11.45-12.5-12.5 6.1-1.05 11.45-6.4 12.5-12.5Z"
          fill={`url(#${id}-g)`}
        />
      </svg>
    </span>
  );
}

/**
 * Studio sharsi. Qatlamlari (tashqaridan ichkariga): halo → puls to'lqini →
 * uzuq skaner halqasi → yo'ldoshlar → shar (chuqurlik gradienti + tepadan
 * tushgan yorug'lik) → uchqun.
 *
 * Yo'ldoshlar `thinking` da turli radius/tezlik/yo'nalishda aylanadi:
 * bitta aylanish mexanik ko'rinadi, uchtasi — tirik.
 */
export function YechimOrb({
  size = 72,
  state = 'idle',
  className,
}: {
  size?: number;
  state?: YechimMarkState;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  const thinking = state === 'thinking';
  const found = state === 'found';

  return (
    <span
      className={cn('relative inline-flex shrink-0', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" fill="none" width={size} height={size}>
        <defs>
          {/* Shar — yuqori chapdan yoritilgan sfera */}
          <radialGradient id={`${id}-core`} cx="0.36" cy="0.3" r="0.85">
            <stop stopColor="#5AA8FF" />
            <stop offset="0.42" stopColor="#2C5CE8" />
            <stop offset="1" stopColor="#0A1330" />
          </radialGradient>
          <linearGradient
            id={`${id}-ring`}
            x1="8"
            y1="8"
            x2="56"
            y2="56"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4DA3FF" />
            <stop offset="1" stopColor="#9A97FF" />
          </linearGradient>
          <radialGradient id={`${id}-halo`} cx="0.5" cy="0.5" r="0.5">
            <stop stopColor="#4DA3FF" stopOpacity="0.42" />
            <stop offset="1" stopColor="#4DA3FF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-spark`} x1="32" y1="18" x2="32" y2="46">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#CFE2FF" />
          </linearGradient>
        </defs>

        {/* Halo — sharning atrofidagi nur */}
        <circle
          cx="32"
          cy="32"
          r="31"
          fill={`url(#${id}-halo)`}
          opacity={thinking || found ? 1 : 0.55}
        />

        {/* Tarqaluvchi to'lqin — faqat qidiruv paytida */}
        {thinking && (
          <circle
            className="ai-pulse-ring"
            cx="32"
            cy="32"
            r="24"
            stroke={`url(#${id}-ring)`}
            strokeWidth="1.1"
            style={{ transformOrigin: '32px 32px' }}
          />
        )}

        {/* Uzuq skaner halqasi */}
        <g
          className={thinking ? 'ai-orbit' : undefined}
          style={{
            transformOrigin: '32px 32px',
            ['--ai-orbit-dur' as string]: '3.4s',
          }}
        >
          <circle
            cx="32"
            cy="32"
            r="27"
            stroke={`url(#${id}-ring)`}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="96 74"
            opacity={thinking ? 0.95 : 0.45}
          />
        </g>

        {/* Yo'ldoshlar — ko'rib chiqilayotgan loyihalar */}
        {thinking && (
          <>
            <g
              className="ai-orbit"
              style={{
                transformOrigin: '32px 32px',
                ['--ai-orbit-dur' as string]: '2.2s',
              }}
            >
              <circle cx="32" cy="5" r="2.1" fill="#7FC0FF" />
            </g>
            <g
              className="ai-orbit-back"
              style={{
                transformOrigin: '32px 32px',
                ['--ai-orbit-dur' as string]: '3.1s',
              }}
            >
              <circle cx="59" cy="32" r="1.7" fill="#9A97FF" />
            </g>
            <g
              className="ai-orbit"
              style={{
                transformOrigin: '32px 32px',
                ['--ai-orbit-dur' as string]: '4.6s',
              }}
            >
              <circle cx="32" cy="61" r="1.4" fill="#4DA3FF" opacity="0.85" />
            </g>
          </>
        )}

        {/* Shar */}
        <circle cx="32" cy="32" r="20" fill={`url(#${id}-core)`} />
        <circle
          cx="32"
          cy="32"
          r="20"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1"
        />
        {/* Tepadagi aks (specular) — sirtga hajm beradi */}
        <ellipse
          cx="26"
          cy="23"
          rx="9"
          ry="6"
          fill="#FFFFFF"
          opacity="0.18"
          transform="rotate(-22 26 23)"
        />

        {/* Uchqun — yechimning o'zi */}
        <path
          className={
            found ? 'ai-found' : thinking ? 'ai-breath' : 'ai-breath-slow'
          }
          style={{ transformOrigin: '32px 32px' }}
          d="M32 20.5c.85 4.95 5.65 9.75 10.6 10.6-4.95.85-9.75 5.65-10.6 10.6-.85-4.95-5.65-9.75-10.6-10.6 4.95-.85 9.75-5.65 10.6-10.6Z"
          fill={`url(#${id}-spark)`}
        />
      </svg>
    </span>
  );
}
