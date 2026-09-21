'use client';

import { useTranslations } from 'next-intl';
import {
  Smartphone, Globe, Bot, Layers, ShoppingBag, GraduationCap,
  Gamepad2, HeartPulse, Sprout, Camera, Music, Wallet,
} from '@/components/icons';

type MarqueeKey =
  | 'apps' | 'bots' | 'websites' | 'saas' | 'shops' | 'edtech'
  | 'games' | 'health' | 'agrotech' | 'content' | 'creative' | 'fintech';

/**
 * Hamjamiyat shu yerda nimalar quryapti — cheksiz aylanuvchi qator.
 * Yorliqlar — lug'atda (`landing.marquee.<key>`).
 *
 * Har soha o'z iOS system rangidagi doira-belgi bilan (hero orbitasidagi
 * soha belgilari bilan bir oila): ilgari kulrang plomba ustidagi kulrang
 * ikonka edi — qator "o'chiq" ko'rinardi. Sirt oq + hairline: 12 ta
 * yonma-yon turganda ekranni kulrang qilib qo'ymaydi (charter §2.9.1).
 */
const ITEMS: { icon: React.ElementType; key: MarqueeKey; tone: string }[] = [
  { icon: Smartphone, key: 'apps', tone: 'from-amber-300 to-amber-600' },
  { icon: Bot, key: 'bots', tone: 'from-accent-400 to-accent-600' },
  { icon: Globe, key: 'websites', tone: 'from-sky-300 to-sky-500' },
  { icon: Layers, key: 'saas', tone: 'from-iris-400 to-iris-600' },
  { icon: ShoppingBag, key: 'shops', tone: 'from-pink-400 to-pink-600' },
  { icon: GraduationCap, key: 'edtech', tone: 'from-violet-400 to-violet-600' },
  { icon: Gamepad2, key: 'games', tone: 'from-teal-400 to-teal-600' },
  { icon: HeartPulse, key: 'health', tone: 'from-red-400 to-red-600' },
  { icon: Sprout, key: 'agrotech', tone: 'from-emerald-400 to-emerald-600' },
  { icon: Camera, key: 'content', tone: 'from-accent-300 to-iris-500' },
  { icon: Music, key: 'creative', tone: 'from-pink-300 to-violet-500' },
  { icon: Wallet, key: 'fintech', tone: 'from-emerald-500 to-teal-600' },
];

export function Marquee() {
  const t = useTranslations('landing.marquee');
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee-mask relative overflow-hidden py-1.5">
      <div className="flex w-max animate-marquee gap-2.5">
        {row.map(({ icon: Icon, key, tone }, i) => (
          <div
            key={i}
            className="flex flex-none items-center gap-2 rounded-full bg-white py-1.5 pe-3.5 ps-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.06]"
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b text-white ${tone}`}
            >
              <Icon className="h-[15px] w-[15px]" />
            </span>
            <span className="whitespace-nowrap text-subhead font-medium text-brand-900">
              {t(key)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
