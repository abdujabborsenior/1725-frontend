import { cn } from '@/lib/utils';
import {
  PROBLEM_STATUS_BADGE,
  PROBLEM_STATUS_LABEL,
  SOLUTION_STATUS_BADGE,
  SOLUTION_STATUS_LABEL,
} from '@/lib/constants';
import type { ProblemStatus, SolutionStatus } from '@/types';

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
