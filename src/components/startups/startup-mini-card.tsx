import Link from 'next/link';
import { ArrowUpRight, Eye, Rocket } from 'lucide-react';
import { StarRating } from './rating';
import { cn } from '@/lib/utils';
import type { Startup } from '@/types';

type MiniStartup = Pick<
  Startup,
  | 'id' | 'title' | 'slug' | 'tagline' | 'logoUrl' | 'category'
  | 'ratingAvg' | 'ratingCount' | 'viewCount'
>;

/**
 * Yengil gorizontal startap kartochkasi — yechim ostida, ro'yxat ichida
 * ko'rsatish uchun (to'liq StartupCard'dan ixchamroq).
 */
export function StartupMiniCard({
  startup,
  className,
}: {
  startup: MiniStartup;
  className?: string;
}) {
  return (
    <Link
      href={`/startups/${startup.slug}`}
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-slate-200 bg-surface-soft p-3 transition-all hover:border-accent-300 hover:bg-white hover:shadow-card',
        className,
      )}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
        {startup.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={startup.logoUrl} alt={startup.title} className="h-full w-full object-cover" />
        ) : (
          <Rocket className="h-5 w-5 text-slate-400" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-bold text-brand-900 group-hover:text-accent-700 transition-colors">
            {startup.title}
          </span>
          {startup.category && (
            <span className="hidden shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200 sm:inline">
              {startup.category}
            </span>
          )}
        </span>
        {startup.tagline && (
          <span className="mt-0.5 block truncate text-xs text-slate-500">{startup.tagline}</span>
        )}
        <span className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
          {startup.ratingCount > 0 && (
            <span className="flex items-center gap-1">
              <StarRating value={startup.ratingAvg} size={11} />
              <span className="font-semibold text-slate-600">{startup.ratingAvg.toFixed(1)}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" /> {startup.viewCount}
          </span>
        </span>
      </span>

      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-accent-600" />
    </Link>
  );
}
