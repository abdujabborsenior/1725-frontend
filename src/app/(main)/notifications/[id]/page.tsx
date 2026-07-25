'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Spinner } from '@/components/icons';
import { notificationsApi } from '@/lib/api';
import { notificationTarget } from '@/lib/notification-meta';

/**
 * Bildirishnoma `byId` orqali ochish — chuqur havola (deep link) hal qiluvchi.
 * getById bilan o'qilgan deb belgilaydi va xavfsiz manzilga yo'naltiradi.
 * Yaroqsiz/noma'lum havolada 404 emas — bildirishnomalar ro'yxatiga qaytaramiz.
 */
export default function NotificationByIdPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    let active = true;
    notificationsApi
      .getById(id)
      .then((n) => {
        if (!active) return;
        void qc.invalidateQueries({ queryKey: ['notifications'] });
        void qc.invalidateQueries({ queryKey: ['notifications-unread'] });
        void qc.invalidateQueries({ queryKey: ['notifications-recent'] });
        router.replace(notificationTarget(n.link) ?? '/notifications');
      })
      .catch(() => {
        if (active) router.replace('/notifications');
      });
    return () => {
      active = false;
    };
  }, [id, router, qc]);

  return (
    <div className="flex justify-center py-32">
      <Spinner className="h-6 w-6 animate-spin text-slate-300" />
    </div>
  );
}
