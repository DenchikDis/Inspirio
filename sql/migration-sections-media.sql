-- ============================================
-- MIGRATION: Sections + Media for project pages
-- ============================================
-- Run in Supabase Dashboard → SQL Editor
-- ============================================
-- This migration adds:
-- - sections (group/page inside a project)
-- - media (image/video inside a section)
-- - permissive RLS policies (to match current client-side admin workflow)
-- - data migration: sites.screenshots/videos -> a default "General" section
-- ============================================

-- 0) Extensions (for gen_random_uuid)
create extension if not exists "pgcrypto";

-- 1) Tables
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.sites(id) on delete cascade,
  title text not null,
  "order" integer not null default 0,
  cover_media_id uuid null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists idx_sections_project_order
  on public.sections(project_id, "order");

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  type text not null check (type in ('image', 'video')),
  url text not null,
  thumbnail_url text null,
  "order" integer not null default 0,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_media_section_order
  on public.media(section_id, "order");

-- 2) updated_at trigger for sections
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_sections_updated_at on public.sections;
create trigger update_sections_updated_at
before update on public.sections
for each row execute function public.update_updated_at_column();

-- 3) RLS
alter table public.sections enable row level security;
alter table public.media enable row level security;

-- Read policies
drop policy if exists "Anyone can read sections" on public.sections;
create policy "Anyone can read sections" on public.sections
  for select using (true);

drop policy if exists "Anyone can read media" on public.media;
create policy "Anyone can read media" on public.media
  for select using (true);

-- Write policies (permissive; matches current admin.html approach)
drop policy if exists "Anyone can insert sections" on public.sections;
create policy "Anyone can insert sections" on public.sections
  for insert with check (true);

drop policy if exists "Anyone can update sections" on public.sections;
create policy "Anyone can update sections" on public.sections
  for update using (true) with check (true);

drop policy if exists "Anyone can delete sections" on public.sections;
create policy "Anyone can delete sections" on public.sections
  for delete using (true);

drop policy if exists "Anyone can insert media" on public.media;
create policy "Anyone can insert media" on public.media
  for insert with check (true);

drop policy if exists "Anyone can update media" on public.media;
create policy "Anyone can update media" on public.media
  for update using (true) with check (true);

drop policy if exists "Anyone can delete media" on public.media;
create policy "Anyone can delete media" on public.media
  for delete using (true);

-- 4) Data migration: sites.screenshots/videos -> default "General" section
-- Notes:
-- - Creates a "General" section for every site (if missing).
-- - Converts screenshots[] to media(type=image)
-- - Converts first videos[] entry (if any) to media(type=video)
-- - Sets sections.cover_media_id: first image else first video.

do $$
declare
  s record;
  general_section_id uuid;
  hero_media_id uuid;
  screenshot_url text;
  screenshot_idx integer;
  video_url text;
  created_media_id uuid;
begin
  for s in
    select id, screenshots, videos
    from public.sites
  loop
    -- Ensure General section exists
    select sec.id into general_section_id
    from public.sections sec
    where sec.project_id = s.id and lower(sec.title) = 'general'
    order by sec."order" asc
    limit 1;

    if general_section_id is null then
      insert into public.sections (project_id, title, "order")
      values (s.id, 'General', 0)
      returning id into general_section_id;
    end if;

    hero_media_id := null;

    -- screenshots -> media images
    if s.screenshots is not null then
      screenshot_idx := 0;
      for screenshot_url in
        select value::text from jsonb_array_elements_text(to_jsonb(s.screenshots)) as value
      loop
        -- Insert only if not already present
        if not exists (
          select 1 from public.media m
          where m.section_id = general_section_id and m.url = screenshot_url
        ) then
          insert into public.media (section_id, type, url, "order")
          values (general_section_id, 'image', screenshot_url, screenshot_idx)
          returning id into created_media_id;
        else
          select m.id into created_media_id
          from public.media m
          where m.section_id = general_section_id and m.url = screenshot_url
          limit 1;
        end if;

        if hero_media_id is null then
          hero_media_id := created_media_id;
        end if;

        screenshot_idx := screenshot_idx + 1;
      end loop;
    end if;

    -- videos -> media video (first only)
    video_url := null;
    if s.videos is not null then
      select value::text into video_url
      from jsonb_array_elements_text(to_jsonb(s.videos)) as value
      limit 1;
    end if;

    if video_url is not null then
      if not exists (
        select 1 from public.media m
        where m.section_id = general_section_id and m.url = video_url
      ) then
        insert into public.media (section_id, type, url, thumbnail_url, "order")
        values (
          general_section_id,
          'video',
          video_url,
          case
            when s.screenshots is not null and array_length(s.screenshots, 1) >= 1 then s.screenshots[1]
            else null
          end,
          0
        )
        returning id into created_media_id;
      else
        select m.id into created_media_id
        from public.media m
        where m.section_id = general_section_id and m.url = video_url
        limit 1;
      end if;

      if hero_media_id is null then
        hero_media_id := created_media_id;
      end if;
    end if;

    -- Set cover if not set
    update public.sections
    set cover_media_id = coalesce(cover_media_id, hero_media_id)
    where id = general_section_id;
  end loop;
end $$;

-- 5) Backfill FK for cover_media_id (optional)
-- Not enforced here because cover_media_id points to media.id and is optional.
-- If you want strict FK:
-- alter table public.sections add constraint fk_sections_cover_media
--   foreign key (cover_media_id) references public.media(id) on delete set null;

