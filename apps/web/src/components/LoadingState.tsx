export function LoadingState() {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="spinner" />
      <p>Loading operational telemetry...</p>
    </div>
  );
}
