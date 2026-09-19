import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { MessageType } from '@/types';

/**
 * Chat matnlarining umumiy yordamchilari (i18n).
 *
 * Xabar TURI yorliqlari (`chat.type.*`) bir nechta joyda kerak: cheklovlar
 * banneri, guruh ma'lumoti va sozlamalari, suhbatlar ro'yxatidagi oldindan
 * ko'rish — yorliq bitta joydan olinadi.
 */
export const MESSAGE_TYPE_KEYS = ['text', 'image', 'video', 'voice', 'round_video', 'file'] as const;
export type MessageTypeKey = (typeof MESSAGE_TYPE_KEYS)[number];

export function isMessageTypeKey(value: string): value is MessageTypeKey {
  return (MESSAGE_TYPE_KEYS as readonly string[]).includes(value);
}

/** Platforma darajasida vaqtincha o'chirilgan tur sababi — `chat.disabled.*` kaliti. */
export function disabledReasonKey(type: MessageType): 'voice' | 'round_video' | 'video' | 'other' {
  return type === 'voice' || type === 'round_video' || type === 'video' ? type : 'other';
}

/**
 * Backend (`chat.service` → `PREVIEW`) matnsiz xabar uchun suhbatning oxirgi
 * xabar ko'rinishini O'ZBEKCHA KANONIK qiymat sifatida bazaga yozadi. Bu —
 * ma'lumot (DB qiymati), ko'rsatiladigan matn emas: ekranda joriy tilga
 * o'giriladi (`useChatText().preview`). Lokal kesh yangilanganda ham aynan shu
 * qiymat yoziladi — keyingi server javobi bilan bir xil bo'lsin.
 */
export const CANONICAL_PREVIEW: Readonly<Record<string, string>> = {
  image: 'Rasm',
  video: 'Video',
  voice: 'Ovozli xabar',
  round_video: 'Video xabar',
  file: 'Fayl',
};

// Map (oddiy obyekt emas): foydalanuvchi matni "constructor" kabi bo'lsa ham
// prototip xossasi "topilib" qolmasin.
const PREVIEW_TYPE = new Map<string, MessageTypeKey>(
  Object.entries(CANONICAL_PREVIEW).map(([type, text]) => [text, type as MessageTypeKey]),
);

/** Backend tizim xabari (guruhdan chiqish): `${fullName} guruhdan chiqdi`. */
const SYSTEM_LEFT_GROUP = /^(.+) guruhdan chiqdi$/;

/**
 * `typeLabel` — xabar turi yorlig'i (noma'lum tur o'zgarishsiz qaytadi);
 * `system` — backend tizim xabari joriy tilda;
 * `preview` — suhbatlar ro'yxatidagi oxirgi xabar ko'rinishi joriy tilda.
 */
export function useChatText() {
  const t = useTranslations('chat');
  return useMemo(() => {
    const typeLabel = (type: string) => (isMessageTypeKey(type) ? t(`type.${type}`) : type);
    const system = (text: string) => {
      const match = SYSTEM_LEFT_GROUP.exec(text);
      return match ? t('system.leftGroup', { name: match[1] }) : text;
    };
    const preview = (text: string) => {
      const type = PREVIEW_TYPE.get(text);
      return type ? t(`type.${type}`) : system(text);
    };
    return { typeLabel, system, preview };
  }, [t]);
}
