# HIVE — Phase 3 Handoff: Backend Simulation

> **Session:** New
> **Date:** 2026-01-08
> **Previous session completed:** Phases 0, 1, 2
> **This session starts:** Phase 3 — Backend Simulation

---

## Current State of the Codebase

### What's Built and Working

**Frontend (Nuxt 3 + Vue 3 + TypeScript + Pinia + Tailwind):**
- ✅ Full-screen MapLibre GL JS map (OSM raster tiles, desaturated)
- ✅ Garden placement flow (click map → H3 snap → confirm → create)
- ✅ Auth modal (Supabase email/password + magic link)
- ✅ Onboarding flow (5-step wizard)
- ✅ Garden panel with stats (honey, flowers, bees)
- ✅ Bottom navigation (mobile) + side panels (desktop)
- ✅ Bottom sheets (mobile) / modal panels (desktop)
- ✅ How to Play static page (`/how-to-play`)
- ✅ Toast notifications, discovery cards, event banners
- ✅ Responsive layout (mobile <1024px, desktop ≥1024px)
- ✅ Demo mode (works without auth, uses fixture data)

**Backend (Supabase):**
- ✅ PostgreSQL tables: profiles, gardens, hives, flower_species, garden_flowers, world_cells, bee_flows, discoveries, global_events, game_ticks
- ✅ RLS policies (owner-only writes for player data)
- ✅ RPCs: create_garden, plant_flower, harvest_honey
- ✅ Realtime subscriptions for gardens, world_cells, bee_flows, global_events

**DevOps:**
- ✅ GitHub Pages deployment (static build, `ssr: false`)
- ✅ GitHub Actions workflow

### What Does NOT Exist Yet (Phase 3 Work)

| Feature | Status | Notes |
|---------|--------|-------|
| **World tick** | ❌ Missing | No scheduled simulation |
| **Flower attraction** | ❌ Missing | No scoring algorithm |
| **Weather system** | ❌ Static | `world.currentWeather` is always 'sunny' |
| **Bee movement** | ❌ Demo only | Bee flows are fixture data, not computed |
| **Lazy simulation** | ❌ Missing | Dormant cells don't simulate on access |
| **Discovery system** | ❌ Missing | DiscoveryCard exists but no real logic |
| **Events** | ❌ Missing | EventBanner exists but no event engine |
| **Honey production** | ❌ Missing | No tick-based nectar→honey conversion |
| **Flower lifecycle** | ❌ Missing | Flowers stay in one state forever |
| **Pollination corridors** | ❌ Missing | No community-level visual features |

---

## Key Files to Read First

| File | Purpose |
|------|---------|
| `pages/index.vue` | Root page, state routing, map placement watcher |
| `composables/useHiveMap.ts` | MapLibre wrapper, markers, bee flows, click handling |
| `stores/player.ts` | Auth state, sign in/up, demo mode |
| `stores/garden.ts` | Garden data, createGarden, plantFlower, collectHoney |
| `stores/world.ts` | World state, fetchGardens, realtime, bee animation |
| `stores/ui.ts` | UI state, sheets, toasts, onboarding |
| `lib/game/types.ts` | TypeScript interfaces for all game entities |
| `lib/game/fixtures-world.ts` | Demo data for gardens, bee flows, world cells, events |
| `lib/game/fixtures-species.ts` | 8 flower species definitions |
| `composables/useH3.ts` | H3 cell utilities |
| `lib/supabase/client.ts` | Supabase client initialization |
| `nuxt.config.ts` | App config, runtime env vars |

---

## Supabase Schema Reference

### Existing Tables (already migrated)

**profiles** — User profiles linked to auth.users
```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_seed text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**gardens** — Player gardens (H3 cell + cell center lat/lng only)
```sql
create table public.gardens (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  h3_cell text not null,
  lat float not null,
  lng float not null,
  name text not null default 'My Garden',
  bloom_score numeric not null default 0,
  flower_count integer not null default 0,
  bee_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**hives** — Player hives (one per garden)
```sql
create table public.hives (
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
```

**flower_species** — Static catalogue of 8 species
```sql
create table public.flower_species (
  id text primary key,
  name text not null,
  rarity text not null,
  nectar_rate numeric not null,
  pollen_rate numeric not null,
  attraction_radius numeric not null,
  bloom_hours integer not null,
  visual_key text not null,
  metadata jsonb not null default '{}'::jsonb
);
```

**garden_flowers** — Flowers planted in gardens
```sql
create table public.garden_flowers (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens(id) on delete cascade,
  species_id text not null references public.flower_species(id),
  slot_index integer not null,
  planted_at timestamptz not null default now(),
  bloom_started_at timestamptz,
  bloom_ends_at timestamptz,
  state text not null default 'seed',
  created_at timestamptz not null default now()
);
```

**world_cells** — Aggregate simulation state per H3 cell
```sql
create table public.world_cells (
  h3_cell text primary key,
  resolution integer not null,
  lat float not null,
  lng float not null,
  bee_population integer not null default 0,
  nectar numeric not null default 0,
  pollen numeric not null default 0,
  bloom_score numeric not null default 0,
  activity_score numeric not null default 0,
  weather text not null default 'sunny',
  last_simulated_at timestamptz,
  updated_at timestamptz not null default now()
);
```

**bee_flows** — Recent aggregate bee movement (cleaned aggressively)
```sql
create table public.bee_flows (
  id bigint generated always as identity primary key,
  tick_id bigint not null,
  from_cell text not null,
  to_cell text not null,
  bee_count integer not null,
  bee_type text not null,
  from_lat float, from_lng float,
  to_lat float, to_lng float,
  created_at timestamptz not null default now()
);
```

**discoveries** — Player discoveries (unique per player+type+key)
```sql
create table public.discoveries (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  discovery_type text not null,
  discovery_key text not null,
  h3_cell text,
  discovered_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique(player_id, discovery_type, discovery_key)
);
```

**global_events** — Scheduled events
```sql
create table public.global_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  name text not null,
  description text not null,
  region_key text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

**game_ticks** — Tick history
```sql
create table public.game_ticks (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running',
  metadata jsonb not null default '{}'::jsonb
);
```

### Existing RPCs

- `create_garden(p_h3_cell, p_name, p_lat, p_lng)` — Creates garden + hive
- `plant_flower(p_garden_id, p_species_id, p_slot_index)` — Plants flower
- `harvest_honey(p_garden_id, p_amount)` — Collects honey

### Existing RLS Policies

- `profiles`: Owner can read/update own
- `gardens`: Anyone reads, owner writes
- `hives`: Owner reads/writes
- `garden_flowers`: Owner reads/writes
- `world_cells`: Read-only (server writes via service role)
- `bee_flows`: Read-only
- `discoveries`: Owner reads/writes
- `global_events`: Read-only


---

## Phase 3 Implementation Plan

### Step 1: World Tick Edge Function

Create `supabase/functions/world-tick/index.ts`:

```
Triggered every 60 seconds by pg_cron:
1. Find all "active" world cells (cells with player gardens or recent activity)
2. For each active cell:
   a. Load flowers in cell
   b. Calculate attraction score
   c. Determine weather multiplier
   d. Move aggregate bee population
   e. Consume nectar/pollen
   f. Produce hive resources
   g. Update cell state
3. Record tick in game_ticks
4. Broadcast changes to Realtime
```

**Key decisions:**
- Tick interval: 60 seconds
- Active cell: cells containing player gardens OR adjacent to player gardens
- Don't simulate dormant cells — use lazy simulation on access

### Step 2: Flower Attraction Algorithm

Pure function in `lib/game/simulation.ts`:

```typescript
interface AttractionInput {
  flowerSpecies: FlowerSpecies[]
  weather: WeatherState
  timeOfDay: 'day' | 'night' | 'dawn' | 'dusk'
  beePreference: string[]
  distance: number
}

function calculateAttraction(input: AttractionInput): number {
  // Base: sum of (nectar_rate * bloom_status)
  // Weather: sunny=1.0, cloudy=0.8, rain=0.6, windy=0.7, night=0.3
  // Time: day=1.0, night=0.2, dawn=0.8, dusk=0.9
  // Distance decay: attraction / (1 + distance * 0.1)
  // Diversity bonus: +10% per unique species beyond 1
}
```

### Step 3: Weather System

Simulated weather in `lib/game/weather.ts`:
- Simple state machine per H3 region (e.g., res 4 parent)
- Changes slowly (every 6-12 ticks)
- Affects: bee activity, nectar production, flower attraction
- Persisted in `world_cells.weather`

### Step 4: Bee Movement Rules

In `lib/game/bees.ts`:
1. Calculate current bee population per cell
2. Find neighbors (H3 gridDisk, k=1)
3. Score each neighbor by attraction
4. Move 10-30% of bees to highest-scoring neighbor
5. Consume nectar/pollen at destination
6. Deliver resource to hives at destination
7. Record bee_flow for visualization

### Step 5: Lazy Simulation

When player views a region:
1. Check `last_simulated_at` for each cell
2. If stale (> 5 min), calculate elapsed ticks
3. Apply deterministic approximation over elapsed time
4. Update cell, return fresh data

### Step 6: Honey Production

In world tick, for each active hive:
1. Calculate nectar inflow from bees
2. Convert nectar to honey (10 nectar → 1 honey)
3. Cap at storage limit
4. Update hive.honey

### Step 7: Flower Lifecycle

In world tick, for each garden_flower:
1. seed + 1h → sprout
2. sprout + 4h → growing
3. growing + 12h → blooming
4. blooming + bloom_ends_at < now → fading
5. fading + 24h → remove

### Step 8: Discovery System

In `lib/game/discovery.ts`:
- First flower of species → "New Flower Discovered"
- First bee type visits → "New Bee Discovered"
- First visit to new region → "New Place Discovered"
- Rare weather + flower combo → "Phenomenon Discovered"

### Step 9: Event System

In `lib/game/events.ts`:
- Great Bloom: weekend event, +50% nectar, 2x rare bee chance
- EventBanner reads from world store


---

## Environment Variables

**Local dev:**
```bash
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
NUXT_PUBLIC_MAPTILER_KEY=your-maptiler-key
NUXT_PUBLIC_DEV_MODE=false
```

**Edge Functions (Supabase dashboard):**
```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Testing

**Unit tests to write:**
- `lib/game/simulation.ts` — attraction scoring
- `lib/game/bees.ts` — movement rules
- `lib/game/weather.ts` — weather state machine
- `lib/game/discovery.ts` — discovery conditions

**Integration tests:**
- Edge Function world-tick — verify world_cells update
- RPC plant_flower — verify ownership checks
- Realtime — verify map updates arrive

**E2E (Playwright):**
- After tick, honey increases in UI
- After tick, bee flows appear on map
- Weather changes affect UI
- Discovery card appears on new discovery

---

## Architecture Rules

1. **No individual bees in DB** — Only aggregate populations and flows
2. **No exact player locations** — Only H3 cell centers
3. **Server-side writes only** — Clients never write simulation state
4. **Pure functions for game rules** — No Supabase dependency
5. **Realtime for events** — Not for polling state
6. **Lazy simulation** — Don't compute what nobody is looking at

---

## Files to Create

```
lib/game/simulation.ts      # Attraction, production, movement scoring
lib/game/weather.ts         # Weather state machine
lib/game/bees.ts            # Bee movement rules
lib/game/discovery.ts       # Discovery conditions and triggers
lib/game/events.ts          # Event definitions and scheduling
lib/game/honey.ts           # Honey production logic
lib/game/lifecycle.ts       # Flower lifecycle transitions

supabase/functions/world-tick/index.ts    # Main tick Edge Function
supabase/functions/_shared/cors.ts        # CORS headers
supabase/migrations/XXXX_add_world_tick.sql  # pg_cron schedule
```

---

## Quick Start Commands

```bash
# 1. Start Supabase locally
supabase start

# 2. Link to remote project
supabase link --project-ref your-project-ref

# 3. Create migration for world tick
supabase migration new add_world_tick

# 4. Deploy Edge Function
supabase functions deploy world-tick

# 5. Set up pg_cron (in Supabase SQL editor)
select cron.schedule(
  'world-tick',
  '* * * * *',
  $$select net.http_post(url := 'https://your-project.supabase.co/functions/v1/world-tick', headers := '{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}')$$
);

# 6. Run dev server
npm run dev
```

---

## Definition of Done for Phase 3

- [ ] World tick runs every 60 seconds via pg_cron + Edge Function
- [ ] Active cells simulated; dormant cells use lazy simulation
- [ ] Flower attraction calculated (species, weather, time)
- [ ] Bee populations move between cells by attraction
- [ ] Nectar consumed; honey produced
- [ ] Flower lifecycle progresses
- [ ] Weather changes per region and affects gameplay
- [ ] Bee flows appear on map as animated lines
- [ ] Discovery system triggers on first encounters
- [ ] Great Bloom event activates periodically
- [ ] No individual bee records in database
- [ ] No exact player coordinates exposed
- [ ] RLS prevents client simulation writes
- [ ] Unit tests for all game rule functions
- [ ] E2E test verifies tick → UI update flow

---

*End of Phase 3 handoff. Good luck! 🐝*

