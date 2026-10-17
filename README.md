# Dwellocal

Property management with a public one-page showcase per property and a private host portal. Manual ledgers only — no payment processing.

## Stack

React, Vite, Tailwind CSS, shadcn-style UI primitives, Framer Motion, Supabase (Auth + Postgres + Storage), Vercel-ready.

## Local

```bash
cp .env.example .env
npm install
npm run dev
```

Without Supabase credentials the marketing site and `/demo` routes still work. Auth, CMS saves, and live `/:slug` pages need a project.

## Supabase

1. Create a project and paste URL + anon key into `.env`.
2. In the SQL editor, run the **entire** `supabase/migrations/001_schema.sql` file. That creates `site_settings` (including email and phone). Run `002_contact_fields.sql` only if this project already had an older 001 without those columns. Run `003_support_resolved.sql` to add support thread resolution, then `004_support_threads.sql` so each inquiry can be its own conversation. Run `005_is_super_admin_rls.sql` so pending users can load their profile after login.
3. Create a **public** Storage bucket named `gallery`.
4. Enable Email OTP, Google, and Facebook in Authentication → Providers. Paste each provider’s Client ID and secret. In Google and Facebook consoles, the OAuth redirect URL must be `https://<project-ref>.supabase.co/auth/v1/callback`.
5. In Authentication → URL Configuration, set **Site URL** to your app (`http://localhost:5173` locally, the Vercel URL in production). Add these **Redirect URLs**:
   - `http://localhost:5173/after-login`
   - `https://<your-vercel-domain>/after-login`
6. Confirm `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, restart `npm run dev`, then try **Sign in with Google** / **Sign in with Facebook** on `/login`. New accounts stay `pending` until a Super Admin approves them.
7. Create the default Super Admin: run `supabase/default_super_admin.sql` in the SQL editor, then sign in at `/super-admin`. To promote a different existing account, edit the email in `supabase/super_admin.sql` and run that file instead.

New signups stay `pending` until a Super Admin approves them.

## Deploy

Connect the GitHub repo to Vercel. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Plans

| | Free | Pro |
| --- | --- | --- |
| Properties | 1 | `property_limit` (default 10) |
| Gallery | 6 | 20 |
| Templates | Classic, Modern, Coastal | All |
| Hide branding / custom scripts | No | Yes |

Plan expiration uses `user_plans.plan_expires_at`. After expiry, the app treats the user as Free.

## Demo

- `/demo` overview
- `/demo/property` sample showcase
- `/demo/admin` sample dashboard (read-only)
- `/demo/guide` sample guest guide
