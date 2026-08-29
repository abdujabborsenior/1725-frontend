'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { MessageCircleFill } from '@/components/icons';
import { chatApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

/**
 * Suzuvchi suhbat tugmasi — iOS doiraviy amal tugmasi (Compose naqshi).
 *
 * Vazifasi BITTA: suhbatlarni ochish. Ilgari u faqat bosh sahifada turardi
 * va mehmonni `/register` ga yuborardi — ya'ni amalda ro'yxatdan o'tish
 * tugmasi edi va tizimga kirgandan keyin (login `/problems` ga qaytaradi)
 * umuman ko'rinmasdi. Endi:
 *
 *  · faqat KIRGAN foydalanuvchiga ko'rinadi (mehmonda suhbat yo'q — tugma
 *    boshqa amalning niqobi bo'lib qolmaydi);
 *  · barcha asosiy sahifalarda turadi (layout darajasida), ya'ni kirgandan
 *    keyin yo'qolmaydi;
 *  · o'qilmagan xabarlar sonini ko'rsatadi — bu uni "dekor tugma"dan
 *    haqiqiy vositaga aylantiradi;
 *  · mobilda YASHIRIN: pastki tab bar'da "Suhbat" bandi allaqachon bor,
 *    ikkinchi nusxa tab bar ustiga tushib xalaqit berardi.
 */
export function ChatFab() {
  const { token } = useAuthStore();
  const pathname = usePathname();

  const { data } = useQuery({
    queryKey: ['chat-unread'],
    queryFn: () => chatApi.unreadCount(),
    enabled: !!token,
    refetchInterval: 20_000,
  });

  // Suhbatlar sahifasining o'zida ma'nosiz.
  if (!token || pathname.startsWith('/messages')) return null;

  const unread = data?.count ?? 0;

  return (
    <Link
      href="/messages"
      aria-label={unread > 0 ? `Suhbatlar — ${unread} ta o'qilmagan` : 'Suhbatlar'}
      title="Suhbatlar"
      className="group fixed bottom-8 right-8 z-40 hidden md:block motion-safe:animate-pop-in"
    >
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-white shadow-lift transition-[background-color,box-shadow,transform] duration-150 ease-ios group-hover:bg-accent-700 group-hover:shadow-glow-accent group-active:scale-95">
        <MessageCircleFill className="h-[26px] w-[26px]" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-caption-2 font-bold text-white ring-[3px] ring-surface-soft">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </span>
    </Link>
  );
}
