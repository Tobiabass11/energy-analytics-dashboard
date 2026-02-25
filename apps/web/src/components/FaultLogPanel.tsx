import type { FaultEvent } from '@energy-dashboard/shared';
import { categoryLabel, formatTimestamp, severityLabel } from '../lib/format';

type FaultFilterState = {
  startLocal: string;
  endLocal: string;
  category: 'all' | FaultEvent['category'];
};

type FaultLogPanelProps = {
  faults: FaultEvent[];
  filters: FaultFilterState;
  onChange: (filters: FaultFilterState) => void;
};

export function FaultLogPanel({ faults, filters, onChange }: FaultLogPanelProps) {
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Fault Log</h2>
      </header>

      <div className="fault-filters">
        <label>
          Start
          <input
            type="datetime-local"
            value={filters.startLocal}
            onChange={(event) => onChange({ ...filters, startLocal: event.target.value })}
          />
        </label>
        <label>
          End
          <input
            type="datetime-local"
            value={filters.endLocal}
            onChange={(event) => onChange({ ...filters, endLocal: event.target.value })}
          />
        </label>
        <label>
          Category
          <select
            value={filters.category}
            onChange={(event) =>
              onChange({
                ...filters,
                category: event.target.value as FaultFilterState['category'],
              })
            }
          >
            <option value="all">All</option>
            <option value="mechanical">Mechanical</option>
            <option value="electrical">Electrical</option>
            <option value="quality">Quality</option>
            <option value="utility">Utility</option>
          </select>
        </label>
      </div>

      <div className="fault-table-wrap">
        <table className="fault-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Fault</th>
              <th>Category</th>
              <th>Duration</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {faults.length === 0 && (
              <tr>
                <td colSpan={6} className="table-empty">
                  No faults in the selected filter range.
                </td>
              </tr>
            )}
            {faults.map((fault) => (
              <tr key={fault.id}>
                <td>{formatTimestamp(fault.startedAt, true)}</td>
                <td>{fault.faultType}</td>
                <td>{categoryLabel(fault.category)}</td>
                <td>{fault.durationMinutes} min</td>
                <td>
                  <span className={`severity severity--${fault.severity}`}>
                    {severityLabel(fault.severity)}
                  </span>
                </td>
                <td>{fault.resolutionStatus === 'open' ? 'Open' : 'Resolved'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
