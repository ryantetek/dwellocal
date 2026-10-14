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
2. Run `supabase/migrations/001_schema.sql` in the SQL editor.
3. Create a **public** Storage bucket named `gallery`.
4. Enable Email OTP, Google, and Facebook in Authentication → Providers.
5. Promote a staff user to Super Admin:

```sql
update public.profiles set role = 'super_admin', status = 'approved' where email = 'you@example.com';
```

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
