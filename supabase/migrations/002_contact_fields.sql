-- Only for projects that already have public.site_settings from an older 001.
-- New projects: run 001_schema.sql in the SQL editor. Do not run this file first.
-- Current 001 already includes contact_email and contact_phone.

do $$
begin
  if to_regclass('public.site_settings') is null then
    raise exception
      'public.site_settings does not exist. Run supabase/migrations/001_schema.sql first (full file). This file only adds contact columns to an existing table.';
  end if;
end $$;

alter table public.site_settings
  add column if not exists contact_email text not null default '',
  add column if not exists contact_phone text not null default '';
