import { format } from 'date-fns';
import type { FaultSeverity, LineStatus } from '@energy-dashboard/shared';

export function formatTimestamp(timestamp: string, withDate = false) {
  const date = new Date(timestamp);
  return withDate ? format(date, 'dd MMM yyyy, HH:mm') : format(date, 'HH:mm');
}

export function statusLabel(status: LineStatus) {
  if (status === 'critical') {
    return 'Critical';
  }

  if (status === 'warning') {
    return 'Warning';
  }

  return 'Nominal';
}

export function severityLabel(severity: FaultSeverity) {
  if (severity === 'high') {
    return 'High';
  }

  if (severity === 'medium') {
    return 'Medium';
  }

  return 'Low';
}

export function categoryLabel(category: string) {
  return category.slice(0, 1).toUpperCase() + category.slice(1);
}
