import { cn } from '@/lib/utils';
import {
  PROBLEM_STATUS_BADGE,
  PROBLEM_STATUS_LABEL,
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
