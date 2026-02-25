export type LineStatus = 'nominal' | 'warning' | 'critical';

export type FaultSeverity = 'low' | 'medium' | 'high';

export type TimeWindow = 'hour' | 'shift' | 'day' | 'week';

export interface LineOverview {
  lineId: string;
  throughputRate: number;
  oee: number;
  status: LineStatus;
  downtimeMinutes: number;
  faultCount: number;
  lastUpdated: string;
}

export interface SensorPoint {
  timestamp: string;
  throughput: number;
  temperature: number;
  pressure: number;
  energy: number;
  anomalies: MetricAnomaly[];
}

export interface MetricAnomaly {
  metric: MetricKey;
  reason: string;
  severity: 'warning' | 'critical';
}

export interface FaultEvent {
  id: string;
  lineId: string;
  startedAt: string;
  endedAt: string | null;
  faultType: string;
  category: 'mechanical' | 'electrical' | 'quality' | 'utility';
  severity: FaultSeverity;
  resolutionStatus: 'open' | 'resolved';
  durationMinutes: number;
}

export type MetricKey = 'throughput' | 'temperature' | 'pressure' | 'energy';

export interface MetricThreshold {
  min: number;
  max: number;
  warningBuffer: number;
}

export type ThresholdConfig = Record<MetricKey, MetricThreshold>;

export interface LineThresholdConfig {
  lineId: string;
  thresholds: ThresholdConfig;
}

export interface ShiftSummary {
  lineId: string;
  shiftName: 'Shift A' | 'Shift B' | 'Shift C';
  shiftDate: string;
  timezone: 'Africa/Lagos';
  avgThroughput: number;
  avgOee: number;
  downtimeMinutes: number;
  faultCount: number;
}
