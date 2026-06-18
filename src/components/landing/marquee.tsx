'use client';

import {
  Smartphone, Globe, Bot, Brain, ShoppingBag, GraduationCap,
  Gamepad2, HeartPulse, Sprout, Camera, Music, Wallet,
} from 'lucide-react';

/** Hamjamiyat shu yerda nimalar quryapti — cheksiz aylanuvchi qator. */
const ITEMS: { icon: React.ElementType; label: string }[] = [
  { icon: Smartphone, label: 'Mobil ilovalar' },
  { icon: Bot, label: 'Telegram botlar' },
  { icon: Globe, label: 'Veb-saytlar' },
  { icon: Brain, label: 'AI yechimlar' },
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
            className="flex flex-none items-center gap-2.5 rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 shadow-soft backdrop-blur"
          >
            <Icon className="h-4 w-4 text-accent-600" />
            <span className="whitespace-nowrap text-sm font-semibold text-brand-800">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
