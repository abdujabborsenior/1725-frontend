'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import {
  Bot,
  Eye,
  GraduationCap,
  HeartPulse,
  Smartphone,
  Sprout,
  StarFill,
  TrendingUp,
  Wallet,
  type IconComponent,
} from '@/components/icons';
import { LogoMark } from '@/components/brand/logo-mark';
import { YechimMark } from '@/components/ai/yechim-mark';
import { useFormatNumber } from '@/lib/format';

/**
 * Hero vizuali — "MARKAZ ORBITASI" (2026-09-21).
 *
 * Sarlavhani ("G'oyadan biznes loyihagacha") HARAKATDA ko'rsatadi:
 *  · markazda MYMarkaz belgisi — platformaning o'zi (markaz = hub);
 *  · atrofida ikki orbita — sohalar (ilova-ikonkalar) va hamjamiyat a'zolari;
 *    logotipdagi 8 yo'nalish fonda nozik nurlar bo'lib tarqaladi;
 *  · MUAMMO kartasidan markazga yorug'lik oqadi, markazdan esa Yechim AI va
 *    tayyor STARTAPga — ya'ni g'oya platformadan o'tib loyihaga aylanadi.
 *
 * Qoidalar (performance + a11y):
 *  · Rasm fayli YO'Q — DOM + SVG + dizayn tokenlari (tarmoq so'rovi 0).
 *  · LCP h1 matnida qoladi: bu yerdagi hech bir element LCP nomzodi emas.
 *  · Doimiy harakat FAQAT `transform`/`opacity` (kompozitor) va kirish
 *    sahnasidan KEYIN boshlanadi (`--hub-delay`) — Speed Index kadrlari
 *    kirish paytida tinch qoladi. Nurdagi yorug'lik impulsi yagona paint
 *    animatsiyasi (uchta qisqa chiziq, kichik maydon).
 *  · Hero ko'rinmay qolganda BARCHA harakat to'xtaydi (IntersectionObserver
 *    → `data-paused`; React qayta render qilinmaydi).
 *  · `prefers-reduced-motion` — hammasi statik, kontent 100% ko'rinadi.
 *  · RTL: kompozitsiya ko'zgulanadi (`.hub-center`, nurlar `scaleX(-1)`).
 *
 * Geometriya: kanvas sm+ da 480×470, mobilda 360×420; markaz (`--hub-x/y`,
 * globals.css) sm+ da (58%, 35%), mobilda (60%, 34%). Nurlar 480×470
 * koordinatalarida chizilgan va `preserveAspectRatio="none"` bilan mobil
 * kanvasga cho'ziladi (markaz foizi ikkala o'lchamda deyarli bir). Nurlarning
 * boshi va oxiri ATAYLAB kartalar / markaz OSTIDA — kartadagi matn uzunligi
 * (5 til) o'zgarsa ham nur "havoda" uzilib qolmaydi.
 */

type Tone = 'iris' | 'emerald' | 'teal' | 'accent' | 'pink' | 'amber';

/** iOS ilova-ikonkasi uslubidagi, yuqoridan yoritilgan sirt (soha belgisi). */
const TONE: Record<Tone, string> = {
  iris: 'from-iris-400 to-iris-600 shadow-[0_8px_18px_-8px_rgba(88,86,214,0.75)]',
  emerald: 'from-emerald-400 to-emerald-600 shadow-[0_8px_18px_-8px_rgba(36,138,61,0.7)]',
  teal: 'from-teal-400 to-teal-600 shadow-[0_8px_18px_-8px_rgba(27,123,141,0.7)]',
  accent: 'from-accent-400 to-accent-600 shadow-[0_8px_18px_-8px_rgba(0,113,227,0.75)]',
  pink: 'from-pink-400 to-pink-600 shadow-[0_8px_18px_-8px_rgba(201,21,53,0.6)]',
  amber: 'from-amber-300 to-amber-600 shadow-[0_8px_18px_-8px_rgba(217,122,0,0.7)]',
};

interface OrbitNode {
  /** Burchak (gradus): 0 — o'ng, 90 — past (CSS koordinatasi). */
  angle: number;
  icon?: IconComponent;
  tone?: Tone;
  /** Hamjamiyat a'zosi (bosh harf) — ikonka o'rniga. */
  person?: { letter: string; bg: string };
}

/* Ichki orbita — sohalar */
const INNER: OrbitNode[] = [
  { angle: -150, icon: GraduationCap, tone: 'iris' },
  { angle: -30, icon: Wallet, tone: 'emerald' },
  { angle: 90, icon: Sprout, tone: 'teal' },
];

/* Tashqi orbita — sohalar + hamjamiyat a'zolari */
const OUTER: OrbitNode[] = [
  { angle: -100, icon: Bot, tone: 'accent' },
  { angle: -45, person: { letter: 'D', bg: 'bg-[#4B49C4]' } },
  { angle: 20, icon: HeartPulse, tone: 'pink' },
  { angle: 78, person: { letter: 'M', bg: 'bg-[#8331AC]' } },
  { angle: 140, icon: Smartphone, tone: 'amber' },
  { angle: 205, person: { letter: 'A', bg: 'bg-[#1B7B8D]' } },
];

/** Fondagi 8 nur — MYMarkaz belgisidagi 8 segmentning aksi. */
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

/** Muammo kartasidagi "yechim yozayotganlar" — tekis iOS avatar ranglari (AA). */
const SOLVERS = [
  ['S', 'bg-[#0071E3]'],
  ['N', 'bg-[#E5271B]'],
  ['B', 'bg-[#1D7333]'],
] as const;

/**
 * Nurlar (480×470 koordinatalar). `draw` — kirishda chizilish kechikishi,
 * `pd` — yorug'lik impulsi fazasi (uchalasi bir vaqtda yugurmaydi).
 */
const BEAMS = [
  { id: 'in', d: 'M115 110C115 185 180 205 240 180', draw: '0.45s', pulse: '#FF9500', pd: '0s' },
  { id: 'ai', d: 'M255 200C225 270 170 300 130 372', draw: '0.7s', pulse: '#5856D6', pd: '1.3s' },
  { id: 'out', d: 'M320 150C392 128 452 175 440 262', draw: '0.85s', pulse: '#007AFF', pd: '2.2s' },
] as const;

function nodePosition(angle: number): CSSProperties {
  const r = (angle * Math.PI) / 180;
  // Yaxlitlash — SSR va klientda satr AYNAN bir xil bo'lsin (hidratsiya)
  const x = Math.round((50 + 50 * Math.cos(r)) * 100) / 100;
  const y = Math.round((50 + 50 * Math.sin(r)) * 100) / 100;
  return { left: `${x}%`, top: `${y}%` };
}

/** Orbitadagi belgi. `counter` — orbita aylanishini qoplovchi teskari aylanish
 *  (belgi doim tik turadi, orbita bilan birga ag'darilmaydi). */
function OrbitBadge({ node, counter }: { node: OrbitNode; counter: string }) {
  const Icon = node.icon;
  return (
    <span className="absolute -translate-x-1/2 -translate-y-1/2" style={nodePosition(node.angle)}>
      <span className={`block ${counter}`}>
        {node.person ? (
          <span
            translate="no"
            className={`flex h-6 w-6 items-center justify-center rounded-full text-caption-2 font-semibold text-white shadow-card ring-2 ring-white sm:h-7 sm:w-7 ${node.person.bg}`}
          >
            {node.person.letter}
          </span>
        ) : Icon && node.tone ? (
          <span
            className={`relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-b text-white sm:h-9 sm:w-9 sm:rounded-[11px] ${TONE[node.tone]}`}
          >
            {/* Ichki yorug'lik qirrasi — iOS ilova-ikonkasidagi kabi */}
            <span className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/25" />
            <Icon className="relative h-[17px] w-[17px] sm:h-[19px] sm:w-[19px]" />
          </span>
        ) : null}
      </span>
    </span>
  );
}

export function HeroVisual() {
  // Namuna (demo) kontent: matn lug'atda, raqamlar joriy til formatida
  const t = useTranslations('landing.hero');
  const fmt = useFormatNumber();
  const rootRef = useRef<HTMLDivElement>(null);

  /* Ekrandan chiqqanda doimiy harakat to'xtaydi. Atribut to'g'ridan-to'g'ri
     DOM'ga yoziladi — React holati emas (har kesishuvda qayta render yo'q). */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => el.toggleAttribute('data-paused', !entry.isIntersecting),
      { rootMargin: '80px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // AI chipidagi "N ta loyiha" bo'lagi — qalin va qatorga bo'linmaydi
  const b = (chunks: ReactNode) => (
    <span className="whitespace-nowrap font-semibold text-brand-900">{chunks}</span>
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="hub relative mx-auto h-[420px] w-full max-w-[360px] text-start sm:h-[470px] sm:max-w-[480px]"
    >
      {/* ── 1. Nurlar: muammo → markaz → AI / startap ─────────────────── */}
      <svg
        viewBox="0 0 480 470"
        preserveAspectRatio="none"
        className="hub-beams pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        fill="none"
      >
        <defs>
          <linearGradient id="hub-g-in" x1="115" y1="110" x2="240" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF9500" />
            <stop offset="1" stopColor="#007AFF" />
          </linearGradient>
          <linearGradient id="hub-g-ai" x1="255" y1="200" x2="130" y2="372" gradientUnits="userSpaceOnUse">
            <stop stopColor="#007AFF" />
            <stop offset="1" stopColor="#8B7BF3" />
          </linearGradient>
          <linearGradient id="hub-g-out" x1="320" y1="150" x2="440" y2="262" gradientUnits="userSpaceOnUse">
            <stop stopColor="#007AFF" />
            <stop offset="1" stopColor="#5856D6" />
          </linearGradient>
        </defs>

        {BEAMS.map((beam) => (
          <g key={beam.id}>
            {/* Nurning o'zi — yumshoq rangli yo'l */}
            <path
              d={beam.d}
              pathLength={100}
              stroke={`url(#hub-g-${beam.id})`}
              strokeOpacity={0.45}
              strokeWidth={1.6}
              strokeLinecap="round"
              className="hub-beam"
              style={{ '--draw-delay': beam.draw } as CSSProperties}
            />
            {/* Yo'l bo'ylab yuguruvchi yorug'lik impulsi */}
            <path
              d={beam.d}
              pathLength={100}
              stroke={beam.pulse}
              strokeWidth={2.6}
              strokeLinecap="round"
              className="hub-pulse"
              style={{ '--pulse-delay': beam.pd } as CSSProperties}
            />
          </g>
        ))}
      </svg>

      {/* ── 2. Markaz orbitasi ────────────────────────────────────────── */}
      <div className="hub-center pointer-events-none absolute z-10 h-[340px] w-[340px] sm:h-[420px] sm:w-[420px]">
        <div className="hub-bloom absolute inset-0">
          {/* 8 nur + orbitalar (statik chiziqlar) */}
          <svg viewBox="-100 -100 200 200" className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <radialGradient id="hub-ray-fade" cx="0" cy="0" r="150" gradientUnits="userSpaceOnUse">
                <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.45" stopColor="#fff" stopOpacity="1" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <mask id="hub-ray-mask" maskUnits="userSpaceOnUse" x="-160" y="-160" width="320" height="320">
                <circle r="150" fill="url(#hub-ray-fade)" />
              </mask>
            </defs>
            <g mask="url(#hub-ray-mask)" stroke="#007AFF" strokeOpacity="0.2" strokeWidth="0.5">
              {RAYS.map((deg) => (
                <line key={deg} x1="0" y1="0" x2="0" y2="-150" transform={`rotate(${deg})`} />
              ))}
            </g>
            <circle r="60" stroke="#007AFF" strokeOpacity="0.2" strokeWidth="0.45" fill="none" />
            <circle
              r="94"
              stroke="#5856D6"
              strokeOpacity="0.26"
              strokeWidth="0.5"
              strokeDasharray="1.2 3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Kometa — ichki orbita bo'ylab yuguruvchi yorug'lik izi */}
          <div className="hub-spin absolute inset-[20%]" style={{ '--dur': '9s' } as CSSProperties}>
            <span className="hub-comet absolute inset-0 rounded-full" />
            <span className="hub-comet-head absolute left-1/2 top-0 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
          </div>

          {/* Ichki orbita — sohalar */}
          <div className="hub-spin absolute inset-[20%]" style={{ '--dur': '64s' } as CSSProperties}>
            {INNER.map((n) => (
              <OrbitBadge key={n.angle} node={n} counter="hub-spin-rev" />
            ))}
          </div>

          {/* Tashqi orbita — teskari yo'nalishda, sekinroq */}
          <div className="hub-spin-rev absolute inset-[3%]" style={{ '--dur': '96s' } as CSSProperties}>
            {OUTER.map((n) => (
              <OrbitBadge key={n.angle} node={n} counter="hub-spin" />
            ))}
          </div>
        </div>

        {/* Markaz — MYMarkaz belgisi */}
        <div className="absolute left-1/2 top-1/2 h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2">
          <div className="hub-pop absolute inset-0">
            <span className="hub-halo absolute -inset-[55%] rounded-full" />
            <span className="hub-ripple absolute inset-0 rounded-full" />
            <span className="hub-ripple absolute inset-0 rounded-full" style={{ '--i': '2.6s' } as CSSProperties} />
            <span className="hub-scan absolute -inset-[8%] rounded-full" />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white shadow-[0_18px_40px_-14px_rgba(0,64,160,0.45),0_2px_6px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]">
              <LogoMark className="h-[58%] w-[58%]" />
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Boshlanish: hamjamiyat yozgan muammo ─────────────────────── */}
      <div className="absolute start-0 top-[2%] z-20 w-[46%] sm:top-[3%]">
        <div className="hub-float" style={{ '--float-dur': '7.5s', '--float-y': '-5px' } as CSSProperties}>
          <div
            className="hero-enter rounded-ios-xl bg-white p-3.5 shadow-[0_16px_38px_-16px_rgba(20,40,90,0.3)] ring-1 ring-black/[0.04]"
            style={{ '--enter-delay': '0.2s' } as CSSProperties}
          >
            <span className="flex items-center gap-1.5 text-caption-1 font-semibold text-amber-700">
              <span className="relative flex h-2 w-2">
                <span className="hub-live absolute inset-0 rounded-full bg-amber-400" />
                <span className="relative h-2 w-2 rounded-full bg-amber-500" />
              </span>
              {t('problem')}
            </span>
            <p className="mt-1.5 text-subhead leading-snug text-brand-900">{t('problemText')}</p>
            <span className="mt-2.5 flex items-center gap-2 text-caption-1 text-slate-500">
              {/* Yechim yozayotgan hamjamiyat — ikonka o'rniga odamlar */}
              <span className="flex" translate="no">
                {SOLVERS.map(([letter, bg], i) => (
                  <span
                    key={letter}
                    className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[0.5625rem] font-semibold leading-none text-white ring-[1.5px] ring-white ${bg} ${i ? '-ms-1' : ''}`}
                  >
                    {letter}
                  </span>
                ))}
              </span>
              <span>{t('solutions', { count: 34, n: fmt(34) })}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── 4. Tayyor startap — kompozitsiyaning yakuni ───────────────── */}
      <div className="absolute bottom-0 end-0 z-20 w-[58%] sm:w-[52%]">
        <div
          className="hub-float"
          style={{ '--float-dur': '9s', '--float-y': '-7px', '--float-delay': '1.8s' } as CSSProperties}
        >
          <article
            className="hero-enter overflow-hidden rounded-ios-2xl bg-white shadow-[0_26px_60px_-20px_rgba(30,40,120,0.38),0_2px_6px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]"
            style={{ '--enter-delay': '0.4s' } as CSSProperties}
          >
            {/* Muqova — yorug' va rangli (to'q slab emas) + "kitob javoni" rasmi */}
            <div className="hub-cover relative h-[64px] overflow-hidden sm:h-[72px]">
              <svg
                viewBox="0 0 160 64"
                preserveAspectRatio="xMaxYMax slice"
                className="absolute inset-0 h-full w-full"
                fill="#fff"
              >
                {/* Kitob umurtqalari — Kitobxon (kutubxona) mahsulotining ramzi */}
                <g fillOpacity="0.24">
                  <rect x="92" y="24" width="9" height="42" rx="2.5" />
                  <rect x="103" y="15" width="11" height="51" rx="2.5" />
                  <rect x="116" y="28" width="8" height="38" rx="2.5" />
                  <rect x="126" y="12" width="10" height="54" rx="2.5" transform="rotate(9 131 66)" />
                  <rect x="142" y="21" width="9" height="45" rx="2.5" />
                </g>
                <g fillOpacity="0.1">
                  <circle cx="18" cy="-6" r="34" />
                  <circle cx="60" cy="74" r="22" />
                </g>
              </svg>
              <span className="absolute end-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-caption-2 font-semibold text-white ring-1 ring-inset ring-white/35">
                <StarFill className="h-2.5 w-2.5 text-amber-300" /> TOP
              </span>
            </div>

            <div className="px-3.5 pb-3 sm:px-4 sm:pb-3.5">
              <div className="relative z-10 -mt-6 mb-2 flex items-end justify-between gap-2">
                <span className="flex h-12 w-12 items-center justify-center rounded-[13px] bg-gradient-to-b from-iris-400 to-iris-600 text-title-3 font-semibold leading-none text-white shadow-card ring-[3px] ring-white">
                  K
                </span>
                <span className="mb-0.5 rounded-full bg-iris-50 px-2 py-0.5 text-caption-1 font-medium text-iris-700">
                  EdTech
                </span>
              </div>

              {/* "Kitobxon" — namuna mahsulot NOMI (brend), tarjima qilinmaydi */}
              <h3 className="text-headline font-semibold text-brand-900" translate="no">
                Kitobxon
              </h3>
              <p className="mt-0.5 line-clamp-2 text-footnote leading-snug text-slate-500">
                {t('tagline')}
              </p>

              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1" translate="no">
                  <StarFill className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-footnote font-semibold tabular-nums text-brand-900">8.7</span>
                  <span className="text-caption-1 text-slate-500">/10</span>
                </span>
                <span className="inline-flex items-center gap-1 text-caption-1 text-slate-500">
                  <Eye className="h-[14px] w-[14px]" /> <span translate="no">{fmt(1240)}</span>
                </span>
              </div>
            </div>

            <div className="hairline-t flex items-center gap-1.5 bg-emerald-50/70 px-3.5 py-2 text-caption-1 font-medium text-emerald-700 sm:px-4">
              <TrendingUp className="h-[15px] w-[15px]" /> {t('place', { rank: '3' })}
            </div>
          </article>
        </div>
      </div>

      {/* ── 5. Ko'prik: Yechim AI muammoni loyihaga ulaydi ────────────── */}
      <div className="absolute bottom-[4%] start-0 z-20 w-[40%] sm:bottom-[5%] sm:w-[42%]">
        <div
          className="hub-float"
          style={{ '--float-dur': '8.2s', '--float-y': '-4px', '--float-delay': '0.9s' } as CSSProperties}
        >
          <div
            className="hero-enter hub-ai-chip rounded-ios-xl p-3 sm:p-3.5"
            style={{ '--enter-delay': '0.6s' } as CSSProperties}
          >
            <span className="flex items-center gap-2">
              <YechimMark size={22} />
              <span className="text-footnote font-semibold text-brand-900">Yechim AI</span>
            </span>
            <p className="mt-1.5 text-caption-1 leading-snug text-slate-500 sm:text-subhead">
              {/* Tor chipda jumla qisqaradi (kontekstni "Muammo" kartasi beradi).
                  Ikki to'liq jumla — tillarda so'z tartibi har xil. */}
              <span className="hidden sm:inline">{t.rich('aiFound', { count: 2, n: fmt(2), b })}</span>
              <span className="sm:hidden">{t.rich('aiFoundShort', { count: 2, n: fmt(2), b })}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
