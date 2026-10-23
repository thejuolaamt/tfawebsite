-- TFA member system, update 8: welcome email log and member numbers.
-- Run this ONCE in Supabase SQL Editor.

-- 1. Who has been welcomed, and their member number
create table public.welcome_emails (
  user_id uuid primary key references auth.users (id) on delete cascade,
  member_number integer not null unique,
  email_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.welcome_emails enable row level security;
revoke all on public.welcome_emails from anon, authenticated;
grant all on public.welcome_emails to service_role;

-- 2. Hands out the next member number safely (one at a time)
create function public.claim_welcome_number(p_user uuid)
returns table (num integer, already_sent boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_num integer;
  v_sent timestamptz;
begin
  perform pg_advisory_xact_lock(8675309);

  select w.member_number, w.sent_at
    into v_num, v_sent
    from public.welcome_emails w
   where w.user_id = p_user;

  if found then
    return query select v_num, v_sent is not null;
    return;
  end if;

  select coalesce(max(w.member_number), 0) + 1
    into v_num
    from public.welcome_emails w;

  insert into public.welcome_emails (user_id, member_number)
  values (p_user, v_num);

  return query select v_num, false;
end;
$$;

revoke execute on function public.claim_welcome_number(uuid) from public, anon, authenticated;
grant execute on function public.claim_welcome_number(uuid) to service_role;

-- 3. Judah is member number 1
do $$
begin
  insert into public.welcome_emails (user_id, member_number)
  select id, 1 from auth.users
   where lower(email) = 'olayinkajudah252@gmail.com'
  on conflict do nothing;

  if not found then
    raise exception 'No account found for olayinkajudah252@gmail.com, or it is already numbered.';
  end if;
end;
$$;
