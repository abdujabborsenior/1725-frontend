import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * MUHIM: iOS tipografiya klasslari (`text-body`, `text-footnote`, ...) standart
 * tailwind-merge'ga NOTANISH — u ularni RANG deb hisoblab, `text-white` kabi
 * haqiqiy rang klassini o'chirib yuborardi (masalan, "Obuna bo'lish" tugmasida
 * oq yozuv qora bo'lib qolgan edi). Shu ro'yxat orqali ular font-size guruhiga
 * ro'yxatdan o'tkaziladi — endi rang va o'lcham bir-birini bekor qilmaydi.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'large-title',
            'title-1',
            'title-2',
            'title-3',
            'headline',
            'body',
            'callout',
            'subhead',
            'footnote',
            'caption-1',
            'caption-2',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
