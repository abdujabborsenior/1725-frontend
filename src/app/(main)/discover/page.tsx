'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, Users, Sparkles, MessageCircle } from 'lucide-react';
import { usersApi, chatApi } from '@/lib/api';
import { useDebounce } from '@/lib/use-debounce';
import { UserListItem } from '@/components/social/user-list-item';
import { GroupCard } from '@/components/social/group-card';

export default function DiscoverPage() {
  const [q, setQ] = useState('');
  const debounced = useDebounce(q, 300);
  const searching = debounced.trim().length >= 1;

  const { data: results, isFetching } = useQuery({
    queryKey: ['discover-search', debounced],
    queryFn: () => usersApi.search(debounced, { limit: 30 }),
    enabled: searching,
  });
  const { data: suggestions } = useQuery({
    queryKey: ['discover-suggestions'],
    queryFn: () => usersApi.suggestions(12),
    enabled: !searching,
  });
  const { data: groups } = useQuery({
    queryKey: ['discover-groups'],
    queryFn: () => chatApi.publicGroups(20),
  });

  return (
    <div className="mx-auto max-w-4xl animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-brand-900">Hamjamiyat</h1>
        <p className="mt-1 text-sm text-slate-500">Odamlarni toping, kuzating va guruhlarga qo‘shiling.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Username yoki ism bo‘yicha qidiring…"
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm text-brand-900 shadow-soft placeholder:text-slate-400 focus:border-accent-400 focus:outline-none focus:ring-4 focus:ring-accent-500/10"
        />
        {isFetching && <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-300" />}
      </div>

      {searching ? (
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Natijalar</h2>
          <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-soft">
            {results && results.data.length > 0 ? (
              results.data.map((u) => <UserListItem key={u.id} user={u} />)
            ) : !isFetching ? (
              <p className="py-12 text-center text-sm text-slate-400">Hech kim topilmadi</p>
            ) : (
              <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Suggestions */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="h-4 w-4 text-iris-500" /> Kuzatish uchun
            </h2>
            <div className="grid grid-cols-1 gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-soft sm:grid-cols-2">
              {suggestions && suggestions.length > 0
                ? suggestions.map((u) => <UserListItem key={u.id} user={u} />)
                : <p className="col-span-full py-10 text-center text-sm text-slate-400">Yuklanmoqda…</p>}
            </div>
          </section>

          {/* Groups */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
              <MessageCircle className="h-4 w-4 text-accent-500" /> Hamjamiyat guruhlari
            </h2>
            {groups && groups.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((g) => <GroupCard key={g.id} group={g} />)}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-surface-soft py-12 text-center">
                <Users className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                <p className="text-sm text-slate-500">Hozircha guruhlar yo‘q</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
