'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Loader2, Users, Hash, Globe, Lock, MessageCircle } from 'lucide-react';
import { chatApi, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { CreateGroupModal } from '@/components/chat/create-group-modal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminGroupsPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: string; title: string } | null>(null);

  const { data: groups, isLoading } = useQuery({
    queryKey: ['admin-groups'],
    queryFn: () => chatApi.allGroups(),
  });

  const del = useMutation({
    mutationFn: (id: string) => chatApi.deleteGroup(id),
    onSuccess: () => {
      toast.success('Guruh o‘chirildi');
      setToDelete(null);
      void qc.invalidateQueries({ queryKey: ['admin-groups'] });
      void qc.invalidateQueries({ queryKey: ['home-groups'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-900">Guruhlar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Jami {groups?.length ?? '—'} ta guruh</p>
        </div>
        <Button variant="accent" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Yangi guruh
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 text-slate-300 animate-spin" /></div>
        ) : groups && groups.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {groups.map((g) => (
              <div key={g.id} className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                {g.avatarUrl ? (
                  <Avatar src={g.avatarUrl} name={g.title ?? 'G'} size={44} />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-iris text-white shrink-0"><Hash className="h-5 w-5" /></span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-brand-900 truncate">{g.title}</p>
                    {g.isPublic ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent-700 bg-accent-50 px-1.5 py-0.5 rounded"><Globe className="h-3 w-3" /> Ommaviy</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"><Lock className="h-3 w-3" /> Yopiq</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate flex items-center gap-2">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {g.participantCount}</span>
                    <span>· {format(new Date(g.createdAt), 'dd.MM.yyyy')}</span>
                  </p>
                </div>
                <Link href={`/messages/${g.id}`} target="_blank"
                  className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-accent-600 hover:bg-accent-50" title="Ochish">
                  <MessageCircle className="h-4 w-4" />
                </Link>
                <button onClick={() => setToDelete({ id: g.id, title: g.title ?? 'Guruh' })}
                  className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="O‘chirish">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Hozircha guruhlar yo‘q</p>
          </div>
        )}
      </div>

      <CreateGroupModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} className="max-w-sm">
        <div className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="h-7 w-7 text-rose-600" />
        </div>
        <h3 className="text-lg font-bold text-brand-900 text-center mb-2">Guruhni o‘chirish</h3>
        <p className="text-sm text-slate-600 text-center mb-6">
          <b>{toDelete?.title}</b> guruhi va undagi barcha xabarlar butunlay o‘chiriladi.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setToDelete(null)}>Bekor qilish</Button>
          <Button variant="danger" fullWidth loading={del.isPending} onClick={() => toDelete && del.mutate(toDelete.id)}>O‘chirish</Button>
        </div>
      </Modal>
    </div>
  );
}
