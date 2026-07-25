import { RocketFill } from '@/components/icons';
import { cn } from '@/lib/utils';

/**
 * "Asoschi" (Founder) tamg'asi — kamida bitta startap joylagan foydalanuvchining
 * DOIMIY belgisi. Yorliq til qoidasiga mos: uz interfeysda "Asoschi"
 * (en: Founder, ru: Основатель — kelajakdagi locale'larda).
 */
export function FounderBadge({
  size = 'sm',
  className,
}: {
  size?: 'xs' | 'sm';
  className?: string;
}) {
  return (
    <span
      title="Asoschi — startap joylagan foydalanuvchi"
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-accent-50 font-medium text-accent-700',
        size === 'xs' ? 'px-2 py-0.5 text-caption-2' : 'px-2.5 py-0.5 text-caption-1',
        className,
      )}
    >
      <RocketFill className={size === 'xs' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
      Asoschi
    </span>
  );
}
