'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const windowSize = Math.min(totalPages, 5);
  const start =
    totalPages <= 5 ? 1 : Math.min(Math.max(1, page - 2), totalPages - 4);
  const pages = Array.from({ length: windowSize }, (_, i) => start + i);

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Oldingi sahifa"
        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-brand-900 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={cn(
            'h-10 w-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all',
            p === page
              ? 'bg-brand-900 text-white shadow-glow-brand'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-brand-900 hover:border-slate-300',
          )}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Keyingi sahifa"
        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-brand-900 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
