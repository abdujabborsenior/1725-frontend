import { cn } from '@/lib/utils';

/**
 * Tasdiq muhrining konturi — 12 lobli nozik "scallop" (markaz 12,12;
 * asos radiusi 10.5, har bo'lak radiusi 4.2 → bo'rtiq atigi ~1px).
 * Geometriya hisoblab chiqilgan: belgining tashqi radiusi 11.14 —
 * 24px ramka ichida optik jihatdan markazlashgan.
 *
 * Nega oddiy doira-galochka emas: `CheckCircleFill` ilovada "bajarildi/
 * tasdiqlandi" ma'nosida ishlatiladi (masalan email tasdig'i). Muhr shakli
 * uni HISOBGA tegishli, boshqa ma'nodagi belgi sifatida ajratib turadi.
 */
const SEAL =
  'M12 1.5A4.2 4.2 0 0 1 17.25 2.91A4.2 4.2 0 0 1 21.09 6.75A4.2 4.2 0 0 1 22.5 12' +
  'A4.2 4.2 0 0 1 21.09 17.25A4.2 4.2 0 0 1 17.25 21.09A4.2 4.2 0 0 1 12 22.5' +
  'A4.2 4.2 0 0 1 6.75 21.09A4.2 4.2 0 0 1 2.91 17.25A4.2 4.2 0 0 1 1.5 12' +
  'A4.2 4.2 0 0 1 2.91 6.75A4.2 4.2 0 0 1 6.75 2.91A4.2 4.2 0 0 1 12 1.5Z';

/**
 * **Tasdiqlangan hisob** — ism/username yonidagi galochka.
 *
 * Tamg'ani FAQAT superadmin qo'yadi (avtomatik shart yo'q) va u hammaga
 * ko'rinadi. Rang `accent-600` (#0071E3): ichidagi oq galochka 4.6:1 —
 * grafik element uchun talab qilinadigan 3:1 dan yuqori.
 */
export function VerifiedBadge({
  size = 16,
  className,
  label = 'Tasdiqlangan hisob',
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className={cn('inline-block shrink-0 align-[-0.15em] text-accent-600', className)}
    >
      <title>{label}</title>
      <path d={SEAL} fill="currentColor" />
      <path
        d="M7.9 12.2 10.6 15l5.5-5.9"
        fill="none"
        stroke="#fff"
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
