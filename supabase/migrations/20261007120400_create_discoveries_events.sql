-- Create discoveries table
create table if not exists public.discoveries (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  discovery_type text not null check (discovery_type in ('flower', 'bee', 'honey', 'phenomenon', 'place')),
  discovery_key text not null,
  name text not null,
  description text not null default '',
  h3_cell text,
  discovered_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique(player_id, discovery_type, discovery_key)
);

-- Create global_events table
create table if not exists public.global_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  region_key text,
  name text not null,
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Create game_ticks table
create table if not exists public.game_ticks (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  metadata jsonb not null default '{}'::jsonb
);

-- Enable RLS
alter table public.discoveries enable row level security;
alter table public.global_events enable row level security;
alter table public.game_ticks enable row level security;

-- Discoveries policies
create policy "Discoveries are viewable by everyone"
  on public.discoveries for select
  using (true);

create policy "Users can insert own discoveries"
  on public.discoveries for insert
  with check (auth.uid() = player_id);

create policy "Users can update own discoveries"
  on public.discoveries for update
  using (auth.uid() = player_id);

-- Global events: public read, server-only write
create policy "Global events are viewable by everyone"
  on public.global_events for select
  using (true);

create policy "Only service role can modify global events"
  on public.global_events for all
  using (false)
  with check (false);

-- Game ticks: public read, server-only write
create policy "Game ticks are viewable by everyone"
  on public.game_ticks for select
  using (true);

create policy "Only service role can modify game ticks"
  on public.game_ticks for all
  using (false)
  with check (false);

-- Indexes
create index if not exists idx_discoveries_player on public.discoveries(player_id);
create index if not exists idx_discoveries_type on public.discoveries(discovery_type);
create index if not exists idx_global_events_active on public.global_events(starts_at, ends_at);
create index if not exists idx_game_ticks_status on public.game_ticks(status);
