# Product Requirements Document

## Product Name

Energy Analytics Dashboard

## Objective

Deliver a desktop-first internal-style operations dashboard that transforms raw production telemetry into clear, actionable line health insights for operators and supervisors.

## Target Users

- Line operators during active shifts
- Shift supervisors for fault response and handover
- Operations management for productivity monitoring

## Problem Statement

Traditional SCADA interfaces are difficult to scan quickly under operational pressure. Operators need a simplified visual layer to identify issues fast, inspect line-level behavior, and generate shift handover reports with minimal manual work.

## Scope

### In Scope (MVP)

- 20-line overview grid with KPI and status tiles
- Severity-based tile ordering (critical/warning first)
- Line detail page with time-series charts
- Anomaly markers on chart points with reason tooltips
- Fault log with date/category filtering
- UI-based anomaly threshold configuration
- On-demand shift PDF report export

### Out of Scope (Deferred)

- Authentication/authorization
- Live SCADA streaming integration
- Mobile app UX
- Scheduled/automatic report generation

## Core Functional Requirements

1. Overview Screen
   - Display all lines as tiles with line ID, throughput, OEE, status, downtime, fault count.
   - Sort tiles so critical and warning lines are shown first.

2. Line Diagnostics Screen
   - Drill down from overview tile click.
   - Render charts for throughput, temperature, pressure, and energy.
   - Support time windows: hour, shift, day, week.
   - Highlight anomalies directly on charts.

3. Fault Log
   - Show fault timestamp, category, type, duration, severity, and resolution status.
   - Filter by date range and fault category.

4. Threshold Management
   - Allow threshold min/max/warning buffer editing per line.
   - Persist updates and apply to anomaly evaluation.

5. Shift Report PDF
   - Generate printable PDF summary on demand.
   - Include shift KPI summary and visual snapshot.

## Non-Functional Requirements

- Desktop-first responsive behavior (works on smaller screens but optimized for workstation displays)
- Clear, high-contrast industrial visual hierarchy
- API response times suited for operational monitoring workflows
- Type-safe contracts between frontend/backend

## Timezone and Shift Definitions

- Timezone: `Africa/Lagos` (WAT)
- Shift A: 06:00-13:59
- Shift B: 14:00-21:59
- Shift C: 22:00-05:59

## Success Criteria

- Operators can identify non-nominal lines in one screen scan.
- Users can open line diagnostics in one click.
- Shift summary PDF can be exported without manual KPI calculations.
- Fault and anomaly context is understandable without SCADA specialist expertise.
