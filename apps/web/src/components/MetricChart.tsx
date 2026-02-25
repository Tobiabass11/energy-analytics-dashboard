import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MetricKey, SensorPoint } from '@energy-dashboard/shared';
import { formatTimestamp } from '../lib/format';

type MetricChartProps = {
  title: string;
  metricKey: MetricKey;
  unit: string;
  points: SensorPoint[];
};

function MetricTooltip({
  active,
  payload,
  label,
  metricKey,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: SensorPoint }>;
  label?: string;
  metricKey: MetricKey;
  unit: string;
}) {
  if (!active || !payload || payload.length === 0 || !label) {
    return null;
  }

  const point = payload[0].payload;
  const anomalies = point.anomalies.filter((item) => item.metric === metricKey);

  return (
    <div className="chart-tooltip">
      <p>{formatTimestamp(label, true)}</p>
      <strong>
        {payload[0].value.toFixed(2)} {unit}
      </strong>
      {anomalies.length > 0 && (
        <ul>
          {anomalies.map((anomaly) => (
            <li key={`${anomaly.metric}-${anomaly.reason}`}>{anomaly.reason}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MetricChart({ title, metricKey, unit, points }: MetricChartProps) {
  return (
    <article className="chart-card">
      <header>
        <h3>{title}</h3>
      </header>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(39, 44, 52, 0.15)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => formatTimestamp(value)}
              tick={{ fontSize: 12 }}
              minTickGap={24}
            />
            <YAxis tick={{ fontSize: 12 }} width={50} />
            <Tooltip
              content={(props) => (
                <MetricTooltip
                  active={props.active}
                  payload={
                    props.payload as Array<{ value: number; payload: SensorPoint }> | undefined
                  }
                  label={props.label as string | undefined}
                  metricKey={metricKey}
                  unit={unit}
                />
              )}
            />
            <Line
              type="monotone"
              dataKey={metricKey}
              stroke="#1f4c8f"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            {points.flatMap((point, index) =>
              point.anomalies
                .filter((anomaly) => anomaly.metric === metricKey)
                .map((anomaly) => (
                  <ReferenceDot
                    key={`${metricKey}-${point.timestamp}-${index}-${anomaly.reason}`}
                    x={point.timestamp}
                    y={point[metricKey]}
                    r={4}
                    fill={anomaly.severity === 'critical' ? '#c93526' : '#f08e1f'}
                    stroke="none"
                    ifOverflow="extendDomain"
                  />
                )),
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
