# Deployment and Portfolio Release Checklist

## 1. Render API Deployment

- [ ] Create Render Web Service from `tobiabass11/energy-analytics-dashboard`
- [ ] Confirm build command: `npm install && npm run build`
- [ ] Confirm start command: `npm run start -w @energy-dashboard/api`
- [ ] Set env vars:
  - [ ] `PORT=4000`
  - [ ] `CORS_ORIGIN=https://<vercel-domain>`
- [ ] Verify API health endpoint: `https://<render-domain>/api/health`

## 2. Vercel Web Deployment

- [ ] Import repo in Vercel with root directory `apps/web`
- [ ] Set env var: `VITE_API_BASE_URL=https://<render-domain>`
- [ ] Deploy to production
- [ ] Verify overview loads and API calls succeed

## 3. Functional Smoke Tests

- [ ] Open overview page and verify 20 lines render
- [ ] Open a line details page and verify chart data appears
- [ ] Change time window and verify chart updates
- [ ] Apply fault filters and verify table updates
- [ ] Edit thresholds and verify save succeeds
- [ ] Generate and download shift PDF

## 4. Portfolio Readiness Updates

- [ ] Capture and save screenshots to `docs/screenshots/`:
  - [ ] `overview-dashboard.png`
  - [ ] `line-diagnostics.png`
  - [ ] `fault-log-filters.png`
  - [ ] `threshold-configuration.png`
  - [ ] `shift-report-export.png`
- [ ] Replace placeholder README screenshot assets/paths with final screenshots
- [ ] Update README live links section with production URLs
- [ ] Add a short "Challenges and tradeoffs" section in README (optional)

## 5. GitHub Hygiene

- [ ] Enable branch protection on `main`
- [ ] Require CI checks before merge
- [ ] Add repository topics (`react`, `typescript`, `express`, `dashboard`, `energy-analytics`)

## 6. Final Verification

- [ ] Confirm `npm run lint` passes
- [ ] Confirm `npm run typecheck` passes
- [ ] Confirm `npm run test` passes
- [ ] Confirm `npm run build` passes
