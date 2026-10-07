-- Create world_cells table
create table if not exists public.world_cells (
  h3_cell text primary key,
  resolution integer not null default 9,
  lat numeric not null,
  lng numeric not null,
  bee_population integer not null default 0,
  nectar numeric not null default 0,
  pollen numeric not null default 0,
  bloom_score numeric not null default 0,
  activity_score numeric not null default 0,
  weather text not null default 'sunny' check (weather in ('sunny', 'cloudy', 'rain', 'windy', 'night')),
  updated_at timestamptz not null default now()
);

-- Create bee_flows table
create table if not exists public.bee_flows (
  id bigint generated always as identity primary key,
  tick_id bigint not null,
  from_cell text not null,
  to_cell text not null,
  bee_count integer not null default 0,
  bee_type text not null default 'worker' check (bee_type in ('worker', 'scout', 'night', 'rain', 'golden')),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.world_cells enable row level security;
alter table public.bee_flows enable row level security;

-- World cells: public read, server-only write
create policy "World cells are viewable by everyone"
  on public.world_cells for select
  using (true);

create policy "Only service role can modify world cells"
  on public.world_cells for all
  using (false)
  with check (false);

-- Bee flows: public read, server-only write
create policy "Bee flows are viewable by everyone"
  on public.bee_flows for select
  using (true);

create policy "Only service role can modify bee flows"
  on public.bee_flows for all
  using (false)
  with check (false);

-- Indexes
create index if not exists idx_world_cells_resolution on public.world_cells(resolution);
create index if not exists idx_world_cells_updated on public.world_cells(updated_at);
create index if not exists idx_bee_flows_tick on public.bee_flows(tick_id);
create index if not exists idx_bee_flows_created on public.bee_flows(created_at);
