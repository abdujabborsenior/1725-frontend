import {
  CheckCircleFill,
  CloseCircleFill,
  Ribbon,
  UserPlus,
  MessageCircleFill,
  InfoFill,
  RocketFill,
  type LucideIcon,
} from '@/components/icons';
import type { NotificationType } from '@/types';

/**
 * Bildirishnoma turi → ikona + rang. Bitta manbadan (bell va to'liq sahifa
 * bir xil ko'rinsin). Ikonalar loyihaga mos — "AI" uslubidagi belgilar yo'q.
 */
export const NOTIFICATION_META: Record<
  NotificationType,
  { icon: LucideIcon; color: string }
> = {
  problem_approved: { icon: CheckCircleFill, color: 'bg-emerald-400 text-white' },
  problem_rejected: { icon: CloseCircleFill, color: 'bg-rose-500 text-white' },
  solution_accepted: { icon: Ribbon, color: 'bg-amber-500 text-white' },
  solution_rejected: { icon: CloseCircleFill, color: 'bg-rose-500 text-white' },
  new_follower: { icon: UserPlus, color: 'bg-iris-500 text-white' },
  founder_badge: { icon: RocketFill, color: 'bg-accent-500 text-white' },
  // iOS'da Xabarlar ilovasi yashil — bildirishnoma belgisi ham shunday
  new_message: { icon: MessageCircleFill, color: 'bg-emerald-400 text-white' },
  system: { icon: InfoFill, color: 'bg-slate-400 text-white' },
};

export function notificationMeta(type: NotificationType) {
  return NOTIFICATION_META[type] ?? NOTIFICATION_META.system;
}

/** Ilovada mavjud bo'lgan yuqori darajadagi yo'l segmentlari */
const KNOWN_SEGMENTS = new Set([
  '', // ildiz "/"
  'discover',
  'leaderboard',
  'messages',
  'notifications',
  'polls',
  'problems',
  'profile',
  'settings',
  'solutions',
  'startups',
  'u',
]);

/**
 * Bildirishnoma havolasini xavfsiz ichki manzilga aylantiradi.
 * - bo'sh / tashqi havola → null (hech qayoqqa o'tmaymiz)
 * - noma'lum yo'l (mavjud bo'lmagan route) → `/notifications` (404 oldini olamiz)
 * - mavjud route → o'zini qaytaradi
 */
export function notificationTarget(
  link: string | null | undefined,
): string | null {
  if (!link || !link.startsWith('/')) return null;
  const segment = link.split('?')[0].split('#')[0].split('/')[1] ?? '';
  return KNOWN_SEGMENTS.has(segment) ? link : '/notifications';
}
