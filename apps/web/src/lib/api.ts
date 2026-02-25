import type {
  FaultEvent,
  LineOverview,
  LineThresholdConfig,
  SensorPoint,
  ShiftSummary,
  ThresholdConfig,
  TimeWindow,
} from '@energy-dashboard/shared';

type ApiResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
  message?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API request failed: ${response.status}`);
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data;
}

export function getLineOverview() {
  return fetchJson<LineOverview[]>('/api/lines/overview');
}

export function getLineTimeseries(lineId: string, window: TimeWindow) {
  const params = new URLSearchParams({ window });
  return fetchJson<SensorPoint[]>(`/api/lines/${lineId}/timeseries?${params.toString()}`);
}

export type FaultFilters = {
  start?: string;
  end?: string;
  category?: FaultEvent['category'];
};

export function getLineFaults(lineId: string, filters: FaultFilters = {}) {
  const params = new URLSearchParams();

  if (filters.start) {
    params.set('start', filters.start);
  }

  if (filters.end) {
    params.set('end', filters.end);
  }

  if (filters.category) {
    params.set('category', filters.category);
  }

  const query = params.toString();
  return fetchJson<FaultEvent[]>(`/api/lines/${lineId}/faults${query ? `?${query}` : ''}`);
}

export function getLineThresholds(lineId: string) {
  return fetchJson<LineThresholdConfig>(`/api/lines/${lineId}/thresholds`);
}

export function updateLineThresholds(lineId: string, thresholds: ThresholdConfig) {
  return fetchJson<LineThresholdConfig>(`/api/lines/${lineId}/thresholds`, {
    method: 'PUT',
    body: JSON.stringify({ thresholds }),
  });
}

export function getShiftSummary(lineId: string) {
  return fetchJson<ShiftSummary>(`/api/lines/${lineId}/shifts/summary`);
}
