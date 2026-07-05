import { Rocket } from 'lucide-react';
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
        'inline-flex items-center gap-1 rounded-md border border-accent-200 bg-accent-50 font-semibold text-accent-700',
        size === 'xs' ? 'px-1.5 py-px text-[10px]' : 'px-2 py-0.5 text-[11px]',
        className,
      )}
    >
      <Rocket className={size === 'xs' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
      Asoschi
    </span>
  );
}
