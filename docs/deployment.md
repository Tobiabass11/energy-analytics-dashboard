# Deployment Guide (Vercel + Render)

## 1. Prepare GitHub Repository

1. Push repository to GitHub.
2. Ensure `main` branch is protected and CI workflow passes.

## 2. Deploy API to Render

1. Create a new Render Web Service from this repository.
2. Root Directory: `.`
3. Build Command:
   - `npm install && npm run build`
4. Start Command:
   - `npm run start -w @energy-dashboard/api`
5. Environment Variables:
   - `PORT=4000`
   - `CORS_ORIGIN=https://<your-vercel-domain>`

Optional for Postgres phase:

- Provision Render PostgreSQL
- Add `DATABASE_URL`
- Wire Prisma migration/seed steps

## 3. Deploy Web to Vercel

1. Import same GitHub repository into Vercel.
2. Project Root: `apps/web`
3. Framework preset: Vite
4. Environment Variable:
   - `VITE_API_BASE_URL=https://<your-render-api-domain>`

## 4. Validate Production

- Open `/` and verify overview tiles load
- Open a line detail page and verify charts/fault filters
- Update thresholds and confirm anomaly changes
- Generate PDF and confirm successful download

## 5. Post-Deploy Checklist

- Verify CORS allows only expected domains
- Confirm API health endpoint availability
- Monitor logs for 4xx/5xx spikes
