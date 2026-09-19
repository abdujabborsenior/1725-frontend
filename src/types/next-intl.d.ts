import type { routing } from '@/i18n/routing';
import type messages from '../../messages/uz.json';

/**
 * Qat'iy tiplangan tarjimalar: `t('kalit')` da kalit xatosi yoki ICU
 * xabardagi `{param}` ning yetishmasligi — kompilyatsiya xatosi.
 *
 * Manba — o'zbekcha fayl (asosiy til). Ruscha/inglizcha fayllarning kalit
 * to'plami u bilan AYNAN bir xil ekanini `npm run i18n:check` tekshiradi.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
