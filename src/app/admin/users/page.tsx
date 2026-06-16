'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Search, ShieldCheck, ShieldOff, Loader2, Users as UsersIcon, ExternalLink } from 'lucide-react';
import { usersApi, getErrorMessage } from '@/lib/api';
import { ROLE_LABEL, ROLE_BADGE } from '@/lib/constants';
import type { User, UserRole } from '@/types';
import { useDebounce } from '@/lib/use-debounce';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ROLES: UserRole[] = [
  'user', 'school_student', 'university_student', 'analyzer', 'superadmin',
];

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { page, search: debouncedSearch, role }],
    queryFn: () => usersApi.list({
      page, limit: 15,
      search: debouncedSearch || undefined,
      role: role || undefined,
    }),
    placeholderData: keepPreviousData,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => usersApi.updateRole(id, role),
    onSuccess: () => { toast.success('Rol yangilandi'); void qc.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const activeMutation = useMutation({
    mutationFn: (id: string) => usersApi.toggleActive(id),
    onSuccess: (res) => {
      toast.success(res.isActive ? 'Faollashtirildi' : 'Bloklandi');
      void qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-900">Foydalanuvchilar</h1>
        <p className="text-sm text-slate-500 mt-0.5">Jami {data?.meta.total ?? '—'} ta</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Ism yoki email bo'yicha qidirish..."
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none input-focus transition-all"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <button onClick={() => { setRole(''); setPage(1); }}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap', role === '' ? 'bg-brand-900 text-white' : 'text-slate-600 hover:bg-slate-50')}>
            Barchasi
          </button>
          {ROLES.map((r) => (
            <button key={r} onClick={() => { setRole(r); setPage(1); }}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap', role === r ? 'bg-brand-900 text-white' : 'text-slate-600 hover:bg-slate-50')}>
              {ROLE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 text-slate-300 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <UsersIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" /> Foydalanuvchilar topilmadi
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((u: User) => (
              <div key={u.id} className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                <Avatar src={u.avatarUrl} name={u.fullName} size={40} />
                <div className="flex-1 min-w-[160px]">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-brand-900 truncate">{u.fullName}</p>
                    {u.username && <span className="text-xs text-slate-400">@{u.username}</span>}
                    {!u.isActive && <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Bloklangan</span>}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>

                <span className="text-[11px] text-slate-400 hidden md:block">
                  {format(new Date(u.createdAt), 'dd.MM.yyyy')}
                </span>

                {u.username && (
                  <Link href={`/u/${u.username}`} target="_blank" title="Profilni ko'rish"
                    className="h-8 w-8 hidden sm:flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}

                <select
                  value={u.role}
                  onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value as UserRole })}
                  className={cn('h-8 px-2 pr-7 rounded-lg border text-xs font-semibold appearance-none cursor-pointer focus:outline-none', ROLE_BADGE[u.role])}
                >
                  {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                </select>

                <button
                  onClick={() => activeMutation.mutate(u.id)}
                  title={u.isActive ? 'Bloklash' : 'Faollashtirish'}
                  className={cn('h-8 w-8 flex items-center justify-center rounded-lg transition-all',
                    u.isActive ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-accent-600 hover:bg-accent-50')}
                >
                  {u.isActive ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Oldingi</Button>
          <span className="text-sm text-slate-500 px-2">{page} / {data.meta.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>Keyingi</Button>
        </div>
      )}
    </div>
  );
}
