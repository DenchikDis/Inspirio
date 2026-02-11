-- Create public bucket for sites media (screenshots, videos)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sites-media',
  'sites-media',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read
drop policy if exists "Public read sites-media" on storage.objects;
create policy "Public read sites-media"
  on storage.objects for select
  using (bucket_id = 'sites-media');

-- Allow insert (anon for MVP admin upload)
drop policy if exists "Public insert sites-media" on storage.objects;
create policy "Public insert sites-media"
  on storage.objects for insert
  with check (bucket_id = 'sites-media');
