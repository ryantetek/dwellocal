-- Promote an existing Auth user to Super Admin.
-- 1. Sign up / sign in once so public.profiles has a row.
-- 2. Replace the email below, then run this file in the Supabase SQL editor.

do $$
declare
  target_email text := 'ryan@emerge.ph';
  updated_id uuid;
begin
  update public.profiles
  set
    role = 'super_admin',
    status = 'approved'
  where lower(email) = lower(target_email)
  returning id into updated_id;

  if updated_id is null then
    raise exception 'No profile found for %. Sign in once with that email, then run this again.', target_email;
  end if;

  insert into public.user_plans (user_id, plan, property_limit, hide_branding)
  values (updated_id, 'pro', 99, true)
  on conflict (user_id) do update
  set
    plan = excluded.plan,
    property_limit = excluded.property_limit,
    hide_branding = excluded.hide_branding;

  raise notice 'Promoted % to super_admin.', target_email;
end $$;
