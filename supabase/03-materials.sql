-- TFA materials sharing: table, access rules, pickup functions, photo storage.
-- Run ONCE in Supabase SQL Editor (after schema.sql and 02-member-details.sql).

-- 1. TABLE -----------------------------------------------------------------

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 80),
  description text check (char_length(description) <= 500),
  category text not null
    check (category in ('paint', 'brushes', 'canvas', 'paper', 'drawing', 'tools', 'other')),
  item_condition text not null
    check (item_condition in ('new', 'like_new', 'used')),
  location text not null check (char_length(location) between 2 and 100),
  delivery_available boolean not null default false,
  image_url text,
  status text not null default 'pending'
    check (status in ('pending', 'available', 'reserved', 'collected', 'rejected')),
  collected_by uuid references public.profiles (id) on delete set null,
  reserved_at timestamptz,
  collected_at timestamptz,
  created_at timestamptz not null default now()
);

create index materials_status_idx on public.materials (status, created_at desc);
create index materials_donor_idx on public.materials (donor_id);
create index materials_collector_idx on public.materials (collected_by);

-- A member can only have ONE item waiting for pickup at a time
create unique index materials_one_active_collection
  on public.materials (collected_by) where status = 'reserved';

-- 2. ACCESS RULES ----------------------------------------------------------

alter table public.materials enable row level security;

-- Donors can post (always as "pending") and remove their own unclaimed items.
-- Status changes only happen through the functions in section 3.
grant select, delete on public.materials to authenticated;
grant insert (donor_id, title, description, category, item_condition, location, delivery_available, image_url)
  on public.materials to authenticated;

-- Counts the signed-in member's donations still waiting for approval (max 5 at once)
create function public.pending_donation_count()
returns int
language sql
security definer
set search_path = ''
stable
as $$
  select count(*)::int from public.materials
  where donor_id = (select auth.uid()) and status = 'pending';
$$;

revoke execute on function public.pending_donation_count() from public, anon;
grant execute on function public.pending_donation_count() to authenticated;

create policy "Members see live listings and their own"
  on public.materials for select
  to authenticated
  using (
    status in ('available', 'reserved')
    or donor_id = (select auth.uid())
    or collected_by = (select auth.uid())
    or public.is_admin()
  );

create policy "Add your own donation"
  on public.materials for insert
  to authenticated
  with check (
    donor_id = (select auth.uid())
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and onboarded
    )
    and public.pending_donation_count() < 5
  );

create policy "Remove your own unclaimed donation"
  on public.materials for delete
  to authenticated
  using (
    donor_id = (select auth.uid())
    and status in ('pending', 'available', 'rejected')
  );

create policy "Admins remove any donation"
  on public.materials for delete
  to authenticated
  using (public.is_admin());

-- 3. FUNCTIONS (the only way a donation changes status) ---------------------

-- A member clicks "Collect"
create function public.collect_material(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_rows int;
begin
  if v_uid is null then
    raise exception 'Please log in first.';
  end if;

  if not exists (select 1 from public.profiles where id = v_uid and onboarded) then
    raise exception 'Please finish setting up your profile first.';
  end if;

  -- Free items nobody picked up within 7 days
  update public.materials
  set status = 'available', collected_by = null, reserved_at = null
  where status = 'reserved' and reserved_at < now() - interval '7 days';

  if exists (
    select 1 from public.materials
    where collected_by = v_uid and status = 'reserved'
  ) then
    raise exception 'You already have an item waiting for pickup. Mark it received or cancel it first.';
  end if;

  update public.materials
  set status = 'reserved', collected_by = v_uid, reserved_at = now()
  where id = p_id and status = 'available' and donor_id <> v_uid;

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    raise exception 'Sorry, this item is no longer available.';
  end if;
end;
$$;

-- Either side confirms the item has been handed over
create function public.complete_handover(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_rows int;
begin
  update public.materials
  set status = 'collected', collected_at = now()
  where id = p_id
    and status = 'reserved'
    and (collected_by = v_uid or donor_id = v_uid);

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    raise exception 'This item cannot be marked as received.';
  end if;
end;
$$;

-- Either side cancels, and the item goes back on the list
create function public.release_material(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_rows int;
begin
  update public.materials
  set status = 'available', collected_by = null, reserved_at = null
  where id = p_id
    and status = 'reserved'
    and (collected_by = v_uid or donor_id = v_uid);

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    raise exception 'This item cannot be released.';
  end if;
end;
$$;

-- TFA admins approve or reject new donations
create function public.review_material(p_id uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only TFA admins can review donations.';
  end if;

  update public.materials
  set status = case when p_approve then 'available' else 'rejected' end
  where id = p_id and status = 'pending';
end;
$$;

-- The donor and the collector see each other's contact, only after "Collect"
create function public.material_contact(p_id uuid)
returns table (relation text, full_name text, phone text, instagram text, email text)
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_uid uuid := (select auth.uid());
  m public.materials;
begin
  select * into m from public.materials where id = p_id;

  if not found or m.status not in ('reserved', 'collected') or m.collected_by is null then
    return;
  end if;

  if v_uid = m.collected_by then
    return query
      select 'donor'::text, p.full_name, mp.phone, p.instagram, u.email::text
      from public.profiles p
      join public.member_private mp on mp.id = p.id
      join auth.users u on u.id = p.id
      where p.id = m.donor_id;
  elsif v_uid = m.donor_id then
    return query
      select 'collector'::text, p.full_name, mp.phone, p.instagram, u.email::text
      from public.profiles p
      join public.member_private mp on mp.id = p.id
      join auth.users u on u.id = p.id
      where p.id = m.collected_by;
  end if;
end;
$$;

revoke execute on function public.collect_material(uuid) from public, anon;
revoke execute on function public.complete_handover(uuid) from public, anon;
revoke execute on function public.release_material(uuid) from public, anon;
revoke execute on function public.review_material(uuid, boolean) from public, anon;
revoke execute on function public.material_contact(uuid) from public, anon;

grant execute on function public.collect_material(uuid) to authenticated;
grant execute on function public.complete_handover(uuid) to authenticated;
grant execute on function public.release_material(uuid) to authenticated;
grant execute on function public.review_material(uuid, boolean) to authenticated;
grant execute on function public.material_contact(uuid) to authenticated;

-- 4. GIVING WALL (top donors, names and counts only) -------------------------

create view public.top_givers as
select
  p.id,
  p.full_name,
  p.avatar_url,
  count(*)::int as items_given
from public.materials m
join public.profiles p on p.id = m.donor_id
where m.status = 'collected' and p.onboarded
group by p.id, p.full_name, p.avatar_url
order by items_given desc, p.full_name
limit 8;

revoke all on public.top_givers from public, anon;
grant select on public.top_givers to authenticated;

-- 5. PHOTO STORAGE ---------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('materials', 'materials', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Upload material photos to your own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'materials'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Delete material photos from your own folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'materials'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
