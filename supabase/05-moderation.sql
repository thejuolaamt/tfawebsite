-- TFA member system, update 5: moderation.
-- Run this ONCE in Supabase SQL Editor (after 04-privacy.sql).

-- TFA admins can remove any artwork (members can still remove only their own)
create policy "Admins delete any artwork"
  on public.artworks for delete
  to authenticated
  using (public.is_admin());

-- ...and the image file that goes with it
create policy "Admins delete any photo"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('avatars', 'artworks')
    and public.is_admin()
  );
