-- ============================================
-- MIGRATION: R2 / CDN metadata on public.media
-- ============================================
-- Run in Supabase Dashboard → SQL Editor
-- Adds columns only (no DROP). Keeps legacy `url` for full public URLs.
-- ============================================

alter table if exists public.media
  add column if not exists storage_source text not null default 'supabase'
    check (storage_source in ('supabase', 'r2'));

alter table if exists public.media
  add column if not exists r2_key text;

alter table if exists public.media
  add column if not exists upload_status text default 'ready'
    check (upload_status in ('uploading', 'processing', 'ready', 'failed'));

alter table if exists public.media
  add column if not exists variants jsonb not null default '{}'::jsonb;

alter table if exists public.media
  add column if not exists sha256 text;

alter table if exists public.media
  add column if not exists mime text;

create index if not exists idx_media_upload_status
  on public.media(upload_status)
  where upload_status is distinct from 'ready';

comment on column public.media.storage_source is 'supabase = legacy Storage URL in url; r2 = object in R2 (r2_key + CDN base on client)';
comment on column public.media.r2_key is 'Object key inside R2 bucket (no domain)';
comment on column public.media.upload_status is 'Pipeline state for direct-to-R2 uploads';
