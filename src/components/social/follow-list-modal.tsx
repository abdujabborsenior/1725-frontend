'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, Users } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
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
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
          </div>
        ) : data && data.data.length > 0 ? (
          data.data.map((u) => (
            <UserListItem key={u.id} user={u} onClick={onClose} />
          ))
        ) : (
          <div className="py-12 text-center">
            <Users className="mx-auto mb-2 h-7 w-7 text-slate-300" />
            <p className="text-sm text-slate-500">
              {mode === 'followers' ? 'Hali obunachilar yo‘q' : 'Hali hech kimga obuna bo‘lmagan'}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
