# Supabase setup

## 1. Create table and policies

In [Supabase Dashboard](https://app.supabase.com) → SQL Editor, run the contents of `migrations/001_sites_table.sql`.

## 2. Storage bucket for media

1. Go to Storage → New bucket.
2. Name: `sites-media` (or the name used in the app).
3. Public bucket: **Yes** (so frontend can display images/videos by URL).
4. In bucket → Policies, add:
   - **SELECT**: allow public (for reading files).
   - **INSERT**: allow for your use case (e.g. anon or authenticated; for MVP you can allow anon if needed).

Or run in SQL Editor:

```sql
insert into storage.buckets (id, name, public)
values ('sites-media', 'sites-media', true)
on conflict (id) do nothing;

-- Allow public read
create policy "Public read sites-media"
  on storage.objects for select
  using (bucket_id = 'sites-media');

-- Allow insert (anon for MVP admin upload)
create policy "Public insert sites-media"
  on storage.objects for insert
  with check (bucket_id = 'sites-media');
```

## 3. Environment variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` — Project URL from Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon public key.
- Optionally `SUPABASE_SERVICE_ROLE_KEY` for server-only admin actions.
