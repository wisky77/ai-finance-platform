# Full Stack AI Fianace Platform with Next JS, Supabase, Tailwind, Prisma, Inngest, ArcJet, Shadcn UI Tutorial 🔥🔥
## https://youtu.be/egS6fnZAdzk

<img width="1470" alt="Screenshot 2024-12-10 at 9 45 45 AM" src="https://github.com/user-attachments/assets/1bc50b85-b421-4122-8ba4-ae68b2b61432">

### Make sure to create a `.env` file with the following variables

```
# Supabase / Database
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# External services
GOOGLE_API_KEY=
RESEND_API_KEY=
ARCJET_KEY=
```

Notes:
- In production (Vercel), set these in Project → Settings → Environment Variables. Local `.env` is not read on Vercel.
- For serverless, use a pooled Supabase connection string for `DATABASE_URL`.
- If you previously used Clerk, this project now uses Supabase Auth, so Clerk keys are not required.
