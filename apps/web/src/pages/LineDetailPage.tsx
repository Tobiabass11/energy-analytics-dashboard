import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FaultEvent, ThresholdConfig, TimeWindow } from '@energy-dashboard/shared';
import {
  getLineFaults,
  getLineOverview,
  getLineThresholds,
  getLineTimeseries,
  getShiftSummary,
  updateLineThresholds,
} from '../lib/api';
import { formatTimestamp } from '../lib/format';
import { FaultLogPanel } from '../components/FaultLogPanel';
import { LoadingState } from '../components/LoadingState';
import { MetricChart } from '../components/MetricChart';
import { ShiftReportButton } from '../components/ShiftReportButton';
import { StatusChip } from '../components/StatusChip';
import { ThresholdEditor } from '../components/ThresholdEditor';

const WINDOWS: Array<{ label: string; value: TimeWindow }> = [
  { label: 'Last Hour', value: 'hour' },
  { label: 'Current Shift', value: 'shift' },
  { label: 'Last Day', value: 'day' },
  { label: 'Last Week', value: 'week' },
];

type FaultFilterState = {
  startLocal: string;
  endLocal: string;
  category: 'all' | FaultEvent['category'];
};

function localDateInputToIso(raw: string) {
  if (!raw) {
    return undefined;
  }

  return new Date(raw).toISOString();
}

export function LineDetailPage() {
  const { lineId } = useParams<{ lineId: string }>();
  const [window, setWindow] = useState<TimeWindow>('shift');
  const [faultFilters, setFaultFilters] = useState<FaultFilterState>({
    startLocal: '',
    endLocal: '',
    category: 'all',
  });

  const reportRef = useRef<HTMLElement | null>(null);
  const queryClient = useQueryClient();

  const overviewQuery = useQuery({
    queryKey: ['line-overview'],
    queryFn: getLineOverview,
  });

  const lineQuery = useQuery({
    queryKey: ['line-timeseries', lineId, window],
    queryFn: () => getLineTimeseries(lineId ?? '', window),
    enabled: Boolean(lineId),
  });

  const faultsQuery = useQuery({
    queryKey: [
      'line-faults',
      lineId,
      faultFilters.startLocal,
      faultFilters.endLocal,
      faultFilters.category,
    ],
    queryFn: () =>
      getLineFaults(lineId ?? '', {
        start: localDateInputToIso(faultFilters.startLocal),
        end: localDateInputToIso(faultFilters.endLocal),
        category: faultFilters.category === 'all' ? undefined : faultFilters.category,
      }),
    enabled: Boolean(lineId),
  });

  const thresholdsQuery = useQuery({
    queryKey: ['line-thresholds', lineId],
    queryFn: () => getLineThresholds(lineId ?? ''),
    enabled: Boolean(lineId),
  });

  const shiftSummaryQuery = useQuery({
    queryKey: ['line-shift-summary', lineId],
    queryFn: () => getShiftSummary(lineId ?? ''),
    enabled: Boolean(lineId),
  });

  const thresholdsMutation = useMutation({
    mutationFn: (next: ThresholdConfig) => updateLineThresholds(lineId ?? '', next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['line-thresholds', lineId] });
      queryClient.invalidateQueries({ queryKey: ['line-timeseries', lineId] });
      queryClient.invalidateQueries({ queryKey: ['line-overview'] });
    },
  });

  const selectedLineOverview = useMemo(
    () => overviewQuery.data?.find((line) => line.lineId === lineId),
    [overviewQuery.data, lineId],
  );

  if (!lineId) {
    return <p className="error-box">Line not provided.</p>;
  }

  if (lineQuery.isLoading || thresholdsQuery.isLoading || shiftSummaryQuery.isLoading) {
    return <LoadingState />;
  }

  if (lineQuery.isError || thresholdsQuery.isError || shiftSummaryQuery.isError) {
    return <p className="error-box">Unable to load diagnostic data for {lineId}.</p>;
  }

  const points = lineQuery.data ?? [];
  const shiftSummary = shiftSummaryQuery.data;

  if (!shiftSummary) {
    return <p className="error-box">Shift summary unavailable for {lineId}.</p>;
  }

  return (
    <section className="line-detail-page">
      <div className="line-detail-top">
        <div>
          <Link className="inline-link" to="/">
            Back to overview
          </Link>
          <h2>{lineId} Diagnostics</h2>
          {selectedLineOverview && <StatusChip status={selectedLineOverview.status} />}
          {selectedLineOverview && (
            <p className="line-detail-subtle">
              Last update: {formatTimestamp(selectedLineOverview.lastUpdated, true)}
            </p>
          )}
        </div>
        <div className="window-controls">
          {WINDOWS.map((item) => (
            <button
              key={item.value}
              className={`window-button ${item.value === window ? 'window-button--active' : ''}`}
              onClick={() => setWindow(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section className="panel shift-summary" ref={reportRef}>
        <header className="panel-header">
          <h2>Shift Summary ({shiftSummary.shiftName})</h2>
        </header>
        <div className="summary-grid">
          <div>
            <p>Shift Date</p>
            <strong>{shiftSummary.shiftDate}</strong>
          </div>
          <div>
            <p>Avg Throughput</p>
            <strong>{shiftSummary.avgThroughput.toFixed(2)} units/h</strong>
          </div>
          <div>
            <p>Avg OEE</p>
            <strong>{shiftSummary.avgOee.toFixed(1)}%</strong>
          </div>
          <div>
            <p>Downtime</p>
            <strong>{shiftSummary.downtimeMinutes} min</strong>
          </div>
          <div>
            <p>Fault Count</p>
            <strong>{shiftSummary.faultCount}</strong>
          </div>
          <div>
            <p>Timezone</p>
            <strong>{shiftSummary.timezone}</strong>
          </div>
        </div>
      </section>

      <div className="report-action-row">
        <ShiftReportButton
          targetRef={reportRef}
          lineId={lineId}
          shiftDate={shiftSummary.shiftDate}
          shiftName={shiftSummary.shiftName}
        />
      </div>

      <div className="charts-grid">
        <MetricChart title="Throughput" metricKey="throughput" unit="units/h" points={points} />
        <MetricChart title="Temperature" metricKey="temperature" unit="deg C" points={points} />
        <MetricChart title="Pressure" metricKey="pressure" unit="bar" points={points} />
        <MetricChart title="Energy" metricKey="energy" unit="kWh" points={points} />
      </div>

      <FaultLogPanel
        faults={faultsQuery.data ?? []}
        filters={faultFilters}
        onChange={setFaultFilters}
      />

      <ThresholdEditor
        value={thresholdsQuery.data?.thresholds}
        isSaving={thresholdsMutation.isPending}
        onSave={async (next) => {
          await thresholdsMutation.mutateAsync(next);
        }}
      />
    </section>
  );
}
