import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
  DEFAULT_THRESHOLDS,
  LINES_COUNT,
  TIMEZONE,
  detectPointAnomalies,
  type FaultEvent,
  type LineOverview,
  type LineStatus,
  type LineThresholdConfig,
  type SensorPoint,
  type ShiftSummary,
  type ThresholdConfig,
  type TimeWindow,
} from '@energy-dashboard/shared';
import { formatShiftName, nowInLagos, resolveWindowStart, toLagosDate } from '../utils/time.js';

dayjs.extend(utc);
dayjs.extend(timezone);

type Dataset = {
  readingsByLine: Record<string, SensorPoint[]>;
  faults: FaultEvent[];
  thresholdsByLine: Record<string, ThresholdConfig>;
};

function createSeededRandom(seed = 42) {
  let state = seed;
  return () => {
    state = (1664525 * state + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function lineIdFromIndex(index: number) {
  return `LINE-${String(index + 1).padStart(2, '0')}`;
}

function getStatusFromPoint(point: SensorPoint): LineStatus {
  if (point.anomalies.some((item) => item.severity === 'critical')) {
    return 'critical';
  }

  if (point.anomalies.some((item) => item.severity === 'warning')) {
    return 'warning';
  }

  return 'nominal';
}

function generateThresholdsByLine() {
  const random = createSeededRandom(99);

  return Array.from({ length: LINES_COUNT }).reduce<Record<string, ThresholdConfig>>(
    (acc, _, index) => {
      const lineId = lineIdFromIndex(index);
      const variation = (random() - 0.5) * 6;

      acc[lineId] = {
        throughput: {
          ...DEFAULT_THRESHOLDS.throughput,
          min: Number((DEFAULT_THRESHOLDS.throughput.min + variation).toFixed(2)),
          max: Number((DEFAULT_THRESHOLDS.throughput.max + variation).toFixed(2)),
        },
        temperature: {
          ...DEFAULT_THRESHOLDS.temperature,
        },
        pressure: {
          ...DEFAULT_THRESHOLDS.pressure,
        },
        energy: {
          ...DEFAULT_THRESHOLDS.energy,
          max: Number((DEFAULT_THRESHOLDS.energy.max + variation * 2).toFixed(2)),
        },
      };

      return acc;
    },
    {},
  );
}

function generateReadings(thresholdsByLine: Record<string, ThresholdConfig>) {
  const random = createSeededRandom(7);
  const now = nowInLagos();
  const start = now.subtract(30, 'day').startOf('hour');
  const readingsByLine: Record<string, SensorPoint[]> = {};

  for (let lineIndex = 0; lineIndex < LINES_COUNT; lineIndex += 1) {
    const lineId = lineIdFromIndex(lineIndex);
    const thresholds = thresholdsByLine[lineId];
    const points: SensorPoint[] = [];

    for (let ts = start; ts.isBefore(now); ts = ts.add(15, 'minute')) {
      const hour = ts.hour();
      const shiftMultiplier = hour >= 6 && hour < 14 ? 1.06 : hour >= 14 && hour < 22 ? 1 : 0.93;
      const lineFactor = 1 + (lineIndex % 5) * 0.015;

      const throughput =
        92 * shiftMultiplier * lineFactor +
        (random() - 0.5) * 8 +
        (ts.day() === 0 || ts.day() === 6 ? -5 : 0);
      const temperature = 32 + (random() - 0.5) * 7 + (hour >= 12 && hour <= 16 ? 3 : 0);
      const pressure = 6.6 + (random() - 0.5) * 1.2;
      const energy =
        300 * shiftMultiplier * lineFactor +
        (random() - 0.5) * 36 +
        (throughput < thresholds.throughput.min ? 18 : 0);

      const injectFaultSpike = random() < 0.009;
      const rawPoint = {
        timestamp: ts.tz(TIMEZONE).toISOString(),
        throughput: Number(
          (injectFaultSpike ? throughput - (8 + random() * 20) : throughput).toFixed(2),
        ),
        temperature: Number(
          (injectFaultSpike ? temperature + (5 + random() * 10) : temperature).toFixed(2),
        ),
        pressure: Number(
          (injectFaultSpike ? pressure - (0.6 + random() * 1.2) : pressure).toFixed(2),
        ),
        energy: Number((injectFaultSpike ? energy + (20 + random() * 40) : energy).toFixed(2)),
      };

      points.push({
        ...rawPoint,
        anomalies: detectPointAnomalies(rawPoint, thresholds),
      });
    }

    readingsByLine[lineId] = points;
  }

  return readingsByLine;
}

function generateFaultEvents(readingsByLine: Record<string, SensorPoint[]>) {
  const random = createSeededRandom(23);
  const faults: FaultEvent[] = [];

  Object.entries(readingsByLine).forEach(([lineId, points]) => {
    points.forEach((point, idx) => {
      const hasCritical = point.anomalies.some((item) => item.severity === 'critical');

      if (!hasCritical || random() >= 0.06) {
        return;
      }

      const duration = Math.max(5, Math.round(8 + random() * 70));
      const categoryPool = ['mechanical', 'electrical', 'quality', 'utility'] as const;
      const severityPool = ['low', 'medium', 'high'] as const;
      const category = categoryPool[Math.floor(random() * categoryPool.length)];
      const severity = severityPool[Math.floor(random() * severityPool.length)];

      faults.push({
        id: `${lineId}-FLT-${idx}`,
        lineId,
        startedAt: point.timestamp,
        endedAt: dayjs(point.timestamp).add(duration, 'minute').toISOString(),
        faultType:
          category === 'mechanical'
            ? 'Conveyor drag'
            : category === 'electrical'
              ? 'Drive overload'
              : category === 'quality'
                ? 'Seal variance'
                : 'Compressed air drop',
        category,
        severity,
        resolutionStatus: random() > 0.12 ? 'resolved' : 'open',
        durationMinutes: duration,
      });
    });
  });

  return faults.sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
}

function buildDataset(): Dataset {
  const thresholdsByLine = generateThresholdsByLine();
  const readingsByLine = generateReadings(thresholdsByLine);
  const faults = generateFaultEvents(readingsByLine);

  return {
    readingsByLine,
    faults,
    thresholdsByLine,
  };
}

const dataset: Dataset = buildDataset();

export function getLineOverview(): LineOverview[] {
  return Object.entries(dataset.readingsByLine).map(([lineId, points]) => {
    const latestPoint = points.at(-1);

    if (!latestPoint) {
      return {
        lineId,
        throughputRate: 0,
        oee: 0,
        status: 'nominal',
        downtimeMinutes: 0,
        faultCount: 0,
        lastUpdated: nowInLagos().toISOString(),
      };
    }

    const recentWindow = points.slice(-16);
    const throughputAvg =
      recentWindow.reduce((sum, point) => sum + point.throughput, 0) / recentWindow.length;
    const oee = Math.min(99.9, Math.max(58, throughputAvg / 1.15));
    const status = getStatusFromPoint(latestPoint);

    const oneShiftAgo = resolveWindowStart('shift').toISOString();
    const shiftFaults = dataset.faults.filter(
      (fault) => fault.lineId === lineId && fault.startedAt >= oneShiftAgo,
    );

    return {
      lineId,
      throughputRate: Number(latestPoint.throughput.toFixed(2)),
      oee: Number(oee.toFixed(1)),
      status,
      downtimeMinutes: shiftFaults.reduce((sum, fault) => sum + fault.durationMinutes, 0),
      faultCount: shiftFaults.length,
      lastUpdated: latestPoint.timestamp,
    };
  });
}

export function getLineSeries(lineId: string, window: TimeWindow): SensorPoint[] {
  const points = dataset.readingsByLine[lineId] ?? [];
  const start = resolveWindowStart(window).toISOString();

  return points.filter((point) => point.timestamp >= start);
}

export type FaultFilterInput = {
  lineId: string;
  start?: string;
  end?: string;
  category?: FaultEvent['category'];
};

export function getFaultEvents(filters: FaultFilterInput): FaultEvent[] {
  return dataset.faults.filter((fault) => {
    if (fault.lineId !== filters.lineId) {
      return false;
    }

    if (filters.start && fault.startedAt < filters.start) {
      return false;
    }

    if (filters.end && fault.startedAt > filters.end) {
      return false;
    }

    if (filters.category && fault.category !== filters.category) {
      return false;
    }

    return true;
  });
}

export function getLineThresholds(lineId: string): LineThresholdConfig {
  const fallback = DEFAULT_THRESHOLDS;

  return {
    lineId,
    thresholds: dataset.thresholdsByLine[lineId] ?? fallback,
  };
}

export function updateLineThresholds(
  lineId: string,
  thresholds: ThresholdConfig,
): LineThresholdConfig {
  dataset.thresholdsByLine[lineId] = thresholds;

  dataset.readingsByLine[lineId] = dataset.readingsByLine[lineId].map((point) => {
    const recalculatedAnomalies = detectPointAnomalies(point, thresholds);

    return {
      ...point,
      anomalies: recalculatedAnomalies,
    };
  });

  return {
    lineId,
    thresholds,
  };
}

export function getShiftSummary(lineId: string, date?: string): ShiftSummary {
  const points = dataset.readingsByLine[lineId] ?? [];
  const reference = date ? dayjs.tz(date, TIMEZONE) : nowInLagos();
  const shift = formatShiftName(reference.toISOString());

  const shiftStart =
    shift === 'Shift A'
      ? reference.startOf('day').hour(6).minute(0)
      : shift === 'Shift B'
        ? reference.startOf('day').hour(14).minute(0)
        : reference.hour() >= 22
          ? reference.startOf('day').hour(22).minute(0)
          : reference.subtract(1, 'day').startOf('day').hour(22).minute(0);

  const shiftEnd = shiftStart.add(8, 'hour');

  const shiftPoints = points.filter(
    (point) =>
      point.timestamp >= shiftStart.toISOString() && point.timestamp < shiftEnd.toISOString(),
  );

  const shiftFaults = dataset.faults.filter(
    (fault) =>
      fault.lineId === lineId &&
      fault.startedAt >= shiftStart.toISOString() &&
      fault.startedAt < shiftEnd.toISOString(),
  );

  const avgThroughput =
    shiftPoints.length > 0
      ? shiftPoints.reduce((sum, point) => sum + point.throughput, 0) / shiftPoints.length
      : 0;
  const avgOee = Math.min(99.9, Math.max(58, avgThroughput / 1.15));

  return {
    lineId,
    shiftName: shift,
    shiftDate: toLagosDate(shiftStart.toISOString()),
    timezone: TIMEZONE,
    avgThroughput: Number(avgThroughput.toFixed(2)),
    avgOee: Number(avgOee.toFixed(1)),
    downtimeMinutes: shiftFaults.reduce((sum, fault) => sum + fault.durationMinutes, 0),
    faultCount: shiftFaults.length,
  };
}

export function exportDataset() {
  return dataset;
}
