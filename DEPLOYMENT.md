# Deployment Guide: Vercel + Supabase

This guide will help you deploy your shop app to Vercel using Supabase for database, auth, and storage.

## Prerequisites

- GitHub account (or GitLab/Bitbucket)
- Supabase account (free tier works)
- Vercel account (free tier works)
- Stripe account (for payments - optional for testing)

## Step 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: Your project name
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key
   - **service_role** key (keep this secret!)
3. Go to **Project Settings** → **Database**
4. Copy the **Connection string** (URI format) - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Extract your **Project Reference** from the URL (the part before `.supabase.co`)

### Create Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **New bucket**
3. Name it: `media`
4. Make it **Public** (or set up RLS policies later)
5. Click **Create bucket**

## Step 2: Set Up Database Schema

Run migrations to create your database tables:

```bash
# Make sure you have DATABASE_URL in your .env file
npm run db:push
```

Or manually run the SQL from your Drizzle migrations in the Supabase SQL Editor.

## Step 3: Set Up Stripe (Optional - for payments)

1. Go to [stripe.com](https://stripe.com) and create an account
2. Get your API keys from **Developers** → **API keys**:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)
3. Set up webhook (after deploying to Vercel):
   - Go to **Developers** → **Webhooks**
   - Add endpoint: `https://your-app.vercel.app/api/webhook`
   - Select events: `checkout.session.completed`, etc.
   - Copy the **Signing secret**

## Step 4: Deploy to Vercel

### Push Code to GitHub

```bash
git add .
git commit -m "Switch to Supabase Storage"
git push origin main
```

### Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New...** → **Project**
3. Import your Git repository
4. Vercel will auto-detect Next.js

### Configure Build Settings

- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install`

### Add Environment Variables

Go to **Project Settings** → **Environment Variables** and add:

#### Server-side Variables (Production, Preview, Development):

```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
STRIPE_SECRET_KEY=[YOUR-STRIPE-SECRET-KEY]
STRIPE_WEBHOOK_SECERT_KEY=[YOUR-STRIPE-WEBHOOK-SECRET]
DATABASE_SERVICE_ROLE=[YOUR-SERVICE-ROLE-KEY]
```

#### Client-side Variables (Production, Preview, Development):

```
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
NEXT_PUBLIC_SUPABASE_PROJECT_REF=[YOUR-PROJECT-REF]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[YOUR-STRIPE-PUBLISHABLE-KEY]
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
```

**Note**: Replace `[PROJECT-REF]` with your actual Supabase project reference (the part before `.supabase.co` in your URL).

### Deploy

1. Click **Deploy**
2. Wait for build to complete (~2-5 minutes)
3. Your app will be live at `https://your-app.vercel.app`

## Step 5: Post-Deployment Configuration

### Update Site URL

1. After first deploy, note your Vercel URL
2. Update `NEXT_PUBLIC_SITE_URL` in Vercel environment variables
3. Redeploy if needed

### Configure Supabase Auth

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://your-app.vercel.app`
3. Add **Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/**`

### Configure Stripe Webhook

1. In Stripe Dashboard → **Webhooks**
2. Add endpoint: `https://your-app.vercel.app/api/webhook`
3. Select events you need (e.g., `checkout.session.completed`)
4. Copy the webhook signing secret
5. Update `STRIPE_WEBHOOK_SECERT_KEY` in Vercel environment variables
6. Redeploy

## Step 6: Seed Database (Optional)

If you have seed data:

```bash
# Set DATABASE_URL to your production database
npm run db:seed
```

Or run the seed script locally with production `DATABASE_URL`.

## Environment Variables Summary

### Required for Supabase:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `NEXT_PUBLIC_SUPABASE_PROJECT_REF` - Project reference ID
- `DATABASE_SERVICE_ROLE` - Service role key (for admin operations)

### Required for Stripe:
- `STRIPE_SECRET_KEY` - Server-side secret key
- `STRIPE_WEBHOOK_SECERT_KEY` - Webhook signing secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Client-side publishable key

### Required for Site:
- `NEXT_PUBLIC_SITE_URL` - Your Vercel deployment URL

### Optional (no longer needed):
- `S3_ACCESS_KEY_ID` - Not needed (using Supabase Storage)
- `S3_SECRET_ACCESS_KEY` - Not needed
- `NEXT_PUBLIC_S3_BUCKET` - Not needed
- `NEXT_PUBLIC_S3_REGION` - Not needed

## Troubleshooting

### Build Fails
- Check Vercel build logs for missing environment variables
- Ensure all required env vars are set in Vercel
- Verify `DATABASE_URL` format is correct

### Database Connection Errors
- Verify `DATABASE_URL` includes correct password
- Check Supabase project is active
- Ensure database migrations have run

### Images Not Loading
- Verify `media` bucket exists in Supabase Storage
- Check bucket is set to **Public**
- Verify `NEXT_PUBLIC_SUPABASE_PROJECT_REF` is correct

### Auth Not Working
- Check Supabase redirect URLs are configured
- Verify `NEXT_PUBLIC_SITE_URL` matches your Vercel URL
- Check browser console for errors

### Storage Upload Fails
- Verify `DATABASE_SERVICE_ROLE` is set correctly
- Check bucket permissions in Supabase
- Ensure bucket name is exactly `media`

## Next Steps

- Set up custom domain in Vercel (optional)
- Configure Row Level Security (RLS) policies in Supabase
- Set up monitoring and error tracking
- Configure email templates in Supabase Auth

## Support

For issues:
- Check Vercel deployment logs
- Check Supabase logs in dashboard
- Review browser console for client-side errors

