import { cn } from '@/lib/utils';
import {
  PROBLEM_STATUS_BADGE,
  PROBLEM_STATUS_LABEL,
  PROBLEM_STATUS_META,
  SOLUTION_STATUS_BADGE,
  SOLUTION_STATUS_LABEL,
  STARTUP_STATUS_BADGE,
  STARTUP_STATUS_LABEL,
} from '@/lib/constants';
import type { ProblemStatus, SolutionStatus, StartupStatus } from '@/types';

export function ProblemStatusBadge({
  status,
  className,
}: {
  status: ProblemStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap',
        PROBLEM_STATUS_BADGE[status],
        className,
      )}
    >
      {PROBLEM_STATUS_LABEL[status]}
    </span>
  );
}

/**
 * Premium status pill — yumshoq fon + jonli nuqta. Kartochka va detal
 * sahifada ishlatiladi. `open` (jonli) holatda nuqta sekin pulslaydi.
 */
export function ProblemStatusPill({
  status,
  className,
}: {
  status: ProblemStatus;
  className?: string;
}) {
  const m = PROBLEM_STATUS_META[status];
  const live = status === 'open';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset whitespace-nowrap',
        m.chip,
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {live && <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', m.dot)} />}
        <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', m.dot)} />
      </span>
      {m.label}
    </span>
  );
}

export function SolutionStatusBadge({
  status,
  className,
}: {
  status: SolutionStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap',
        SOLUTION_STATUS_BADGE[status],
        className,
      )}
    >
      {SOLUTION_STATUS_LABEL[status]}
    </span>
  );
}

export function StartupStatusBadge({
  status,
  className,
}: {
  status: StartupStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap',
        STARTUP_STATUS_BADGE[status],
        className,
      )}
    >
      {STARTUP_STATUS_LABEL[status]}
    </span>
  );
}
