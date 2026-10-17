-- Thread resolution for Super Admin ↔ host support conversations.

alter table public.admin_messages
  add column if not exists resolved boolean not null default false;
