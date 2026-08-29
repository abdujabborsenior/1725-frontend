'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PublicGroup, PublicUserCard } from '@/types';
import { Users, X } from '@/components/icons';
import { usersApi, chatApi } from '@/lib/api';
import { useDebounce } from '@/lib/use-debounce';
import { UserListItem } from '@/components/social/user-list-item';
import { GroupCard } from '@/components/social/group-card';
import { CardSkeleton, UserRowSkeleton } from '@/components/ui/skeleton';
import { SearchField } from '@/components/ui/search-field';
import { Segmented } from '@/components/ui/segmented';
import { EmptyState, PageHeader } from '@/components/ui/page-header';

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
      <PageHeader
        title="Hamjamiyat"
        subtitle="Odamlarni toping, kuzating va guruhlarga qo‘shiling"
      />

      {/* Qidiruv */}
      <div className="sticky top-[3.75rem] z-10 -mx-4 space-y-3 bg-surface-soft/80 px-4 py-2 backdrop-blur-xl">
        <SearchField
          value={q}
          onValueChange={setQ}
          placeholder="Username, ism yoki guruh"
        />
        {searching && (
          <Segmented
            aria-label="Natija turi"
            value={tab}
            onChange={(v) => setTab(v)}
            options={TABS.map((t) => ({ value: t.key, label: t.label }))}
          />
        )}
      </div>

      {searching ? (
        <div className="animate-fade-in space-y-6">
          {/* People */}
          {(tab === 'all' || tab === 'people') && (
            <section>
              <h2 className="ios-section-header">Odamlar</h2>
              <div className="ios-list" style={{ ['--row-inset' as string]: '3.75rem' }}>
                {peopleArr.length > 0 ? (
                  peopleArr.map((u) => <UserListItem key={u.id} user={u} />)
                ) : !isFetching ? (
                  <p className="py-8 text-center text-subhead text-slate-400">Hech kim topilmadi</p>
                ) : (
                  <UserRowSkeleton rows={4} />
                )}
              </div>
            </section>
          )}
          {/* Groups */}
          {(tab === 'all' || tab === 'groups') && (
            <section>
              <h2 className="ios-section-header">Guruhlar</h2>
              {groupsArr.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupsArr.map((g) => <GroupCard key={g.id} group={g} />)}
                </div>
              ) : !isFetching ? (
                <p className="rounded-ios-xl bg-white py-10 text-center text-subhead text-slate-400">
                  Guruh topilmadi
                </p>
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
                <h2 className="ios-section-header pb-0">So&lsquo;nggi qidiruvlar</h2>
                <button
                  onClick={() => persistRecent([])}
                  className="tappable text-footnote font-medium text-accent-700"
                >
                  Tozalash
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 rounded-full bg-fill-tertiary py-1.5 pl-3.5 pr-2 text-subhead text-brand-900"
                  >
                    <button onClick={() => setQ(r)}>{r}</button>
                    <button
                      onClick={() => removeRecent(r)}
                      aria-label={`${r} — tarixdan o'chirish`}
                      className="tappable flex h-5 w-5 items-center justify-center rounded-full text-slate-400"
                    >
                      <X className="h-3 w-3" strokeWidth={3} />
                    </button>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Suggestions */}
          <section>
            <h2 className="ios-section-header">Kuzatish uchun</h2>
            <div className="ios-list" style={{ ['--row-inset' as string]: '3.75rem' }}>
              {suggestions && suggestions.length > 0 ? (
                suggestions.map((u) => <UserListItem key={u.id} user={u} />)
              ) : suggestions === undefined ? (
                <><UserRowSkeleton rows={3} /><UserRowSkeleton rows={3} /></>
              ) : (
                <p className="py-10 text-center text-subhead text-slate-400">
                  Hozircha tavsiyalar yo&lsquo;q
                </p>
              )}
            </div>
          </section>

          {/* Groups */}
          <section>
            <h2 className="ios-section-header">Hamjamiyat guruhlari</h2>
            {groups && groups.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((g) => <GroupCard key={g.id} group={g} />)}
              </div>
            ) : groups === undefined ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : (
              <EmptyState icon={<Users />} title="Hozircha guruhlar yo‘q" />
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
