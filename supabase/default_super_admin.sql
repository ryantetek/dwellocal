-- Bootstrap the default Super Admin Auth user + profile.
-- Run after 001_schema.sql in the Supabase SQL editor.
-- Sign in at /login or /super-admin with this email and password.

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  v_email text := '-';
  v_password text := '-';
  v_user_id uuid;
  v_encrypted text := extensions.crypt(v_password, extensions.gen_salt('bf'));
begin
  select id into v_user_id
  from auth.users
  where lower(email) = lower(v_email)
  limit 1;

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      v_encrypted,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Ryan"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  else
    update auth.users
    set
      encrypted_password = v_encrypted,
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"provider":"email","providers":["email"]}'::jsonb,
      updated_at = now()
    where id = v_user_id;
  end if;

  if not exists (
    select 1 from auth.identities
    where user_id = v_user_id and provider = 'email'
  ) then
    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
      'email',
      v_user_id::text,
      now(),
      now(),
      now()
    );
  end if;

  insert into public.profiles (id, email, full_name, role, status)
  values (v_user_id, v_email, 'Ryan', 'super_admin', 'approved')
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role = 'super_admin',
    status = 'approved';

  insert into public.user_plans (user_id, plan, property_limit, hide_branding)
  values (v_user_id, 'pro', 99, true)
  on conflict (user_id) do update
  set
    plan = excluded.plan,
    property_limit = excluded.property_limit,
    hide_branding = excluded.hide_branding;

  raise notice 'Default super admin ready: %', v_email;
end $$;
