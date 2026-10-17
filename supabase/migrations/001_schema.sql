-- Dwellocal schema for Supabase
-- Run in the SQL editor, then create a public storage bucket named `gallery`.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin', 'super_admin')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.user_plans (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  plan_expires_at timestamptz,
  property_limit int not null default 1,
  hide_branding boolean not null default false
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  template text not null default 'classic',
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  property_id uuid primary key references public.properties(id) on delete cascade,
  property_name text not null default '',
  hero_title text not null default '',
  hero_subtitle text not null default '',
  hero_image_url text not null default '',
  location_summary text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  check_in_time text not null default '16:00',
  check_out_time text not null default '10:00',
  about_text text not null default '',
  wifi_network text not null default '',
  wifi_password text not null default '',
  door_password text not null default '',
  guide_intro text not null default '',
  guide_recommendations text not null default '',
  guide_preview_token text unique,
  ga4_id text,
  gtm_id text,
  custom_header_code text,
  custom_footer_code text,
  admin_last_seen timestamptz,
  hide_branding boolean not null default false
);

create table if not exists public.gallery_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  thumbnail_url text,
  sort_order int not null default 0
);

create table if not exists public.amenities (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  description text not null default '',
  icon text not null default 'home',
  image_url text,
  active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.house_rules (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  title text not null,
  description text not null default '',
  icon text not null default 'home',
  active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  platform text not null,
  url text not null,
  icon text not null default 'sparkles',
  sort_order int not null default 0
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  status text not null default 'reserved' check (status in ('reserved', 'available')),
  guest_name text not null default '',
  guest_email text not null default '',
  guest_phone text not null default '',
  party_size int not null default 1,
  details text not null default '',
  notes text not null default '',
  guide_token text unique,
  guide_expires_at timestamptz
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  guest_name text not null,
  guest_email text not null,
  message text not null,
  admin_reply text,
  is_read boolean not null default false,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.income_entries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  guest_name text not null default '',
  amount numeric not null,
  currency text not null default 'USD',
  entry_date date not null,
  description text not null default '',
  payment_method text not null default ''
);

create table if not exists public.expense_entries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  payee_name text not null default '',
  category text not null default '',
  amount numeric not null,
  currency text not null default 'USD',
  entry_date date not null,
  description text not null default '',
  payment_method text not null default ''
);

create table if not exists public.admin_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.admin_messages(id) on delete cascade,
  category text not null default 'general',
  subject text not null,
  body text not null,
  from_super_admin boolean not null default false,
  is_read boolean not null default false,
  resolved boolean not null default false,
  thread_id uuid,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'property_name', ''),
    'user',
    'pending'
  );
  insert into public.user_plans (user_id, plan, property_limit, hide_branding)
  values (new.id, 'free', 1, false);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_plans enable row level security;
alter table public.properties enable row level security;
alter table public.site_settings enable row level security;
alter table public.gallery_media enable row level security;
alter table public.amenities enable row level security;
alter table public.house_rules enable row level security;
alter table public.social_links enable row level security;
alter table public.reservations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.income_entries enable row level security;
alter table public.expense_entries enable row level security;
alter table public.admin_messages enable row level security;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'super_admin'
  );
$$;

create policy "public read properties" on public.properties for select using (true);
create policy "owners write properties" on public.properties for all using (user_id = auth.uid() or public.is_super_admin());

create policy "public read settings" on public.site_settings for select using (true);
create policy "owners write settings" on public.site_settings for all using (
  exists (select 1 from public.properties p where p.id = property_id and (p.user_id = auth.uid() or public.is_super_admin()))
);

create policy "public read gallery" on public.gallery_media for select using (true);
create policy "owners write gallery" on public.gallery_media for all using (
  exists (select 1 from public.properties p where p.id = property_id and p.user_id = auth.uid())
);

create policy "public read amenities" on public.amenities for select using (true);
create policy "owners write amenities" on public.amenities for all using (
  exists (select 1 from public.properties p where p.id = property_id and p.user_id = auth.uid())
);

create policy "public read rules" on public.house_rules for select using (true);
create policy "owners write rules" on public.house_rules for all using (
  exists (select 1 from public.properties p where p.id = property_id and p.user_id = auth.uid())
);

create policy "public read social" on public.social_links for select using (true);
create policy "owners write social" on public.social_links for all using (
  exists (select 1 from public.properties p where p.id = property_id and p.user_id = auth.uid())
);

create policy "public read reservations by token" on public.reservations for select using (true);
create policy "owners write reservations" on public.reservations for all using (
  exists (select 1 from public.properties p where p.id = property_id and p.user_id = auth.uid())
);

create policy "anyone insert chat" on public.chat_messages for insert with check (true);
create policy "owners read chat" on public.chat_messages for select using (
  exists (select 1 from public.properties p where p.id = property_id and p.user_id = auth.uid())
);
create policy "owners update chat" on public.chat_messages for update using (
  exists (select 1 from public.properties p where p.id = property_id and p.user_id = auth.uid())
);

create policy "owners income" on public.income_entries for all using (
  exists (select 1 from public.properties p where p.id = property_id and p.user_id = auth.uid())
);
create policy "owners expenses" on public.expense_entries for all using (
  exists (select 1 from public.properties p where p.id = property_id and p.user_id = auth.uid())
);

create policy "own profile" on public.profiles for select using (id = auth.uid() or public.is_super_admin());
create policy "super update profiles" on public.profiles for update using (public.is_super_admin());

create policy "own plan" on public.user_plans for select using (user_id = auth.uid() or public.is_super_admin());
create policy "super write plans" on public.user_plans for all using (public.is_super_admin());

create policy "own admin messages" on public.admin_messages for select using (user_id = auth.uid() or public.is_super_admin());
create policy "users insert admin messages" on public.admin_messages for insert with check (user_id = auth.uid() or public.is_super_admin());
create policy "super update admin messages" on public.admin_messages for update using (public.is_super_admin() or user_id = auth.uid());
