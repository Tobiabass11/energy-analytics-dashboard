# Architecture Overview

## High-Level

1. Synthetic telemetry generator creates realistic production readings and faults.
2. Express API exposes aggregated and filtered operational endpoints.
3. React frontend consumes API via React Query and renders dashboards/charts.
4. Shared workspace package provides contracts and anomaly logic helpers.

## Monorepo

- `apps/web`
  - Routing, pages, components, chart rendering, PDF export
- `apps/api`
  - REST endpoints, synthetic dataset service, threshold updates, shift summary logic
- `packages/shared`
  - Types, constants, sorting logic, anomaly detection utility

## API Endpoints

- `GET /api/health`
- `GET /api/lines/overview`
- `GET /api/lines/:lineId/timeseries?window=hour|shift|day|week`
- `GET /api/lines/:lineId/faults?start=&end=&category=`
- `GET /api/lines/:lineId/thresholds`
- `PUT /api/lines/:lineId/thresholds`
- `GET /api/lines/:lineId/shifts/summary`

## Data Strategy

Current runtime data source is in-memory synthetic generation for portfolio demonstration.

PostgreSQL target schema is documented in `apps/api/prisma/schema.prisma` with models for:

- ProductionLine
- SensorReading
- FaultEvent
- ThresholdConfig

## Frontend State Strategy

- Server state: React Query
- Local UI state: React state
- Threshold writes: React Query mutation + invalidation

## Design Strategy

- Industrial visual language with light gray surfaces
- Semantic statuses: green nominal, amber warning, red critical
- Emphasis on readability, low click depth, and rapid fault triage
