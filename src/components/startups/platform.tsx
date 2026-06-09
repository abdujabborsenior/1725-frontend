'use client';

import { Globe, Link2, type LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLATFORM_META } from '@/lib/constants';
import type { PlatformType, StartupPlatform } from '@/types';

/* ── Brand glyphs (inline SVG — lucide brand ikonkalari yo'q) ───── */
function AppleGlyph(props: LucideProps) {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" {...props}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function PlayGlyph(props: LucideProps) {
  return (
    <svg viewBox="0 0 512 512" {...props}>
      <path fill="#00D2FF" d="M48 59.5v393c0 5.3 6.3 8 10 4.3l203.7-200.5L58 55.2c-3.7-3.7-10-1-10 4.3z" />
      <path fill="#00E676" d="M58 55.2 322 308l68.5-67.5L93.7 38.3C82.5 31.8 67 38 58 55.2z" opacity=".9" />
      <path fill="#FFCE00" d="M390.5 240.5 322 308l68.5 67.5 78.2-46.3c17.6-10.4 17.6-37.9 0-48.3l-78.2-40.4z" />
      <path fill="#FF3D00" d="M58 456.8 322 204l68.5 67.5L93.7 473.7C82.5 480.2 67 474 58 456.8z" opacity=".9" />
    </svg>
  );
}

function TelegramGlyph(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  );
}

/* ── Public API ────────────────────────────────────────────────── */
export function PlatformIcon({
  type,
  className,
}: {
  type: PlatformType;
  className?: string;
}) {
  const cls = cn('h-4 w-4', className);
  switch (type) {
    case 'ios':
      return <AppleGlyph className={cls} />;
    case 'android':
      return <PlayGlyph className={cls} />;
    case 'telegram_bot':
      return <TelegramGlyph className={cls} />;
    case 'website':
      return <Globe className={cls} />;
    default:
      return <Link2 className={cls} />;
  }
}

/** Filtr / meta chip — kichik rangli teg */
export function PlatformChip({
  type,
  className,
}: {
  type: PlatformType;
  className?: string;
}) {
  const meta = PLATFORM_META[type];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border',
        meta.chipClass,
        className,
      )}
    >
      <PlatformIcon type={type} className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

/**
 * Real do'kon badge'i — App Store / Google Play uslubidagi qora tugma,
 * yoki sayt/Telegram uchun rangli CTA. Bosilganda yangi tabda ochiladi.
 */
export function StoreButton({
  platform,
  onClickCapture,
  className,
}: {
  platform: StartupPlatform;
  onClickCapture?: () => void;
  className?: string;
}) {
  const meta = PLATFORM_META[platform.type];
  const isStore = platform.type === 'ios' || platform.type === 'android';

  return (
    <a
      href={platform.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClickCapture}
      className={cn(
        'group inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5 font-semibold transition-all btn-lift',
        meta.badgeClass,
        className,
      )}
    >
      <PlatformIcon type={platform.type} className="h-5 w-5 shrink-0" />
      <span className="flex flex-col items-start leading-none text-left">
        <span className="text-[9px] font-medium uppercase tracking-wide opacity-80">
          {isStore ? meta.storeKicker : 'OCHISH'}
        </span>
        <span className="text-sm font-bold mt-0.5">
          {platform.label || meta.storeName}
        </span>
      </span>
    </a>
  );
}
