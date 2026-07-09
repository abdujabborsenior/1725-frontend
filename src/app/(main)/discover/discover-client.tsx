'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PublicGroup, PublicUserCard } from '@/types';
import { Search, Loader2, Users, UserPlus, MessageCircle, Clock, X } from 'lucide-react';
import { usersApi, chatApi } from '@/lib/api';
import { useDebounce } from '@/lib/use-debounce';
import { UserListItem } from '@/components/social/user-list-item';
import { GroupCard } from '@/components/social/group-card';
import { CardSkeleton, UserRowSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const RECENT_KEY = 'sh_recent_searches';
const MAX_RECENT = 8;

function loadRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

type Tab = 'all' | 'people' | 'groups';
const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Hammasi' },
  { key: 'people', label: 'Odamlar' },
  { key: 'groups', label: 'Guruhlar' },
];

export function DiscoverClient({
  initialSuggestions,
  initialGroups,
}: {
  initialSuggestions: PublicUserCard[] | null;
  initialGroups: PublicGroup[] | null;
}) {
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [recent, setRecent] = useState<string[]>([]);
  const debounced = useDebounce(q, 300);
  const searching = debounced.trim().length >= 1;

  useEffect(() => setRecent(loadRecent()), []);

  function persistRecent(next: string[]) {
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  function pushRecent(term: string) {
    const t = term.trim();
    if (t.length < 2) return;
    persistRecent([t, ...recent.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, MAX_RECENT));
  }
  function removeRecent(term: string) {
    persistRecent(recent.filter((r) => r !== term));
  }

  // Persist the term shortly after the user settles on it
  useEffect(() => {
    if (debounced.trim().length >= 2) {
      const id = setTimeout(() => pushRecent(debounced), 1200);
      return () => clearTimeout(id);
    }
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: people, isFetching: peopleLoading } = useQuerySafe(
    ['discover-search', debounced],
    () => usersApi.search(debounced, { limit: 30 }),
    searching && (tab === 'all' || tab === 'people'),
  );
  const { data: groupResults, isFetching: groupsLoading } = useQuerySafe(
    ['discover-group-search', debounced],
    () => chatApi.groupSearch(debounced),
    searching && (tab === 'all' || tab === 'groups'),
  );
  const { data: suggestions } = useQuery({
    queryKey: ['discover-suggestions'],
    queryFn: () => usersApi.suggestions(12),
    enabled: !searching,
    // SSR boshlang'ich ro'yxat — CLS yo'q; follow holati background'da aniqlanadi
    initialData: initialSuggestions ?? undefined,
    initialDataUpdatedAt: 0,
  });
  const { data: groups } = useQuery({
    queryKey: ['discover-groups'],
    queryFn: () => chatApi.publicGroups(20),
    enabled: !searching,
    initialData: initialGroups ?? undefined,
    initialDataUpdatedAt: 0,
  });

  const isFetching = peopleLoading || groupsLoading;
  const peopleArr = people?.data ?? [];
  const groupsArr = groupResults ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-900">Hamjamiyat</h1>
        <p className="mt-1 text-sm text-slate-500">Odamlarni toping, kuzating va guruhlarga qo&lsquo;shiling.</p>
      </div>

      {/* Search */}
      <div className="sticky top-2 z-10">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Username, ism yoki guruh bo‘yicha qidiring…"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm text-brand-900 shadow-soft placeholder:text-slate-400 focus:border-accent-400 focus:outline-none focus:ring-4 focus:ring-accent-500/10"
          />
          {isFetching ? (
            <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-300" />
          ) : q ? (
            <button onClick={() => setQ('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-900">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Tabs */}
        {searching && (
          <div className="animate-slide-down mt-3 flex gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-soft">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn('relative flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors', tab === t.key ? 'text-white' : 'text-slate-500 hover:text-brand-900')}
                >
                  {tab === t.key && (
                    <span className="absolute inset-0 rounded-xl bg-brand-900" />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              ))}
          </div>
        )}
      </div>

      {searching ? (
        <div className="animate-fade-in space-y-6">
          {/* People */}
          {(tab === 'all' || tab === 'people') && (
            <section>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">Odamlar</h2>
              <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-soft">
                {peopleArr.length > 0 ? (
                  peopleArr.map((u) => <UserListItem key={u.id} user={u} />)
                ) : !isFetching ? (
                  <p className="py-8 text-center text-sm text-slate-400">Hech kim topilmadi</p>
                ) : (
                  <UserRowSkeleton rows={4} />
                )}
              </div>
            </section>
          )}
          {/* Groups */}
          {(tab === 'all' || tab === 'groups') && (
            <section>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">Guruhlar</h2>
              {groupsArr.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupsArr.map((g) => <GroupCard key={g.id} group={g} />)}
                </div>
              ) : !isFetching ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-surface-soft py-8 text-center text-sm text-slate-400">Guruh topilmadi</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
              )}
            </section>
          )}
        </div>
      ) : (
        <div className="space-y-7">
          {/* Recent searches */}
          {recent.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <Clock className="h-4 w-4" /> So&lsquo;nggi qidiruvlar
                </h2>
                <button onClick={() => persistRecent([])} className="text-xs font-semibold text-slate-400 hover:text-rose-500">Tozalash</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <span key={r} className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1.5 pl-3 pr-1.5 text-sm text-brand-800 shadow-soft">
                    <button onClick={() => setQ(r)} className="hover:text-accent-700">{r}</button>
                    <button onClick={() => removeRecent(r)} className="flex h-5 w-5 items-center justify-center rounded-full text-slate-300 hover:bg-slate-100 hover:text-rose-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Suggestions */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
              <UserPlus className="h-4 w-4 text-iris-500" /> Kuzatish uchun
            </h2>
            <div className="grid grid-cols-1 gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-soft sm:grid-cols-2">
              {suggestions && suggestions.length > 0 ? (
                suggestions.map((u) => <UserListItem key={u.id} user={u} />)
              ) : suggestions === undefined ? (
                <><UserRowSkeleton rows={3} /><UserRowSkeleton rows={3} /></>
              ) : (
                <p className="col-span-full py-10 text-center text-sm text-slate-400">Hozircha tavsiyalar yo&lsquo;q</p>
              )}
            </div>
          </section>

          {/* Groups */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
              <MessageCircle className="h-4 w-4 text-accent-500" /> Hamjamiyat guruhlari
            </h2>
            {groups && groups.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((g) => <GroupCard key={g.id} group={g} />)}
              </div>
            ) : groups === undefined ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-surface-soft py-12 text-center">
                <Users className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                <p className="text-sm text-slate-500">Hozircha guruhlar yo‘q</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

/* Thin react-query wrapper so the file stays self-contained */
function useQuerySafe<T>(key: unknown[], fn: () => Promise<T>, enabled: boolean) {
  return useQuery({ queryKey: key, queryFn: fn, enabled });
}
