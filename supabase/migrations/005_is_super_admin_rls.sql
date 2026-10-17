-- Avoid RLS recursion when a signed-in user reads public.profiles.
-- Without SECURITY DEFINER, is_super_admin() can hang the /after-login load.

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
