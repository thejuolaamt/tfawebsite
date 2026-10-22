-- TFA member system, update 4: privacy tightening.
-- Run this ONCE in Supabase SQL Editor (after 03-materials.sql).

-- 1. Artworks: only logged-in members can see them -------------------------

drop policy if exists "Anyone can view artworks" on public.artworks;

create policy "Members can view artworks"
  on public.artworks for select
  to authenticated
  using (true);

revoke all on public.artworks from anon;

-- 2. Profiles: visitors can only see profile photos ------------------------
-- The homepage "newest members" strip needs just these three columns.
-- Names, bios, locations and Instagram handles are for logged-in members only.

revoke all on public.profiles from anon;
grant select (avatar_url, created_at, onboarded) on public.profiles to anon;

-- 3. Everything else: visitors get no access at all (extra safety) ---------

revoke all on public.member_private from anon;
revoke all on public.posts from anon;
revoke all on public.materials from anon;
revoke all on public.admins from anon;
