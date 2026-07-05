import {
  CheckCircle2,
  XCircle,
  Award,
  UserPlus,
  MessageCircle,
  Info,
  Rocket,
  type LucideIcon,
} from 'lucide-react';
import type { NotificationType } from '@/types';

/**
 * Bildirishnoma turi → ikona + rang. Bitta manbadan (bell va to'liq sahifa
 * bir xil ko'rinsin). Ikonalar loyihaga mos — "AI" uslubidagi belgilar yo'q.
 */
export const NOTIFICATION_META: Record<
  NotificationType,
  { icon: LucideIcon; color: string }
> = {
  problem_approved: { icon: CheckCircle2, color: 'text-accent-600 bg-accent-50' },
  problem_rejected: { icon: XCircle, color: 'text-rose-600 bg-rose-50' },
  solution_accepted: { icon: Award, color: 'text-amber-600 bg-amber-50' },
  solution_rejected: { icon: XCircle, color: 'text-rose-600 bg-rose-50' },
  new_follower: { icon: UserPlus, color: 'text-iris-600 bg-iris-50' },
  founder_badge: { icon: Rocket, color: 'text-accent-700 bg-accent-50' },
  new_message: { icon: MessageCircle, color: 'text-sky-600 bg-sky-50' },
  system: { icon: Info, color: 'text-slate-600 bg-slate-100' },
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
