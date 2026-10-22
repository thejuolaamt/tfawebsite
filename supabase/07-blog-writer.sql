-- TFA blog writer, update 7: a safe place for blog cover photos.
-- Run this ONCE in Supabase SQL Editor (after 06-share-preview.sql).
--
-- Only TFA admins can add, replace or delete blog cover photos.
-- Anyone with the link can see a cover photo (like the other photo buckets).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog', 'blog', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Admins add blog photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog' and public.is_admin());

create policy "Admins replace blog photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog' and public.is_admin());

create policy "Admins delete blog photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog' and public.is_admin());