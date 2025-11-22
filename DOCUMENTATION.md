# Project Documentation

This document provides a concise, practical reference for working with this project end‑to‑end: setup, development, deployment, operations, and troubleshooting.

## 1. Overview
- Framework: Next.js 15 (App Router) + React 19
- Styling: Tailwind CSS + shadcn/ui
- Database/ORM: PostgreSQL (Supabase) + Prisma 6
- Auth: Supabase Auth (SSR)
- Email: Resend
- AI: Google Generative AI (Gemini) via `@google/generative-ai`
- Rate limiting: Arcjet (applied in Node routes/server actions, not in Edge middleware)
- Charts/PDF: Recharts, html2pdf-style generation (see components)
- Currency: KES (Kenyan Shilling) is the standard across the UI and exports

## 2. Architecture
- `app/` App Router structure with server actions and server components
- Authentication guard:
  - Edge middleware: redirects based on Supabase session (lightweight)
  - Root layout is dynamic to ensure auth state renders immediately after login
- Database access via Prisma in server actions located under `actions/`
- API routes under `app/api/` for AI, seed, inngest hook

### Key Paths
- `middleware.js` — lightweight auth/redirect checks using Supabase SSR session
- `lib/supabase/` — SSR and client helpers
- `lib/prisma.js` — Prisma client
- `actions/` — server actions for accounts, transactions, budgets, emails, seeding
- `app/api/generate-insight/route.js` — AI insights endpoint (POST)
- `prisma/` — Prisma schema and migrations

## 3. Environment Variables
Set these in `.env.local` for local dev and in Vercel project settings for production:

Required:
- `DATABASE_URL` — Supabase pooled connection string (for serverless)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GOOGLE_API_KEY` — Google Generative AI API key
- `RESEND_API_KEY` — for transactional emails
- `ARCJET_KEY` — if you enable Arcjet on server actions

Optional:
- `DIRECT_URL` — direct connection string for migrations/tooling

## 4. Installation & Local Development
1) Install Node 20+ (recommended) and pnpm/npm.
2) Install deps:
   - `npm install`
3) Setup env:
   - Copy `.env.example` (if available) to `.env.local` and fill in values.
4) Generate Prisma client:
   - `npx prisma generate`
5) Run dev server:
   - `npm run dev`

## 5. Database & Prisma
- Schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations/*`
- Generate client: `npx prisma generate`
- Apply migrations locally: `npx prisma migrate dev`
- Apply migrations in prod: `npx prisma migrate deploy` (run manually or via CI — not in Vercel build)

Notes:
- Decimal fields are used for money values; server actions should convert numbers for client rendering.
- KES is the default currency for display; avoid `$` or `USD` in UI.

## 6. Authentication
- Supabase Auth is used throughout; the middleware refreshes session and redirects:
  - Auth routes: `/sign-in`, `/sign-up` redirect to `/dashboard` if already signed in
  - Protected routes: `/dashboard`, `/account`, `/transaction` redirect to `/sign-in` if unauthenticated
- Root layout is marked `dynamic = 'force-dynamic'` so the header reflects signed-in state immediately.

## 7. Middleware
- Edge middleware is intentionally lightweight to stay under Vercel’s 1 MB Edge size limit.
- It uses `@supabase/ssr` at the edge to refresh session and read the user per request.
- Heavy logic (rate limits, AI, DB calls) should remain in Node runtime routes or server actions.

## 8. AI Insights API
- Route: `POST /api/generate-insight`
- Env: `GOOGLE_API_KEY` required
- Body: `{ "transactions": Array<TransactionLike> }`
- Returns: `{ status: 'success', insight: string }` or `{ status: 'error', message: string }`
- Implementation uses `@google/generative-ai` with `gemini-2.0-flash` model.

Example client usage:
```js
const res = await fetch('/api/generate-insight', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ transactions }),
});
```

## 9. Emails
- Resend is used in `actions/send-email.js`.
- Ensure `RESEND_API_KEY` is set and your sending domain verified.

## 10. Currency (KES)
- The UI standard is KES. Avoid hardcoded `$`.
- Prefer a central formatter utility (suggested):
```js
export const formatKES = (amount) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount ?? 0);
```
- Replace inline strings with `formatKES(value)` for consistency.

## 11. Deployment (Vercel)
- Build Command: `npm run build`
- Do NOT run DB migrations in the Vercel build step.
- Apply migrations outside of Vercel build:
  - Manual: `vercel env pull .env.production` then `npx prisma migrate deploy`
  - CI: Use a GitHub Actions workflow (see `DEPLOYMENT.md` for example)
- After deploy validation:
  - Auth: sign in/out, protected routes redirect
  - Dashboard: accounts/transactions load without 500s
  - AI endpoint returns insights (requires `GOOGLE_API_KEY`)
  - Emails can be sent (Resend configured)

## 12. Troubleshooting
- Build stuck near Prisma schema: normal for `prisma generate`. If build truly hangs, remove `prisma migrate deploy` from Vercel build and mark DB pages `force-dynamic` (already done).
- Edge function size > 1 MB: keep middleware minimal; move rate limiting to server actions.
- 400 from `/api/generate-insight`: ensure valid JSON body and `transactions` array; check `GOOGLE_API_KEY`.
- Stuck on `/sign-in` after successful login: session now refreshed in middleware and layout is dynamic. Clear cookies and retry if needed.
- Currency shows `$`: search for `$`/`USD` and replace with KES or `formatKES`.

## 13. Scripts
- `npm run dev` — local dev (Turbopack)
- `npm run build` — production build
- `npm run start` — start production server locally
- `postinstall` — `prisma generate`
- `npm run migrate:deploy` — `prisma migrate deploy`

## 14. Security & Hardening
- Apply RLS policies in Supabase for tables (users, accounts, transactions, budgets) to enforce per-user row access.
- Keep Arcjet for critical endpoints in Node runtime where size limits don’t apply.
- Validate all inputs (consider adding Zod schemas for API/server actions).
- Never expose server secrets to the client; only `NEXT_PUBLIC_*` appear in the browser.

## 15. Testing (Suggested)
- Add unit tests for server actions and API routes (e.g., Vitest/Jest)
- Add smoke tests for auth redirects and protected routes

## 16. Contributing Conventions
- Use meaningful commits
- Keep migrations in sync with schema
- Prefer a central currency formatter
- Follow accessibility best practices in UI components

---
If anything is unclear or you find gaps, please open an issue or ping the maintainer.
