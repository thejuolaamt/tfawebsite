-- TFA member system, update 2: more member details.
-- Run this ONCE in Supabase SQL Editor (after schema.sql).

-- 1. New public profile details -------------------------------------------

alter table public.profiles
  add column country text,
  add column state text,
  add column disciplines text[] not null default '{}',
  add column member_type text,
  add column instagram text;

alter table public.profiles
  add constraint profiles_member_type_check
    check (member_type in ('student', 'hobbyist', 'emerging', 'professional', 'educator', 'enthusiast')),
  add constraint profiles_bio_length_check
    check (char_length(bio) <= 280),
  add constraint profiles_instagram_length_check
    check (char_length(instagram) <= 60);

-- 2. New private details (only the member and TFA admins) ------------------

alter table public.member_private
  add column phone text,
  add column city text,
  add column goals text[] not null default '{}',
  add column heard_from text;

-- 3. Let members edit their own new details --------------------------------

grant update (country, state, disciplines, member_type, instagram)
  on public.profiles to authenticated;

grant update (phone, city, goals, heard_from)
  on public.member_private to authenticated;

-- 4. Updated signup trigger: copies the new details safely ---------------
-- Bad or missing values are ignored, so they can never block a signup.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_birth date;
  v_type text;
  v_disciplines text[];
  v_goals text[];
begin
  begin
    v_birth := nullif(meta ->> 'birth_date', '')::date;
  exception when others then
    v_birth := null;
  end;

  v_type := case
    when meta ->> 'member_type' in ('student', 'hobbyist', 'emerging', 'professional', 'educator', 'enthusiast')
      then meta ->> 'member_type'
    else null
  end;

  v_disciplines := coalesce(
    array(
      select left(x, 40)
      from jsonb_array_elements_text(
        case when jsonb_typeof(meta -> 'disciplines') = 'array'
             then meta -> 'disciplines' else '[]'::jsonb end
      ) as x
      limit 12
    ),
    '{}'
  );

  v_goals := coalesce(
    array(
      select left(x, 40)
      from jsonb_array_elements_text(
        case when jsonb_typeof(meta -> 'goals') = 'array'
             then meta -> 'goals' else '[]'::jsonb end
      ) as x
      limit 12
    ),
    '{}'
  );

  insert into public.profiles (id, full_name, country, state, disciplines, member_type, instagram)
  values (
    new.id,
    left(nullif(meta ->> 'full_name', ''), 120),
    left(nullif(meta ->> 'country', ''), 80),
    left(nullif(meta ->> 'state', ''), 80),
    v_disciplines,
    v_type,
    left(nullif(meta ->> 'instagram', ''), 60)
  );

  insert into public.member_private (id, birth_date, consent_at, phone, city, goals, heard_from)
  values (
    new.id,
    v_birth,
    case when meta ->> 'consent' = 'true' then now() end,
    left(nullif(meta ->> 'phone', ''), 30),
    left(nullif(meta ->> 'city', ''), 80),
    v_goals,
    left(nullif(meta ->> 'heard_from', ''), 60)
  );

  return new;
end;
$$;
