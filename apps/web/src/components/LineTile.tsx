import { Link } from 'react-router-dom';
import type { LineOverview } from '@energy-dashboard/shared';
import { StatusChip } from './StatusChip';

type LineTileProps = {
  line: LineOverview;
};

export function LineTile({ line }: LineTileProps) {
  return (
    <Link className="line-tile" to={`/lines/${line.lineId}`}>
      <header className="line-tile-header">
        <h3>{line.lineId}</h3>
        <StatusChip status={line.status} />
      </header>
      <dl className="line-metrics">
        <div>
          <dt>Throughput</dt>
          <dd>{line.throughputRate.toFixed(1)} units/h</dd>
        </div>
        <div>
          <dt>OEE</dt>
          <dd>{line.oee.toFixed(1)}%</dd>
        </div>
        <div>
          <dt>Shift Downtime</dt>
          <dd>{line.downtimeMinutes} min</dd>
        </div>
        <div>
          <dt>Shift Faults</dt>
          <dd>{line.faultCount}</dd>
        </div>
      </dl>
    </Link>
  );
}
