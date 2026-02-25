import { describe, expect, it } from 'vitest';
import { detectPointAnomalies, sortLinesByStatus } from '../src/utils';
import { DEFAULT_THRESHOLDS } from '../src/constants';

describe('sortLinesByStatus', () => {
  it('prioritizes critical and warning lines', () => {
    const sorted = sortLinesByStatus([
      { lineId: 'LINE-03', status: 'nominal' as const },
      { lineId: 'LINE-02', status: 'warning' as const },
      { lineId: 'LINE-01', status: 'critical' as const },
    ]);

    expect(sorted[0].lineId).toBe('LINE-01');
    expect(sorted[1].lineId).toBe('LINE-02');
    expect(sorted[2].lineId).toBe('LINE-03');
  });
});

describe('detectPointAnomalies', () => {
  it('flags metrics outside threshold bounds', () => {
    const anomalies = detectPointAnomalies(
      {
        timestamp: new Date().toISOString(),
        throughput: DEFAULT_THRESHOLDS.throughput.min - 1,
        temperature: 30,
        pressure: 6.5,
        energy: 280,
      },
      DEFAULT_THRESHOLDS,
    );

    expect(anomalies.some((item) => item.metric === 'throughput')).toBe(true);
  });
});
