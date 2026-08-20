'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * "Yechim AI" belgisi — loyihaga MAXSUS chizilgan mark (emoji yoki tayyor
 * ikonka EMAS).
 *
 * Geometriya va ma'no:
 *  · **Tashqi uzuq halqa** — qidiruv maydoni. Uzilishi "hali ko'rilmagan"
 *    qismni bildiradi; `thinking` da halqa aylanadi = platforma skanerlanmoqda.
 *  · **Ichki qarama-qarshi halqa** — ikkinchi o'tish (reranking). Ikki halqa
 *    teskari aylanishi "o'ylash" hissini beradi: bitta aylanish mexanik,
 *    ikkitasi — tirik.
 *  · **Skaner nuqtasi** — halqa bo'ylab yuguradi (topilish nuqtasi).
 *  · **Markaziy 4 nurli uchqun** — YECHIM. MYMarkaz logosidagi radial
 *    "markaz" motivini takrorlaydi; `found` da bir marta portlaydi.
 *  · **Puls halqasi** — faqat `thinking` da: tashqariga tarqalayotgan to'lqin.
 *
 * Ranglar — Apple system spektri (blue → indigo → purple → pink). Charter
 * gradientni faqat brend belgisiga ruxsat beradi; bu — AI ning belgisi.
 * Gradient boshqa sirtlarga TARQALMAYDI.
 */

export type YechimMarkState = 'idle' | 'thinking' | 'found';

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
  const found = state === 'found';

  // Ingichka chiziqlar kichik o'lchamda yo'qolib qolmasligi uchun qalinlik
  // o'lchamga bog'liq (optik muvozanat).
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
          <linearGradient id={`${id}-g`} x1="10" y1="6" x2="38" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0A84FF" />
            <stop offset="0.5" stopColor="#5856D6" />
            <stop offset="1" stopColor="#7B62E0" />
          </linearGradient>
          <linearGradient id={`${id}-r`} x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0A84FF" />
            <stop offset="0.55" stopColor="#5856D6" />
            <stop offset="1" stopColor="#7B62E0" />
          </linearGradient>
          <radialGradient id={`${id}-h`} cx="0.5" cy="0.5" r="0.5">
            <stop stopColor="#5856D6" stopOpacity="0.28" />
            <stop offset="1" stopColor="#5856D6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Yumshoq halo — faqat o'ylash paytida (sirtni iflos qilmaydi) */}
        {thinking && <circle cx="24" cy="24" r="23" fill={`url(#${id}-h)`} />}

        {/* Tarqaluvchi puls to'lqini — "qidiruv maydoni kengaymoqda" */}
        {thinking && (
          <circle
            className="ai-pulse-ring"
            cx="24"
            cy="24"
            r="19"
            stroke={`url(#${id}-r)`}
            strokeWidth="1.2"
            style={{ transformOrigin: '24px 24px' }}
          />
        )}

        {/* Tashqi skaner halqasi (uzuq) + skaner nuqtasi */}
        <g
          className={thinking ? 'ai-orbit' : undefined}
          style={{ transformOrigin: '24px 24px', ['--ai-orbit-dur' as string]: '2.6s' }}
        >
          <circle
            cx="24"
            cy="24"
            r="17.5"
            stroke={`url(#${id}-r)`}
            strokeWidth={small ? 3 : 2.6}
            strokeLinecap="round"
            strokeDasharray="80 30"
            opacity={thinking ? 1 : 0.62}
          />
          <circle cx="24" cy="6.5" r={small ? 3.2 : 2.9} fill={`url(#${id}-r)`} />
        </g>

        {/* Ichki halqa — teskari yo'nalishda (ikkinchi o'tish / reranking) */}
        {!small && (
          <g
            className={thinking ? 'ai-orbit-back' : undefined}
            style={{ transformOrigin: '24px 24px', ['--ai-orbit-dur' as string]: '4.2s' }}
          >
            <circle
              cx="24"
              cy="24"
              r="12.5"
              stroke={`url(#${id}-g)`}
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeDasharray="6 46"
              opacity={thinking ? 0.9 : 0.22}
            />
          </g>
        )}

        {/* Markaz: yechim uchquni */}
        <path
          className={found ? 'ai-found' : thinking ? 'ai-breath' : 'ai-breath-slow'}
          style={{ transformOrigin: '24px 24px' }}
          d="M24 11.5c1.05 6.1 6.4 11.45 12.5 12.5-6.1 1.05-11.45 6.4-12.5 12.5-1.05-6.1-6.4-11.45-12.5-12.5 6.1-1.05 11.45-6.4 12.5-12.5Z"
          fill={`url(#${id}-g)`}
        />
      </svg>
    </span>
  );
}

/**
 * "O'ylayapti" indikatori — bo'sh spinner emas, AI ning HAQIQIY ish
 * bosqichlarini ko'rsatadi. Bu shunchaki bezak emas: kutish vaqtini
 * tushunarli qiladi (foydalanuvchi nima bo'layotganini biladi) va javob
 * ishonchliroq tuyuladi.
 *
 * Bosqichlar vaqt bo'yicha almashadi — server oqimi bo'lmagani uchun ular
 * quvurning real ketma-ketligini aks ettiradi (tushunish → qidirish →
 * solishtirish → javob), tasodifiy matn emas.
 */
const STAGES = [
  'Muammoingizni tushunyapman',
  'Platformadagi loyihalarni ko‘rib chiqyapman',
  'Eng mosini solishtiryapman',
  'Javobni tayyorlayapman',
];

export function YechimThinking({ compact = false }: { compact?: boolean }) {
  const [stage, setStage] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Oxirgi bosqichda to'xtaydi (javob kelguncha "tayyorlayapman" turadi) —
    // aylanib takrorlanish yolg'on taassurot berardi.
    const steps = [1400, 3200, 5400];
    timers.current = steps.map((ms, i) => setTimeout(() => setStage(i + 1), ms));
    return () => timers.current.forEach(clearTimeout);
  }, []);

  return (
    <div className={cn('flex items-center gap-3', compact && 'gap-2.5')} role="status" aria-live="polite">
      <YechimMark size={compact ? 22 : 30} state="thinking" />
      <div className="min-w-0">
        {/* key — matn almashganda blur-in bilan yangilanadi (sakrash yo'q) */}
        <p
          key={stage}
          className="ai-shimmer ai-open-text text-subhead font-medium"
          style={{ ['--ai-delay' as string]: '0s' }}
        >
          {STAGES[stage]}…
        </p>
      </div>
    </div>
  );
}
