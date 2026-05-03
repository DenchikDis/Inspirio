-- ============================================
-- MIGRATION: media.bytes for storage sizing
-- ============================================
-- Run in Supabase Dashboard → SQL Editor
-- ============================================
-- Adds optional `bytes` column to public.media
-- Used by admin panel to show per-project total size.
-- ============================================

alter table if exists public.media
  add column if not exists bytes bigint;

create index if not exists idx_media_section_bytes
  on public.media(section_id, bytes);

