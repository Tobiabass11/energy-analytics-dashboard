import { useEffect, useMemo, useState } from 'react';
import type { MetricKey, ThresholdConfig } from '@energy-dashboard/shared';

type ThresholdEditorProps = {
  value?: ThresholdConfig;
  isSaving: boolean;
  onSave: (next: ThresholdConfig) => Promise<void>;
};

const METRICS: Array<{ key: MetricKey; label: string; unit: string }> = [
  { key: 'throughput', label: 'Throughput', unit: 'units/h' },
  { key: 'temperature', label: 'Temperature', unit: 'deg C' },
  { key: 'pressure', label: 'Pressure', unit: 'bar' },
  { key: 'energy', label: 'Energy', unit: 'kWh' },
];

function parseOrKeep(rawValue: string, fallback: number) {
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function ThresholdEditor({ value, isSaving, onSave }: ThresholdEditorProps) {
  const [draft, setDraft] = useState<ThresholdConfig | undefined>(value);
  const [notice, setNotice] = useState<string>('');

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const canSave = useMemo(() => Boolean(draft), [draft]);

  const updateMetricField = (
    metric: MetricKey,
    field: 'min' | 'max' | 'warningBuffer',
    raw: string,
  ) => {
    if (!draft) {
      return;
    }

    setDraft({
      ...draft,
      [metric]: {
        ...draft[metric],
        [field]: parseOrKeep(raw, draft[metric][field]),
      },
    });
  };

  const handleSave = async () => {
    if (!draft) {
      return;
    }

    await onSave(draft);
    setNotice('Thresholds updated successfully.');
    window.setTimeout(() => setNotice(''), 2000);
  };

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Anomaly Thresholds</h2>
      </header>

      {notice && <p className="notice">{notice}</p>}

      {!draft && <p>Threshold data unavailable.</p>}

      {draft && (
        <div className="threshold-table-wrap">
          <table className="threshold-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Min</th>
                <th>Max</th>
                <th>Warning Buffer</th>
              </tr>
            </thead>
            <tbody>
              {METRICS.map((metric) => (
                <tr key={metric.key}>
                  <td>
                    {metric.label} <small>({metric.unit})</small>
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      value={draft[metric.key].min}
                      onChange={(event) => updateMetricField(metric.key, 'min', event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      value={draft[metric.key].max}
                      onChange={(event) => updateMetricField(metric.key, 'max', event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      value={draft[metric.key].warningBuffer}
                      onChange={(event) =>
                        updateMetricField(metric.key, 'warningBuffer', event.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="threshold-actions">
            <button className="button" onClick={handleSave} disabled={!canSave || isSaving}>
              {isSaving ? 'Saving...' : 'Save Thresholds'}
            </button>
            <button
              className="button button--ghost"
              onClick={() => setDraft(value)}
              disabled={isSaving}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
