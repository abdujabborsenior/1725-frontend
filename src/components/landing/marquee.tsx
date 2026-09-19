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
 */
const ITEMS: { icon: React.ElementType; key: MarqueeKey }[] = [
  { icon: Smartphone, key: 'apps' },
  { icon: Bot, key: 'bots' },
  { icon: Globe, key: 'websites' },
  { icon: Layers, key: 'saas' },
  { icon: ShoppingBag, key: 'shops' },
  { icon: GraduationCap, key: 'edtech' },
  { icon: Gamepad2, key: 'games' },
  { icon: HeartPulse, key: 'health' },
  { icon: Sprout, key: 'agrotech' },
  { icon: Camera, key: 'content' },
  { icon: Music, key: 'creative' },
  { icon: Wallet, key: 'fintech' },
];

export function Marquee() {
  const t = useTranslations('landing.marquee');
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee-mask relative overflow-hidden py-1">
      <div className="flex w-max animate-marquee gap-3">
        {row.map(({ icon: Icon, key }, i) => (
          <div
            key={i}
            className="flex flex-none items-center gap-2 rounded-full bg-fill-tertiary px-3.5 py-2"
          >
            <Icon className="h-[17px] w-[17px] text-slate-500" />
            <span className="whitespace-nowrap text-subhead font-medium text-brand-900">
              {t(key)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
