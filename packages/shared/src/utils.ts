import type { LineStatus, MetricKey, SensorPoint, ThresholdConfig } from './types';

const STATUS_PRIORITY: Record<LineStatus, number> = {
  critical: 0,
  warning: 1,
  nominal: 2,
};

export function sortLinesByStatus<T extends { status: LineStatus; lineId: string }>(
  lines: T[],
): T[] {
  return [...lines].sort((a, b) => {
    const priorityDelta = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return a.lineId.localeCompare(b.lineId);
  });
}

export function isMetricOutOfBounds(
  metricKey: MetricKey,
  value: number,
  thresholds: ThresholdConfig,
): { anomaly: boolean; severity: 'warning' | 'critical' | null } {
  const target = thresholds[metricKey];

  if (value < target.min || value > target.max) {
    return { anomaly: true, severity: 'critical' };
  }

  if (value < target.min + target.warningBuffer || value > target.max - target.warningBuffer) {
    return { anomaly: true, severity: 'warning' };
  }

  return { anomaly: false, severity: null };
}

export function detectPointAnomalies(
  point: Omit<SensorPoint, 'anomalies'>,
  thresholds: ThresholdConfig,
) {
  const metrics: MetricKey[] = ['throughput', 'temperature', 'pressure', 'energy'];

  return metrics.flatMap((metric) => {
    const evaluation = isMetricOutOfBounds(metric, point[metric], thresholds);

    if (!evaluation.anomaly || !evaluation.severity) {
      return [];
    }

    const threshold = thresholds[metric];
    const direction = point[metric] < threshold.min ? 'below' : 'above';

    return [
      {
        metric,
        reason: `${metric} is ${direction} expected range (${threshold.min}-${threshold.max})`,
        severity: evaluation.severity,
      },
    ];
  });
}
