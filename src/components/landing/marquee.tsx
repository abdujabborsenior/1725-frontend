'use client';

import {
  Smartphone, Globe, Bot, Layers, ShoppingBag, GraduationCap,
  Gamepad2, HeartPulse, Sprout, Camera, Music, Wallet,
} from '@/components/icons';

/** Hamjamiyat shu yerda nimalar quryapti — cheksiz aylanuvchi qator. */
const ITEMS: { icon: React.ElementType; label: string }[] = [
  { icon: Smartphone, label: 'Mobil ilovalar' },
  { icon: Bot, label: 'Telegram botlar' },
  { icon: Globe, label: 'Veb-saytlar' },
  { icon: Layers, label: 'SaaS xizmatlar' },
  { icon: ShoppingBag, label: 'Onlayn do‘konlar' },
  { icon: GraduationCap, label: 'EdTech loyihalar' },
  { icon: Gamepad2, label: 'O‘yinlar' },
  { icon: HeartPulse, label: 'Sog‘liq xizmatlari' },
  { icon: Sprout, label: 'AgroTech' },
  { icon: Camera, label: 'Kontent platformalar' },
  { icon: Music, label: 'Kreativ loyihalar' },
  { icon: Wallet, label: 'FinTech g‘oyalar' },
];

export function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee-mask relative overflow-hidden py-1">
      <div className="flex w-max animate-marquee gap-3">
        {row.map(({ icon: Icon, label }, i) => (
          <div
            key={i}
            className="flex flex-none items-center gap-2 rounded-full bg-fill-tertiary px-3.5 py-2"
          >
            <Icon className="h-[17px] w-[17px] text-slate-500" />
            <span className="whitespace-nowrap text-subhead font-medium text-brand-900">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
