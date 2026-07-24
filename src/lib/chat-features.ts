import type { MessageType } from '@/types';

/**
 * VAQTINCHA o'chirilgan chat imkoniyatlari (2026-07-24 direktivasi):
 * ovozli xabar, dumaloq video xabar va video yuborish.
 *
 * Backenddagi `1725/src/modules/chat/chat-features.ts` bilan JUFT — server ham
 * shu turlarni rad etadi (mijoz to'sig'ini chetlab o'tib bo'lmaydi).
 * **Qayta yoqish**: shu ro'yxatdan turni olib tashlash kifoya.
 */
export const DISABLED_CHAT_TYPES: readonly MessageType[] = [
  'voice',
  'round_video',
  'video',
];

const DISABLED = new Set<MessageType>(DISABLED_CHAT_TYPES);

export function isChatTypeDisabled(type: MessageType): boolean {
  return DISABLED.has(type);
}

export const VOICE_ENABLED = !DISABLED.has('voice');
export const ROUND_VIDEO_ENABLED = !DISABLED.has('round_video');
export const VIDEO_ENABLED = !DISABLED.has('video');

/** Fayl tanlash dialogining `accept` qiymati — o'chirilgan turlarsiz */
export function fileAccept(base: 'media' | 'all'): string {
  const parts: string[] = ['image/*'];
  if (VIDEO_ENABLED) parts.push('video/*');
  if (base === 'all') {
    if (VOICE_ENABLED) parts.push('audio/*');
    parts.push(
      'application/pdf',
      '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar',
    );
  }
  return parts.join(',');
}

/** Foydalanuvchiga ko'rinadigan sabab */
export const DISABLED_CHAT_REASON: Record<string, string> = {
  voice: 'Ovozli xabarlar vaqtincha o‘chirilgan',
  round_video: 'Video xabarlar vaqtincha o‘chirilgan',
  video: 'Video yuborish vaqtincha o‘chirilgan',
};
