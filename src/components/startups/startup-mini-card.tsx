import Link from 'next/link';
import { ArrowUpRight, Eye, Rocket } from '@/components/icons';
import { RatingValue } from './rating';
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
        'group flex items-center gap-3 rounded-ios-md border border-slate-200 bg-surface-soft p-3 transition-all hover:bg-white hover:shadow-card',
        className,
      )}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-ios-lg bg-white">
        {startup.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={startup.logoUrl} alt={startup.title} className="h-full w-full object-cover" />
        ) : (
          <Rocket className="h-5 w-5 text-slate-400" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-subhead font-bold text-brand-900 group-hover:text-accent-700 transition-colors">
            {startup.title}
          </span>
          {startup.category && (
            <span className="hidden shrink-0 rounded-md bg-white px-1.5 py-0.5 text-caption-2 font-medium text-slate-500 ring-1 ring-inset ring-slate-200 sm:inline">
              {startup.category}
            </span>
          )}
        </span>
        {startup.tagline && (
          <span className="mt-0.5 block truncate text-footnote text-slate-500">{startup.tagline}</span>
        )}
        <span className="mt-1 flex items-center gap-3 text-caption-1 text-slate-500">
          {startup.ratingCount > 0 && (
            <RatingValue value={startup.ratingAvg} size="xs" />
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
