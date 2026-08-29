'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Rocket, FileText, Spinner, ChevronRight, CloseCircleFill,
} from '@/components/icons';
import { startupsApi, problemsApi, usersApi } from '@/lib/api';
import { Avatar } from '@/components/ui/avatar';
import { useDebounce } from '@/lib/use-debounce';

const QUICK_LINKS = [
  { href: '/startups', label: 'Startaplar', icon: Rocket },
  { href: '/problems', label: 'Muammolar', icon: FileText },
];

const OPEN_EVENT = 'open-search-palette';

/** Boshqa joylardan qidiruvni ochish */
export function openSearchPalette() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(OPEN_EVENT));
}

export function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounce(q, 300);

  // Portal faqat brauzerda — SSR paytida document mavjud emas.
  useEffect(() => setMounted(true), []);

  // ⌘K / Ctrl+K + custom open event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    const onOpen = () => setOpen(true);
    document.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      setQ('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const enabled = open && debounced.trim().length >= 2;

  const { data: startups, isFetching: sFetching } = useQuery({
    queryKey: ['search-startups', debounced],
    queryFn: () => startupsApi.list({ search: debounced, limit: 5 }),
    enabled,
  });
  const { data: problems, isFetching: pFetching } = useQuery({
    queryKey: ['search-problems', debounced],
    queryFn: () => problemsApi.list({ search: debounced, limit: 5 }),
    enabled,
  });
  const { data: users, isFetching: uFetching } = useQuery({
    queryKey: ['search-users', debounced],
    queryFn: () => usersApi.search(debounced, { limit: 5 }),
    enabled,
  });

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  const userResults = users?.data ?? [];
  const startupResults = startups?.data ?? [];
  const problemResults = problems?.data ?? [];
  const fetching = sFetching || pFetching || uFetching;
  const hasResults =
    userResults.length > 0 || startupResults.length > 0 || problemResults.length > 0;

  if (!open || !mounted) return null;

  /* ⚠️ Portal MAJBURIY: bu komponent navbar (`<header class="material-bar">`)
     ichida turadi, `backdrop-filter`li element esa `position: fixed`
     avlodlar uchun CONTAINING BLOCK yaratadi — portal'siz `fixed inset-0`
     viewportga emas, header'ning tor yo'lagiga bog'lanardi (o'lchandi: 1440×90 —
     faqat tepadagi tasmani qoplardi) va panelning `backdrop-filter` ildizi
     ham header bo'lib qolardi (blur amalda ishlamasdi → sahifa matni
     panel ostidan o'qilib turardi). */
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[10vh]">
      <div className="absolute inset-0 animate-fade-in bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* iOS Spotlight — NOSHAFFOF panel (o'qilishi blur'ga bog'liq emas) */}
      <div className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-ios-2xl bg-white shadow-modal ring-1 ring-black/[0.06]">
        {/* Qidiruv maydoni */}
        <div className="hairline-b flex items-center gap-3 px-4">
          <Search className="h-[19px] w-[19px] shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Odam, startap yoki muammo qidiring"
            className="h-[52px] flex-1 bg-transparent text-body text-brand-900 placeholder:text-slate-400 focus:outline-none"
          />
          {fetching && <Spinner className="h-4 w-4 animate-spin text-slate-400" />}
          {/* Yopish — barcha ekranlarda × (klaviatura yorlig'i ham ishlaydi) */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Yopish"
            className="tappable flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400"
          >
            <CloseCircleFill className="h-[19px] w-[19px]" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {debounced.trim().length < 2 ? (
            <div>
              <p className="ios-section-header pt-1">Tezkor o&apos;tish</p>
              {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
                <button
                  key={href}
                  onClick={() => go(href)}
                  className="flex w-full items-center gap-3 rounded-ios px-3 py-2.5 text-left transition-colors duration-150 hover:bg-fill-quaternary active:bg-fill-tertiary"
                >
                  <Icon className="h-[19px] w-[19px] text-accent-600" />
                  <span className="flex-1 text-body text-brand-900">{label}</span>
                  <ChevronRight className="h-[15px] w-[15px] text-slate-300" strokeWidth={3} />
                </button>
              ))}
            </div>
          ) : !hasResults && !fetching ? (
            <p className="py-12 text-center text-subhead text-slate-400">Natija topilmadi</p>
          ) : (
            <>
              {userResults.length > 0 && (
                <div className="mb-1">
                  <p className="ios-section-header pt-1">Odamlar</p>
                  {userResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => go(u.username ? `/u/${u.username}` : `/u/${u.id}`)}
                      className="flex w-full items-center gap-3 rounded-ios px-3 py-2 text-left transition-colors duration-150 hover:bg-fill-quaternary active:bg-fill-tertiary"
                    >
                      <Avatar src={u.avatarUrl} name={u.fullName} size={34} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body text-brand-900">{u.fullName}</span>
                        <span className="block truncate text-footnote text-slate-500">
                          {u.username ? `@${u.username}` : ''}
                          {u.username && u.headline ? ' · ' : ''}
                          {u.headline ?? ''}
                        </span>
                      </span>
                      <ChevronRight className="h-[15px] w-[15px] shrink-0 text-slate-300" strokeWidth={3} />
                    </button>
                  ))}
                </div>
              )}
              {startupResults.length > 0 && (
                <div className="mb-1">
                  <p className="ios-section-header pt-1">Startaplar</p>
                  {startupResults.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => go(`/startups/${s.slug}`)}
                      className="flex w-full items-center gap-3 rounded-ios px-3 py-2 text-left transition-colors duration-150 hover:bg-fill-quaternary active:bg-fill-tertiary"
                    >
                      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-slate-100">
                        {s.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.logoUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Rocket className="h-4 w-4 text-slate-400" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body text-brand-900">{s.title}</span>
                        {s.tagline && (
                          <span className="block truncate text-footnote text-slate-500">{s.tagline}</span>
                        )}
                      </span>
                      <ChevronRight className="h-[15px] w-[15px] shrink-0 text-slate-300" strokeWidth={3} />
                    </button>
                  ))}
                </div>
              )}
              {problemResults.length > 0 && (
                <div>
                  <p className="ios-section-header pt-1">Muammolar</p>
                  {problemResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => go(`/problems/${p.id}`)}
                      className="flex w-full items-center gap-3 rounded-ios px-3 py-2 text-left transition-colors duration-150 hover:bg-fill-quaternary active:bg-fill-tertiary"
                    >
                      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-amber-500 text-white">
                        <FileText className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body text-brand-900">{p.title}</span>
                        <span className="block truncate text-footnote text-slate-500">{p.description}</span>
                      </span>
                      <ChevronRight className="h-[15px] w-[15px] shrink-0 text-slate-300" strokeWidth={3} />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
