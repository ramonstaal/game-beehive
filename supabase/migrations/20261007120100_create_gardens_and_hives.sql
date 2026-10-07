-- Create gardens table
create table if not exists public.gardens (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  h3_cell text not null,
  name text not null default 'My Garden',
  lat numeric not null,
  lng numeric not null,
  bloom_score numeric not null default 0,
  flower_count integer not null default 0,
  bee_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create hives table
create table if not exists public.hives (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null unique references public.gardens(id) on delete cascade,
  level integer not null default 1,
  population integer not null default 50,
  honey numeric not null default 0,
  nectar numeric not null default 0,
  pollen numeric not null default 0,
  max_flower_slots integer not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.gardens enable row level security;
alter table public.hives enable row level security;

-- Garden policies
create policy "Gardens are viewable by everyone"
  on public.gardens for select
  using (true);

create policy "Users can insert own garden"
  on public.gardens for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own garden"
  on public.gardens for update
  using (auth.uid() = owner_id);

create policy "Users can delete own garden"
  on public.gardens for delete
  using (auth.uid() = owner_id);

-- Hive policies
create policy "Hives are viewable by everyone"
  on public.hives for select
  using (true);

create policy "Users can insert own hive"
  on public.hives for insert
  with check (
    auth.uid() = (select owner_id from public.gardens where id = hives.garden_id)
  );

create policy "Users can update own hive"
  on public.hives for update
  using (
    auth.uid() = (select owner_id from public.gardens where id = hives.garden_id)
  );

-- Index on h3_cell for spatial queries
create index if not exists idx_gardens_h3_cell on public.gardens(h3_cell);
create index if not exists idx_gardens_owner on public.gardens(owner_id);
create index if not exists idx_hives_garden on public.hives(garden_id);
