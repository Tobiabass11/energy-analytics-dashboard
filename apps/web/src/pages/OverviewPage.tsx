import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sortLinesByStatus } from '@energy-dashboard/shared';
import { getLineOverview } from '../lib/api';
import { LineTile } from '../components/LineTile';
import { LoadingState } from '../components/LoadingState';

export function OverviewPage() {
  const overviewQuery = useQuery({
    queryKey: ['line-overview'],
    queryFn: getLineOverview,
    refetchInterval: 60_000,
  });

  const lines = useMemo(() => sortLinesByStatus(overviewQuery.data ?? []), [overviewQuery.data]);

  const counters = useMemo(
    () => ({
      critical: lines.filter((line) => line.status === 'critical').length,
      warning: lines.filter((line) => line.status === 'warning').length,
      nominal: lines.filter((line) => line.status === 'nominal').length,
    }),
    [lines],
  );

  if (overviewQuery.isLoading) {
    return <LoadingState />;
  }

  if (overviewQuery.isError) {
    return <p className="error-box">Unable to load production line overview.</p>;
  }

  return (
    <section className="overview-page">
      <div className="kpi-strip">
        <article className="kpi-card kpi-card--critical">
          <h2>Critical</h2>
          <strong>{counters.critical}</strong>
        </article>
        <article className="kpi-card kpi-card--warning">
          <h2>Warning</h2>
          <strong>{counters.warning}</strong>
        </article>
        <article className="kpi-card kpi-card--nominal">
          <h2>Nominal</h2>
          <strong>{counters.nominal}</strong>
        </article>
      </div>

      <div className="line-grid">
        {lines.map((line) => (
          <LineTile key={line.lineId} line={line} />
        ))}
      </div>
    </section>
  );
}
