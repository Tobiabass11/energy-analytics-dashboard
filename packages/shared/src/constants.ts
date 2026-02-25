import type { ThresholdConfig } from './types';

export const SHIFT_DEFINITIONS = [
  {
    name: 'Shift A' as const,
    startHour: 6,
    endHour: 13,
  },
  {
    name: 'Shift B' as const,
    startHour: 14,
    endHour: 21,
  },
  {
    name: 'Shift C' as const,
    startHour: 22,
    endHour: 5,
  },
];

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  throughput: { min: 72, max: 120, warningBuffer: 6 },
  temperature: { min: 20, max: 46, warningBuffer: 4 },
  pressure: { min: 4.5, max: 8.7, warningBuffer: 0.7 },
  energy: { min: 220, max: 390, warningBuffer: 24 },
};

export const TIMEZONE = 'Africa/Lagos';

export const LINES_COUNT = 20;
