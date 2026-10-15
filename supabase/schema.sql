-- TFA member system: tables, access rules, signup trigger, photo storage.
-- Run this ONCE in Supabase SQL Editor.

-- 1. TABLES ---------------------------------------------------------------

-- Public member profile (safe to show on the website)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  bio text,
  avatar_url text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

-- Private member data (only the member and TFA admins can see this)
create table public.member_private (
  id uuid primary key references public.profiles (id) on delete cascade,
  birth_date date,
  consent_at timestamptz
);

-- Artwork portfolio
create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  image_url text not null,
  title text,
  caption text,
  created_at timestamptz not null default now()
);
create index artworks_user_id_idx on public.artworks (user_id, created_at desc);

-- Community blog
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  cover_url text,
  body text not null default '',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- TFA admins (you). Nobody can read or edit this from the website.
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- 2. LOCK EVERYTHING (row level security) -------------------------------

alter table public.profiles       enable row level security;
alter table public.member_private enable row level security;
alter table public.artworks       enable row level security;
alter table public.posts          enable row level security;
alter table public.admins         enable row level security;

-- 3. ADMIN CHECK ----------------------------------------------------------

create function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 4. PERMISSIONS (what each kind of visitor may touch) ------------------

grant usage on schema public to anon, authenticated;

-- profiles: anyone can read onboarded profiles; members edit only their own
grant select on public.profiles to anon, authenticated;
grant update (full_name, bio, avatar_url, onboarded) on public.profiles to authenticated;

create policy "Read onboarded profiles and your own"
  on public.profiles for select
  to anon, authenticated
  using (onboarded or id = (select auth.uid()));

create policy "Edit your own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- member_private: a member sees and edits only their own birthday
grant select on public.member_private to authenticated;
grant update (birth_date) on public.member_private to authenticated;

create policy "Read your own private data"
  on public.member_private for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Edit your own private data"
  on public.member_private for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- artworks: portfolios are public; members manage only their own
grant select on public.artworks to anon, authenticated;
grant insert (user_id, image_url, title, caption) on public.artworks to authenticated;
grant update (title, caption) on public.artworks to authenticated;
grant delete on public.artworks to authenticated;

create policy "Anyone can view artworks"
  on public.artworks for select
  to anon, authenticated
  using (true);

create policy "Add artwork to your own portfolio"
  on public.artworks for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Edit your own artwork"
  on public.artworks for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Delete your own artwork"
  on public.artworks for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- posts: signed-in members read published posts; only admins write
grant select, insert, update, delete on public.posts to authenticated;

create policy "Members read published posts"
  on public.posts for select
  to authenticated
  using (published or public.is_admin());

create policy "Admins add posts"
  on public.posts for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins edit posts"
  on public.posts for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete posts"
  on public.posts for delete
  to authenticated
  using (public.is_admin());

-- 5. AUTO-CREATE A PROFILE WHEN SOMEONE SIGNS UP -----------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''));

  insert into public.member_private (id, birth_date, consent_at)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    case when new.raw_user_meta_data ->> 'consent' = 'true' then now() end
  );

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. PHOTO STORAGE ---------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',  'avatars',  true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('artworks', 'artworks', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Members can only add, change or remove files inside their own folder
create policy "Upload to your own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('avatars', 'artworks')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Replace files in your own folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('avatars', 'artworks')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Delete files in your own folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('avatars', 'artworks')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
