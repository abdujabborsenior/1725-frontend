/**
 * Matn kiritish sirtining YAGONA manbai.
 *
 * Input, Textarea, Select, PasswordField, SearchField va qo'lda yozilgan
 * maydonlar — hammasi shu yerdan oladi. Sabab (2026-08-29 direktivasi):
 * maydon sirti loyiha bo'ylab bir xil bo'lishi shart, va kulrang fill
 * (`.ios-search`) kulrang sahifa fonida (#F2F2F7) amalda ko'rinmay qolardi —
 * kulrang ustidagi kulrang matn bilan birga maydon "yo'q" bo'lib ketardi.
 *
 * Qoida: yangi maydon YOZILMAYDI — shu konstantalar ishlatiladi.
 */

/** Sirt: oq fon + hairline chegara + iOS fokus halqasi. */
export const FIELD_SURFACE =
  'w-full rounded-ios-md border border-slate-200 bg-white text-body text-brand-900 ' +
  'placeholder:text-slate-500 transition-[border-color,box-shadow] duration-150 ease-ios ' +
  'enabled:hover:border-slate-300 focus:outline-none input-focus';

/** Balandlik + gorizontal chekinish. `md` — standart (48px, iOS tegish maydoni). */
export const FIELD_SIZE = {
  md: 'h-12 px-4',
  sm: 'h-10 px-3.5',
} as const;

/** Xato holati — chegara qizil, fokus halqasi ham qizil. */
export const FIELD_INVALID =
  'border-rose-400 focus:border-rose-500 focus:shadow-[0_0_0_4px_rgba(255,59,48,0.16)]';

/** Maydon yorlig'i, xato va izoh matnlari (bir xil tipografiya). */
export const FIELD_LABEL = 'text-subhead font-medium text-slate-500';
export const FIELD_ERROR_TEXT = 'text-footnote text-rose-600';
export const FIELD_HINT_TEXT = 'text-footnote text-slate-500';

/** Maydon ichidagi ikonka (chap/o'ng) rangi — placeholder bilan bir og'irlikda. */
export const FIELD_ICON = 'text-slate-400';
