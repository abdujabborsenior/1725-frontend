'use client';

import { useQuery } from '@tanstack/react-query';
import { Users } from '@/components/icons';
import { usersApi } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { UserRowSkeleton } from '@/components/ui/skeleton';
import { UserListItem } from './user-list-item';

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  mode: 'followers' | 'following';
}

export function FollowListModal({ open, onClose, userId, mode }: Props) {
  const title = mode === 'followers' ? 'Obunachilar' : 'Obunalar';

  const { data, isLoading } = useQuery({
    queryKey: ['follow-list', mode, userId],
    queryFn: () =>
      mode === 'followers'
        ? usersApi.followers(userId, { limit: 50 })
        : usersApi.following(userId, { limit: 50 }),
    enabled: open,
  });

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-md">
      <div className="-mx-2 max-h-[60vh] overflow-y-auto chat-scroll">
        {isLoading ? (
          <UserRowSkeleton rows={5} />
        ) : data && data.data.length > 0 ? (
          data.data.map((u) => (
            <UserListItem key={u.id} user={u} onClick={onClose} />
          ))
        ) : (
          <div className="py-12 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-ios-lg bg-accent-50 text-accent-500"><Users className="h-6 w-6" /></span>
            <p className="text-subhead text-slate-500">
              {mode === 'followers' ? 'Hali obunachilar yo‘q' : 'Hali hech kimga obuna bo‘lmagan'}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
