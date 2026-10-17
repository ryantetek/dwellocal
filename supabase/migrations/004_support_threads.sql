-- Each support inquiry is its own conversation thread.
-- Existing messages for a host stay in one thread.

alter table public.admin_messages
  add column if not exists thread_id uuid;

update public.admin_messages m
set thread_id = sub.tid
from (
  select user_id, gen_random_uuid() as tid
  from public.admin_messages
  where thread_id is null
  group by user_id
) sub
where m.user_id = sub.user_id
  and m.thread_id is null;
