import clsx from 'clsx';
import type { LineStatus } from '@energy-dashboard/shared';
import { statusLabel } from '../lib/format';

type StatusChipProps = {
  status: LineStatus;
};

export function StatusChip({ status }: StatusChipProps) {
  return (
    <span className={clsx('status-chip', `status-chip--${status}`)}>{statusLabel(status)}</span>
  );
}
