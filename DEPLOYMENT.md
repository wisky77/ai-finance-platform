# Quick Deployment Guide (Vercel)

This project is a single Next.js app that can be deployed as one Vercel project. It uses Supabase (DB + Auth), Prisma, Arcjet, Google GenAI, and Resend.

## 1) Prepare environment variables in Vercel
Set these in Vercel → Project → Settings → Environment Variables (Production):

Required
- DATABASE_URL = Supabase pooled connection string (serverless/pooler)
- DIRECT_URL = Supabase direct connection string (non-pooled)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- ARCJET_KEY
- GOOGLE_API_KEY
- RESEND_API_KEY

Optional (only if you add jobs that need it later)
- SUPABASE_SERVICE_ROLE_KEY

Notes
- NEXT_PUBLIC_* values are exposed to the browser.
- Local .env files are ignored in Vercel; copy values into Vercel env settings.
- You can pull production envs locally via: `vercel env pull .env.local` (optional).

## 2) Configure build (no DB access in build)
- Build Command (recommended):
  - `npm run build`
- Output: leave default (Next.js)

Rationale: Avoid any database connections during Vercel’s build phase. Prisma and your DB should not be contacted during `next build`.

## 2b) Run migrations outside of Vercel build
Choose one of the following approaches:

- Manual, ad-hoc (one-time or as needed):
  1) Pull production envs locally: `vercel env pull .env.production`
  2) Run: `npx prisma migrate deploy --schema=./prisma/schema.prisma`

- CI/CD (recommended):
  - Use a GitHub Actions workflow that runs on push to main and executes `prisma migrate deploy` using your production DATABASE_URL/DIRECT_URL secrets. Example:
    ```yaml
    name: Deploy migrations
    on:
      workflow_dispatch: {}
      push:
        branches: [ main ]
        paths:
          - prisma/**
    jobs:
      migrate:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with:
              node-version: 20
          - run: npm ci
          - run: npx prisma migrate deploy --schema=./prisma/schema.prisma
            env:
              DATABASE_URL: ${{ secrets.DATABASE_URL }}
              DIRECT_URL: ${{ secrets.DIRECT_URL }}
    ```

Notes:
- Keep `npm run migrate:deploy` available for manual runs; just don’t call it in the Vercel build step.
- Seeding should also not run during build. Use the `/api/seed` route (dev only) or a dedicated script triggered manually/CI if needed.

## 3) Deploy
- Connect the Vercel project to the repository (main branch).
- Trigger a deployment (push to main or redeploy in the dashboard).

## 4) Post-deploy checks
- Auth: Sign in/out and confirm Supabase URL + Anon Key are correct.
- API routes:
  - `GET /api/seed` (optional) to generate sample data.
  - `POST /api/generate-insight` should work if `GOOGLE_API_KEY` is set.
- Emails: Ensure `RESEND_API_KEY` is set. For production recipients, configure and verify a domain in Resend.
- Arcjet: Ensure `ARCJET_KEY` is present; middleware and rate limiting will work in production.

## 5) Runtime notes
- Some API routes use `export const runtime = "nodejs";` to ensure compatibility with Prisma and server SDKs:
  - `/api/generate-insight`
  - `/api/seed`
  - `/api/inngest` (present, but you indicated Inngest isn’t needed right now)
- Middleware runs at the Edge and gracefully skips Supabase auth if envs are missing (to avoid 500s during misconfig).

## 6) Supabase settings
- Use connection pooling for serverless:
  - `DATABASE_URL` = pooled (pooler)
  - `DIRECT_URL` = direct (non-pooled)
- In Supabase Auth, ensure Email provider is enabled and configure email confirmation as desired.

## 7) Optional integrations
- Inngest: Not needed if you don’t run scheduled/triggered jobs. You can ignore for now.
- Monitoring/logging: Consider adding alerts and error reporting as you move to production.

## 8) Security and operations tips
- Keep `.env*` files out of git (already in `.gitignore`).
- Rotate and manage secrets in Vercel; do not hardcode keys.
- Use least-privilege keys (Service Role only where required).

That’s it—after envs are set and migrations run during build, the app should be production-ready on Vercel.
