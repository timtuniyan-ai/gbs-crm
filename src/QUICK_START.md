# Quick Start Guide - 5 Minutes to Production

This is a streamlined guide to get your CRM running with Supabase in 5 minutes.

## Step 1: Setup Supabase (2 minutes)

1. Go to https://supabase.com and create account
2. Create new project (choose region, set password)
3. Wait for project to initialize (~30 seconds)
4. Go to **SQL Editor**
5. Copy the entire SQL script from `SUPABASE_SETUP.md` (marked as "Quick Setup Script")
6. Paste and run it
7. Verify: Check **Table Editor** - you should see `clients`, `notes`, `tasks`

## Step 2: Get Your Credentials (30 seconds)

1. Go to **Project Settings** → **API**
2. Copy these two values:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon public key** → This is your `VITE_SUPABASE_ANON_KEY`

## Step 3: Install Dependencies (30 seconds)

```bash
npm install @supabase/supabase-js
```

## Step 4: Configure Environment (30 seconds)

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from Step 2.

## Step 5: Create Integration Files (1 minute)

### Create `/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Create `/lib/api.ts`:
Copy the complete code from `INTEGRATION_GUIDE.md` section "Step 3: Create API Service"

## Step 6: Update App.tsx (30 seconds)

Replace your current `App.tsx` with the updated version from `INTEGRATION_GUIDE.md` section "Step 4: Update App.tsx"

## Step 7: Update LoginForm.tsx (30 seconds)

Replace your current `LoginForm.tsx` with the code from `INTEGRATION_GUIDE.md` section "Step 5: Update LoginForm Component"

## Step 8: Test Locally (30 seconds)

```bash
npm run dev
```

1. Open http://localhost:5173
2. Try to register (enter email + password)
3. Check email for confirmation (if enabled)
4. Login with your credentials
5. Add a test client
6. Verify data persists after page refresh

## ✅ Done!

Your CRM is now running with Supabase backend!

## Deploy to Production (Optional)

### Option A: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```
Then add environment variables in Vercel dashboard.

### Option B: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```
Then add environment variables in Netlify dashboard.

## Troubleshooting

### "Missing Supabase environment variables"
- Check that `.env` file exists in project root
- Verify variable names are exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after creating `.env`

### "Not authenticated" error
- Make sure you're logged in
- Check Supabase Auth settings are enabled
- Verify RLS policies are created

### Can't see data after refresh
- Check browser console for errors
- Verify `user_id` is set when creating records
- Test RLS policies in Supabase SQL editor

### Email confirmation not working
- Go to Supabase → Authentication → Settings
- Disable "Email Confirmations" for testing
- Or set up SMTP for production

## Need More Details?

- **Database Setup**: See `SUPABASE_SETUP.md`
- **Full Integration**: See `INTEGRATION_GUIDE.md`
- **Deployment**: See `DEPLOYMENT_CHECKLIST.md`
- **Overview**: See `README.md`

## Support

If you get stuck:
1. Check Supabase logs: Project → Logs
2. Check browser console for errors
3. Review `INTEGRATION_GUIDE.md` for detailed explanations
4. Visit Supabase Discord: https://discord.supabase.com

---

**Time to Production**: ~5 minutes
**Difficulty**: Easy
**Prerequisites**: Node.js, npm, Supabase account
