'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Rocket, FileQuestion, Loader2, CornerDownLeft, ArrowRight,
} from 'lucide-react';
import { startupsApi, problemsApi } from '@/lib/api';
import { useDebounce } from '@/lib/use-debounce';

const QUICK_LINKS = [
  { href: '/startups', label: 'Startaplar', icon: Rocket },
  { href: '/problems', label: 'Muammolar', icon: FileQuestion },
];

const OPEN_EVENT = 'open-search-palette';

/** Boshqa joylardan qidiruvni ochish */
export function openSearchPalette() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(OPEN_EVENT));
}

export function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounce(q, 300);

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

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  const startupResults = startups?.data ?? [];
  const problemResults = problems?.data ?? [];
  const fetching = sFetching || pFetching;
  const hasResults = startupResults.length > 0 || problemResults.length > 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4">
          <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-modal overflow-hidden animate-slide-up">
            {/* Input */}
            <div className="flex items-center gap-3 px-4 border-b border-slate-100">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Startap yoki muammo qidiring..."
                className="flex-1 h-14 bg-transparent text-sm text-brand-900 placeholder:text-slate-400 focus:outline-none"
              />
              {fetching && <Loader2 className="h-4 w-4 text-slate-300 animate-spin" />}
              <kbd className="text-[10px] font-semibold bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 border border-slate-200">ESC</kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {debounced.trim().length < 2 ? (
                <div className="p-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">Tezkor o&apos;tish</p>
                  {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
                    <button key={href} onClick={() => go(href)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left">
                      <Icon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-brand-900">{label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 ml-auto" />
                    </button>
                  ))}
                </div>
              ) : !hasResults && !fetching ? (
                <p className="py-10 text-center text-sm text-slate-400">Natija topilmadi</p>
              ) : (
                <>
                  {startupResults.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">Startaplar</p>
                      {startupResults.map((s) => (
                        <button key={s.id} onClick={() => go(`/startups/${s.slug}`)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left">
                          <div className="h-8 w-8 rounded-lg bg-surface-soft border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                            {s.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={s.logoUrl} alt="" className="h-full w-full object-cover" />
                            ) : <Rocket className="h-4 w-4 text-slate-300" />}
                          </div>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-medium text-brand-900 truncate">{s.title}</span>
                            {s.tagline && <span className="block text-xs text-slate-400 truncate">{s.tagline}</span>}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {problemResults.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">Muammolar</p>
                      {problemResults.map((p) => (
                        <button key={p.id} onClick={() => go(`/problems/${p.id}`)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left">
                          <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                            <FileQuestion className="h-4 w-4 text-amber-500" />
                          </div>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-medium text-brand-900 truncate">{p.title}</span>
                            <span className="block text-xs text-slate-400 truncate">{p.description}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 border-t border-slate-100 text-[11px] text-slate-400">
              <CornerDownLeft className="h-3 w-3" /> tanlash uchun bosing
            </div>
          </div>
        </div>
  );
}
