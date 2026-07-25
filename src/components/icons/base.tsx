/* AVTO-GENERATSIYA — qo'lda tahrirlanmaydi.
   Manba: Ionicons 8 (MIT) — iOS uchun chizilgan asl to'plam.
   Generator: scripts/gen-icons.js */
import type { ReactElement, SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  /** Chiziq qalinligi — 24-grid o'lchovida (ikonka 512-gridga o'zi o'giradi). */
  strokeWidth?: number | string;
}

/** Ikonka komponenti tipi (props sifatida uzatiladigan ikonkalar uchun). */
export type IconComponent = (props: IconProps) => ReactElement;

const GRID = 512 / 24;

/**
 * Barcha iOS ikonkalari uchun umumiy SVG asos.
 * Ionicons 512-gridda chizilgan; `strokeWidth` propi odatiy 24-grid
 * qiymatida beriladi va shu yerda masshtablanadi.
 */
export function IconBase({
  nativeStroke = 32,
  strokeWidth,
  children,
  ...rest
}: IconProps & { nativeStroke?: number }) {
  const sw = strokeWidth === undefined ? nativeStroke : Number(strokeWidth) * GRID;
  return (
    <svg
      viewBox="0 0 512 512"
      width="1em"
      height="1em"
      fill="currentColor"
      stroke="none"
      strokeWidth={sw || undefined}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}
