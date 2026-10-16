-- Promote an Auth user to Super Admin, creating the profile if it is missing.
-- Common case: the account was created before 001_schema.sql (no trigger row).
-- Replace the email below, then run this file in the Supabase SQL editor.

do $$
declare
  target_email text := 'you@example.com';
  auth_id uuid;
  auth_email text;
  auth_name text;
begin
  select u.id, u.email, coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '')
  into auth_id, auth_email, auth_name
  from auth.users u
  where lower(coalesce(u.email, '')) = lower(target_email)
     or exists (
       select 1
       from auth.identities i
       where i.user_id = u.id
         and lower(coalesce(i.identity_data->>'email', '')) = lower(target_email)
     )
  order by u.created_at
  limit 1;

  if auth_id is null then
    raise exception
      'No Auth user for %. Sign in once at /login (email, Google, or Facebook), then run this again.',
      target_email;
  end if;

  insert into public.profiles (id, email, full_name, role, status)
  values (
    auth_id,
    coalesce(auth_email, target_email),
    coalesce(auth_name, ''),
    'super_admin',
    'approved'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    role = 'super_admin',
    status = 'approved';

  insert into public.user_plans (user_id, plan, property_limit, hide_branding)
  values (auth_id, 'pro', 99, true)
  on conflict (user_id) do update
  set
    plan = excluded.plan,
    property_limit = excluded.property_limit,
    hide_branding = excluded.hide_branding;

  raise notice 'Promoted % (%) to super_admin.', coalesce(auth_email, target_email), auth_id;
end $$;
