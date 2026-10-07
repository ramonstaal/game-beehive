-- Create flower_species catalog
create table if not exists public.flower_species (
  id text primary key,
  name text not null,
  rarity text not null check (rarity in ('common', 'uncommon', 'rare', 'mythic')),
  nectar_rate numeric not null default 0,
  pollen_rate numeric not null default 0,
  attraction_radius numeric not null default 500,
  bloom_hours integer not null default 24,
  visual_key text not null default '🌱',
  preferred_weather text[] not null default '{}',
  preferred_times text[] not null default '{}',
  description text not null default ''
);

-- Create garden_flowers table
create table if not exists public.garden_flowers (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens(id) on delete cascade,
  species_id text not null references public.flower_species(id),
  slot_index integer not null,
  planted_at timestamptz not null default now(),
  bloom_started_at timestamptz,
  bloom_ends_at timestamptz,
  state text not null default 'seed' check (state in ('seed', 'sprout', 'growing', 'pre-bloom', 'blooming', 'fading', 'seed-producing')),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.flower_species enable row level security;
alter table public.garden_flowers enable row level security;

-- flower_species is public read-only
create policy "Flower species are viewable by everyone"
  on public.flower_species for select
  using (true);

-- garden_flowers policies
create policy "Garden flowers are viewable by everyone"
  on public.garden_flowers for select
  using (true);

create policy "Users can insert flowers in own garden"
  on public.garden_flowers for insert
  with check (
    auth.uid() = (select owner_id from public.gardens where id = garden_flowers.garden_id)
  );

create policy "Users can update own garden flowers"
  on public.garden_flowers for update
  using (
    auth.uid() = (select owner_id from public.gardens where id = garden_flowers.garden_id)
  );

create policy "Users can delete own garden flowers"
  on public.garden_flowers for delete
  using (
    auth.uid() = (select owner_id from public.gardens where id = garden_flowers.garden_id)
  );

-- Indexes
create index if not exists idx_garden_flowers_garden on public.garden_flowers(garden_id);
create index if not exists idx_garden_flowers_species on public.garden_flowers(species_id);
