'use client';

import { ChevronLeft, ChevronRight } from '@/components/icons';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** iOS uslubidagi sahifalash — segment tanovi kabi yumshoq fill ustida. */
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const windowSize = Math.min(totalPages, 5);
  const start = totalPages <= 5 ? 1 : Math.min(Math.max(1, page - 2), totalPages - 4);
  const pages = Array.from({ length: windowSize }, (_, i) => start + i);

  const arrow =
    'flex h-9 w-9 items-center justify-center rounded-ios text-slate-600 transition-colors duration-150 ease-ios enabled:hover:bg-white/70 active:bg-fill disabled:opacity-30';

  return (
    <div className="flex justify-center pt-2">
      <div className="inline-flex items-center gap-1 rounded-ios-md bg-fill-tertiary p-1">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Oldingi sahifa"
          className={arrow}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'flex h-9 min-w-9 items-center justify-center rounded-ios px-2.5 text-subhead tabular-nums transition-all duration-150 ease-ios active:scale-95',
              p === page
                ? 'bg-white font-semibold text-brand-900 shadow-segment hover:shadow-card-hover'
                : 'font-medium text-slate-600 hover:bg-white/70',
            )}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="Keyingi sahifa"
          className={arrow}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
