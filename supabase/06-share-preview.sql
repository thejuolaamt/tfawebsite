-- TFA materials sharing, update 6: safe preview for shared links.
-- Run this ONCE in Supabase SQL Editor (after 05-moderation.sql).
--
-- When a member shares a donation, apps like WhatsApp visit the link to build
-- a preview card. Those visits are not logged in, and the materials table is
-- hidden from visitors. This function gives out ONLY what the card needs:
-- title, category, condition, "can deliver", and the photo (while it is free).
-- It never gives out the donor, the pickup place, or any contact detail.

create or replace function public.material_preview(p_id uuid)
returns table (
  title text,
  category text,
  item_condition text,
  delivery_available boolean,
  image_url text,
  status text
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    m.title,
    m.category,
    m.item_condition,
    m.delivery_available,
    case when m.status = 'available' then m.image_url end,
    m.status
  from public.materials m
  where m.id = p_id
    and m.status in ('available', 'reserved');
$$;

revoke execute on function public.material_preview(uuid) from public;
grant execute on function public.material_preview(uuid) to anon, authenticated;