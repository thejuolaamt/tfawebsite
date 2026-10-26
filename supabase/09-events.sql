-- TFA events, update 9: upcoming events with flyers.
-- Run this ONCE in Supabase SQL Editor (after 08-welcome-email.sql).
--
-- Anyone can see published events and their flyers.
-- Only TFA admins can add, change or delete events and flyers.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  event_date date not null,
  event_time text check (char_length(event_time) <= 60),
  details text check (char_length(details) <= 500),
  flyer_url text not null,
  register_url text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Anyone sees published events"
  on public.events for select
  to anon, authenticated
  using (published = true);

create policy "Admins see all events"
  on public.events for select
  to authenticated
  using (public.is_admin());

create policy "Admins add events"
  on public.events for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins change events"
  on public.events for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete events"
  on public.events for delete
  to authenticated
  using (public.is_admin());

grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;

-- A safe place for event flyers (anyone with the link can see a flyer).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('events', 'events', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Admins add event flyers"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'events' and public.is_admin());

create policy "Admins replace event flyers"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'events' and public.is_admin());

create policy "Admins delete event flyers"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'events' and public.is_admin());
