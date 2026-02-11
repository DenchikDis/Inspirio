-- Sites table for Inspire Board
create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text,
  technologies text[] default '{}',
  fonts text[] default '{}',
  framework text,
  screenshots text[] default '{}',
  videos text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: allow public read, restrict write (admin via service role or auth later)
alter table public.sites enable row level security;

create policy "Allow public read access on sites"
  on public.sites for select
  using (true);

create policy "Allow insert for authenticated or anon (MVP: open insert for dev)"
  on public.sites for insert
  with check (true);

create policy "Allow update for all (MVP)"
  on public.sites for update
  using (true);

create policy "Allow delete for all (MVP)"
  on public.sites for delete
  using (true);

-- Optional: trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger sites_updated_at
  before update on public.sites
  for each row execute function public.set_updated_at();
