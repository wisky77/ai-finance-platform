# Supabase Migration Guide

This project has been migrated from Clerk to Supabase for authentication and database hosting.

## What Changed

### 1. Authentication
- ✅ Removed Clerk authentication
- ✅ Added Supabase Auth with @supabase/ssr and @supabase/supabase-js
- ✅ Updated middleware to use Supabase auth
- ✅ Created Supabase client utilities in `lib/supabase/`

### 2. Database
- ✅ Updated Prisma schema to remove `clerkUserId`
- ✅ User ID now comes directly from Supabase Auth (UUID)
- ✅ Added `DIRECT_URL` for Prisma migrations

### 3. Environment Variables
- ✅ Updated `.env` file with Supabase configuration

## Setup Instructions

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in and create a new project
3. Wait for the project to be provisioned

### Step 2: Get Your Supabase Credentials

From your Supabase dashboard:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

3. Go to **Settings** → **Database**
4. Copy the connection strings:
   - **Connection Pooling** (port 6543) → `DATABASE_URL`
   - **Direct Connection** (port 5432) → `DIRECT_URL`

### Step 3: Update Your .env File

Fill in your `.env` file with the credentials from Step 2:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database URLs
DATABASE_URL=postgresql://postgres.your-ref:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.your-ref:your-password@aws-0-us-east-1.compute.amazonaws.com:5432/postgres
```

### Step 4: Run Prisma Migrations

```bash
# Generate a new migration for the schema changes
npx prisma migrate dev --name remove_clerk_add_supabase

# Or if you want to push schema directly
npx prisma db push
```

### Step 5: Enable Email Auth in Supabase

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable **Email** provider
3. Configure email templates (optional)
4. Disable email confirmations for development (optional)

### Step 6: Create Sign-in/Sign-up Pages

You'll need to create authentication pages. Here are the routes you need:

- `/app/sign-in/page.jsx` - Sign in page
- `/app/sign-up/page.jsx` - Sign up page

Example sign-in page using Supabase:

```jsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSignIn}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Step 7: Update Your Code

Search for any remaining Clerk imports in your codebase and replace them with Supabase equivalents:

**Before (Clerk):**
```js
import { auth } from '@clerk/nextjs/server';
const { userId } = await auth();
```

**After (Supabase):**
```js
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Step 8: Test Your Application

```bash
npm run dev
```

## Key Differences

### Client Components (Browser)
```js
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

### Server Components/API Routes
```js
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
```

### Getting Current User
```js
const { data: { user } } = await supabase.auth.getUser();
```

### Sign Out
```js
await supabase.auth.signOut();
```

## Benefits of Supabase

✅ **Unified Platform** - Database + Auth in one place
✅ **PostgreSQL** - Full-featured relational database
✅ **Real-time** - Built-in real-time subscriptions
✅ **Row Level Security** - Database-level security policies
✅ **Storage** - File storage included
✅ **Open Source** - Can self-host if needed
✅ **Free Tier** - Generous free tier for development

## Next Steps

1. Fill in your `.env` file with Supabase credentials
2. Run Prisma migrations
3. Create authentication pages
4. Test the application
5. Update any remaining Clerk-specific code in your components

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Supabase Auth: https://supabase.com/docs/guides/auth
- Next.js Integration: https://supabase.com/docs/guides/auth/server-side/nextjs
