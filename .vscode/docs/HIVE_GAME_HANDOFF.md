# HIVE — Game Design & Engineering Handoff

**Working title:** HIVE  
**Tagline:** *Grow something worth visiting.*  
**Platform:** Browser / mobile web / desktop web  
**Frontend:** Nuxt 4 + Vue 3 + TypeScript  
**Hosting:** GitHub Pages  
**Backend:** Supabase  
**Map renderer:** MapLibre GL JS  
**Base map / tiles:** MapTiler using OpenStreetMap-derived map data  
**Spatial game grid:** H3  
**Database:** PostgreSQL + PostGIS  
**Realtime:** Supabase Realtime  
**Scheduled simulation:** Supabase Edge Functions + pg_cron  

---

# 0. START HERE — INSTRUCTIONS FOR CURSOR

Build HIVE as a polished, joyful, map-first multiplayer browser game.

The central product principle is:

> **The player does not collect the world. The player creates the conditions that make the world come alive.**

The game is a shared ecological simulation layered on top of the real world. Players create small gardens. Flowers produce nectar and pollen. Bees move through the shared world between gardens and natural/virtual flower resources. Other players indirectly benefit from your garden, and your hive benefits from theirs.

The game must feel alive even when the player is not doing anything. The world should continuously change through time, weather, bloom cycles, bee movement, discoveries, and community activity.

## Non-negotiable product constraints

1. **Map first.** The map is the game board, not a background image.
2. **Joyful, warm, tactile UI.** Avoid sterile dashboards and generic SaaS aesthetics.
3. **Simple core loop.** Plant → attract → watch → harvest → discover → improve.
4. **Shared world.** Other players' activity must visibly matter.
5. **Real geography matters.** Parks, water, urban areas, distance and regional conditions influence the simulation.
6. **No combat, no PvP, no gambling, no energy system.** This is a calm social/ecological game.
7. **No exact public player locations.** Player gardens are represented by coarse H3 cells. Never expose a player's raw coordinates or home address.
8. **Do not put secrets in the frontend.** GitHub Pages is public static hosting. Supabase secret/service keys must remain server-side in Edge Functions only.
9. **Do not store or simulate millions of individual bees.** Simulate aggregate bee populations and render a small number of convincing visual bee agents.
10. **Do not overbuild V1.** The first playable slice must be fun before introducing breeding, trading, guilds, complex quests or monetization.
11. **Do not invent backend infrastructure that conflicts with GitHub Pages.** Nuxt on GitHub Pages is static; all live state and privileged operations belong in Supabase.
12. **Keep the map and simulation architecture replaceable.** MapLibre is the renderer, MapTiler is the initial tile provider, H3 is the game-space index.

## Coding philosophy for Cursor

- TypeScript everywhere.
- Prefer small composables and domain modules over giant Vue components.
- Keep game rules in pure functions where possible.
- Keep MapLibre imperative code isolated from Vue reactivity.
- Keep Supabase calls behind typed repository/service modules.
- Never perform gameplay writes directly from random components.
- Prefer Postgres RPCs/functions for atomic gameplay mutations.
- Use Realtime for events, not as a replacement for querying state.
- Distinguish **authoritative state** from **visual state**.
- Design every animation so it can be disabled/reduced for accessibility and performance.
- No polling every few seconds from the browser when Realtime or cached state can be used.

---

# 1. PRODUCT VISION

## 1.1 One-sentence pitch

**HIVE is a living world game where you plant flowers on a real-world map, attract travelling bees, grow your hive, and help build a shared global ecosystem with other players.**

## 1.2 The emotional promise

The player should feel:

- curious: “What is happening nearby?”
- delighted: “A bee found my garden!”
- connected: “Someone else helped my ecosystem.”
- proud: “I created a useful garden.”
- exploratory: “What species can I discover here?”
- relaxed: “The world keeps growing without demanding my attention.”

The game should **never feel like work disguised as a game**.

## 1.3 Core fantasy

A tiny action can have a surprisingly large consequence.

The player plants one flower.

A bee notices it.

The bee travels to another garden.

That garden produces a new flower.

A different bee species appears.

Players collectively create a pollination corridor.

The map quietly becomes more alive because people played.

That chain reaction is the product.

---

# 2. DESIGN PILLARS

## Pillar A — A living map

At every zoom level, the world should communicate that something is happening.

World view:
- ecological regions
- migration flows
- major bloom events
- community activity

Country/region view:
- flower density
- garden clusters
- bee routes
- event areas

Local view:
- gardens
- flowers
- hive activity
- moving bee trails

The player should be able to zoom from Earth to neighbourhood scale and keep finding new information.

## Pillar B — Indirect multiplayer

Players mostly influence one another without direct competition.

Examples:
- My lavender attracts your bees.
- Your sunflower keeps my bees fed.
- My garden bridges a gap between two pollination regions.
- Your rare flower causes new species to visit nearby gardens.

This creates cooperation without forcing social pressure.

## Pillar C — Discovery beats grind

The game should reward noticing and experimenting.

Prefer:
> “I discovered something.”

over:
> “I filled another progress bar.”

## Pillar D — Time creates magic

The world changes while the player is away.

When they return, there should be something worth looking at:
- new blooms
- arriving bees
- completed honey production
- discovered species
- changed nearby activity
- a message that their garden helped another ecosystem

## Pillar E — Softness

Visuals, sound, copy and motion should all feel friendly.

The player should feel like they are tending a small corner of a giant living planet.

---

# 3. CORE GAME LOOP

## Primary loop

```text
EXPLORE MAP
    ↓
PLACE / IMPROVE GARDEN
    ↓
PLANT FLOWERS
    ↓
BEES DISCOVER FLOWERS
    ↓
BEES TRAVEL THROUGH THE WORLD
    ↓
NECTAR + POLLEN RETURN TO HIVES
    ↓
HONEY / SEEDS / DISCOVERIES
    ↓
UPGRADE OR CHANGE GARDEN
    ↓
NEW FLOWERS / SPECIES / ROUTES
    ↓
EXPLORE AGAIN
```

## The “holy shit” moment

The first major moment should happen within the first few minutes:

1. Player plants a flower.
2. UI says: **“Something is visiting.”**
3. A bee appears.
4. The bee flies from another garden or ecological cell to the player's garden.
5. Player taps/clicks it.
6. Camera subtly follows the bee.
7. A compact card appears:

> **A traveller arrived**  
> This bee came from 2.4 km away.

8. The player can follow the path on the map.

The player has just learned that their garden is part of a shared world without reading a tutorial about it.

---

# 4. GAME WORLD MODEL

## 4.1 Real world + virtual ecology

The real-world map supplies geography.

The game adds a virtual ecological layer.

### Real layer
- countries
- cities
- roads
- parks
- water
- coastlines
- terrain where available
- land use / green areas where supported

### Game layer
- H3 cells
- gardens
- flowers
- hives
- bee populations
- bee routes
- ecological resources
- rare species
- events
- community influence

The real map determines **where things can plausibly happen**.

The virtual layer determines **what is happening now**.

---

# 5. MAP EXPERIENCE

## 5.1 Technology

Use:

- MapLibre GL JS for browser map rendering.
- MapTiler for initial vector tile/style infrastructure.
- OpenStreetMap-derived data for familiar real-world geography.
- H3 for game simulation cells.
- PostGIS for geographic queries and imported spatial data.

MapLibre is a TypeScript/WebGL vector-map renderer and supports globe/map projections and custom layers. H3 provides hierarchical hexagonal spatial indexing and browser JavaScript bindings. Supabase provides PostGIS support for spatial querying.

## 5.2 Map visual style

Do not simply use a standard MapTiler/OSM style unchanged.

Create a custom HIVE visual style:

### Base map
- warm off-white land
- muted blue water
- roads visible but subdued
- city labels soft and rounded
- minimal POI clutter
- parks noticeably greener
- no high-contrast navigation-map styling

### Game overlay
- flowers = soft illustrated dots/petals
- gardens = small house/flower badge
- hives = glowing amber nucleus
- bee routes = animated curved trails
- rare activity = gentle pulsing halo
- high activity cells = subtly brighter organic texture

The map should resemble an illustrated naturalist's map rather than Google Maps.

## 5.3 Zoom levels

### Zoom 0–3: Earth

Show:
- global bloom regions
- major ecological corridors
- global event indicators
- broad bee migration arcs

Hide individual player gardens.

### Zoom 4–7: region/country

Show:
- garden clusters
- regional honey activity
- pollination corridors
- event zones

### Zoom 8–11: city

Show:
- individual public gardens
- flowers
- bee flows
- nearby hives

### Zoom 12+: local

Show:
- garden plots
- detailed flower groups
- local bee traffic
- hive visualisation

## 5.4 Map interaction rules

- Double click / pinch zoom.
- Drag to pan.
- Click a garden to inspect.
- Click a moving bee to follow it.
- Click a flower cluster to inspect.
- Long press on mobile opens map interaction menu.
- Never block basic map navigation with modal UI.
- Panels should slide above or beside the map.

---

# 6. PRIVACY-BY-DESIGN LOCATION MODEL

This is a multiplayer real-world game. Location privacy must be part of the architecture, not a later feature.

## Never store as player location

- exact home coordinates exposed to client
- full address
- private property address
- continuous GPS history

## Store

- selected H3 cell
- optional broader region/country
- optional “garden name” chosen by player

## Recommended garden placement UX

Do not automatically publish the exact GPS location.

Instead:

```text
[ Use my approximate area ]

or

[ Pick a place on the map ]
```

Snap the player to a coarse H3 cell.

The public garden marker is placed at the visual centre of the selected H3 cell, with a tiny deterministic jitter so multiple players do not perfectly overlap.

The player can later move the garden within allowed game rules without exposing an address.

---

# 7. PLAYER PROFILE

Keep the profile lightweight.

## Visible

- username
- avatar / bee icon
- garden name
- days active
- discovered species count
- flowers planted
- pollination contribution
- favourite flower

## Hidden from public by default

- email
- precise location
- authentication identifiers
- login history

## Profile tone

Avoid competitive stats such as “you are better than 92% of players” in V1.

Prefer:

> **Your garden has helped 318 visiting bees this week.**

That communicates impact rather than status anxiety.

---

# 8. THE GARDEN

Each player has one main garden in V1.

## Garden structure

```text
┌───────────────────────────────┐
│         🌼 GARDEN             │
│                               │
│   🌻    🌷   🌺               │
│       🐝  🐝                  │
│  🌿            🌸             │
│                               │
│        🏠 HIVE                │
│                               │
└───────────────────────────────┘
```

## Garden stats

- bloom score
- nectar production
- pollen production
- species diversity
- bee attractiveness
- resilience
- honey storage

Do not expose raw numerical complexity immediately.

The first UI should say:

> **Bloom: Lush**

rather than:

> Bloom score: 82.37

Numbers can appear in an advanced details view later.

---

# 9. FLOWERS

Flowers are the player's primary strategic tool.

## V1 flower set

Start with 8 fictionalized or generic species with distinct behaviour rather than trying to perfectly simulate real botany.

Suggested V1:

| Flower | Trait | Gameplay role |
|---|---|---|
| Clover | reliable | beginner / resilience |
| Lavender | fragrant | strong bee attraction |
| Sunflower | abundant | high nectar |
| Wild Daisy | common | diversity bonus |
| Poppy | seasonal | burst production |
| Mint Bloom | cooling | weather synergy |
| Moonflower | nocturnal | night bees |
| Golden Aster | rare | discovery / high value |

The game can later map some species to real botanical species if desired, but fun and clarity are more important than scientific simulation in V1.

## Flower properties

```ts
interface FlowerSpecies {
  id: string
  name: string
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic'
  bloomDurationHours: number
  nectarRate: number
  pollenRate: number
  attractionRadius: number
  preferredWeather: string[]
  preferredTimes: ('day' | 'night' | 'dawn' | 'dusk')[]
  preferredBeeTags: string[]
  visualVariant: string
}
```

## Flower life cycle

```text
seed
 ↓
sprout
 ↓
growing
 ↓
pre-bloom
 ↓
blooming
 ↓
fading
 ↓
seed-producing
```

The player should occasionally see flowers visually change state.

---

# 10. BEES

Important architectural decision:

**Do not model every bee as a persistent database row.**

Model bee populations and movement flows.

## Bee behaviour

Each active region/cell maintains aggregate values:

- number of bees
- available nectar
- available pollen
- preferred flowers
- movement pressure
- activity multiplier

The simulation decides where populations flow.

The client turns these aggregate flows into beautiful visual motion.

## V1 bee archetypes

### Worker
Balanced.

### Scout
Travels farther.

### Night Bee
Active at night.

### Rain Bee
More active during rain.

### Golden Bee
Rare; used primarily for discovery.

Do not turn these into combat/RPG classes.

---

# 11. BEE MOVEMENT MODEL

A tick represents the authoritative simulation.

Recommended V1 tick interval: 60 seconds.

The browser visually interpolates the result so movement feels continuous.

## Tick concept

For each active H3 cell:

1. determine flower signal
2. determine weather multiplier
3. determine available nectar/pollen
4. determine local bee demand
5. choose neighbouring destination cells
6. move an aggregate population
7. consume resources
8. deliver some resource to connected hives
9. generate potential discovery events
10. persist the resulting authoritative state

## Simplified movement score

```ts
score =
  flowerAttraction
  * beePreferenceMatch
  * weatherMultiplier
  * distanceMultiplier
  * diversityBonus
  * controlledRandomness
```

Use weighted probabilities rather than deterministic shortest-path movement.

The world should feel organic.

## Neighbour selection

Start with immediate H3 neighbours plus a small probability of a longer jump for scout bees.

Do not run expensive global pathfinding.

---

# 12. HONEY

Honey is the basic progression resource.

Nectar enters the hive.

The hive converts nectar into honey over time.

Honey can be used for:

- upgrading hive chambers
- unlocking flower slots
- crafting cosmetic decorations later
- attracting special events later

Avoid an elaborate economy in V1.

Honey should feel like a gentle reward, not an obligation.

---

# 13. HIVE PROGRESSION

The hive is the player's home/base.

## V1 progression

### Stage 1 — Tiny Hive

- 3 flower slots
- small bee population
- basic flowers

### Stage 2 — Garden Hive

- 5 flower slots
- larger bee activity
- uncommon flowers

### Stage 3 — Meadow Hive

- 7 flower slots
- stronger regional influence
- rare discovery chance

### Stage 4 — Pollinator Hive

- 10 flower slots
- long-range interactions
- special event participation

Keep the progression visually obvious.

The hive should physically grow and become more detailed.

---

# 14. DISCOVERY SYSTEM

Discovery is the game's long-term collection layer.

## Field Journal tabs

```text
FIELD JOURNAL

🌼 Flowers      12 / 60
🐝 Bees          4 / 20
🍯 Honey         5 / 15
🌦 Phenomena     2 / 12
🌍 Places        7 / 100
```

## Discovery categories

### Species

First time seeing a flower/bee type.

### Places

First time visiting a region or notable ecological cell.

### Phenomena

Special combinations of weather/time/ecology.

### Lineages

Later feature.

## Discovery UX

Discovery should never scream.

Use:

```text
                 ✨
          NEW DISCOVERY

          Moonflower Bee

      First recorded in Utrecht

             [Add to Journal]
```

Then a tiny celebratory animation.

---

# 15. SECRET COMBINATIONS

This is a future depth layer.

Certain flower/environment combinations create hidden effects.

Examples:

```text
Lavender + Clover + Rain
→ Rain Meadow
```

```text
Moonflower + Jasmine + Night
→ Lunar Bloom
```

Do not document all combinations in the UI.

Let players discover some naturally.

The community may eventually build external wikis and guides organically.

---

# 16. COMMUNITY ECOLOGY

The real multiplayer magic should happen at the ecosystem level.

## Pollination corridors

When gardens and high-value flower cells form a connected chain, create a visible corridor.

Example:

```text
🌼 ─ 🐝 ─ 🌼 ─ 🐝 ─ 🌼 ─ 🐝 ─ 🌼

     POLLINATION CORRIDOR
             17 km
```

## Community milestones

Examples:

> **The Netherlands is blooming.**  
> 2,500 gardens contributed this week.

> **A new pollination bridge has formed.**  
> Rotterdam ↔ Utrecht.

These should celebrate collective activity, not rank individuals.

---

# 17. EVENTS

Events make the world feel occasionally surprising.

## V1 event

### The Great Bloom

A 24-hour or 48-hour window where a region gains unusual flowering activity.

Effects:
- rare bees become more likely
- honey output increases
- map becomes visually richer
- community discovery opportunities rise

## Future events

- Golden Migration
- Night Bloom
- First Frost
- Rain Week
- Wild Meadow
- Pollination Festival

Events should be content-driven and configurable from Supabase, not hardcoded into components.

---

# 18. WEATHER

Weather should initially be simplified.

V1 state machine:

```text
SUNNY
CLOUDY
RAIN
WINDY
NIGHT
```

Later, connect to real weather APIs if desired.

Real weather should be treated as an enhancement, not a dependency for core gameplay.

For V1, use regional simulated weather so development and testing remain deterministic.

---

# 19. UI / UX STRUCTURE

## 19.1 Global layout — desktop

```text
┌─────────────────────────────────────────────────────────────────────┐
│ HIVE       🌤 21°     🌼 124     🍯 842     🔔      👤             │
├──────────────┬───────────────────────────────────────┬─────────────┤
│              │                                       │             │
│  YOUR HIVE   │                                       │  ACTIVITY   │
│              │                                       │             │
│  🏠 3        │               WORLD MAP               │  🐝 Arrived │
│              │                                       │  🌸 Bloom   │
│  🌼 Garden   │                                       │  ✨ Found   │
│  🍯 Honey    │                                       │             │
│              │                                       │             │
│  Journal     │                                       │             │
│  Discoveries │                                       │             │
│              │                                       │             │
└──────────────┴───────────────────────────────────────┴─────────────┘
```

The map must occupy the majority of the screen.

## 19.2 Mobile

Do not simply shrink desktop.

Use:

```text
┌──────────────────────┐
│ 🍯 842      🌼 124    │
├──────────────────────┤
│                      │
│                      │
│       WORLD MAP      │
│                      │
│     🐝  🐝           │
│        🌸             │
│                      │
│                      │
│                      │
├──────────────────────┤
│ 🏡     🌱     📖     👤 │
└──────────────────────┘
```

Panels should appear as bottom sheets.

---

# 20. NAVIGATION

Keep the primary navigation to 4 sections:

1. **World** — map / exploration
2. **Garden** — player's garden and hive
3. **Journal** — discoveries
4. **Profile** — identity / settings

Do not add a store, shop, battle pass, missions, social feed or leaderboard in V1.

---

# 21. FIRST-TIME USER EXPERIENCE

## Screen 1 — Welcome

Visual: a full-screen animated globe with small bees moving between glowing points.

Copy:

> **Welcome to HIVE.**  
> A tiny garden can change an entire world.

CTA:

> **Start your garden**

Secondary:

> Explore first

## Screen 2 — Choose garden

Show map.

Copy:

> **Where would you like your garden to bloom?**

Options:

- use approximate area
- choose on map

Never expose exact coordinate text.

## Screen 3 — Plant

Give player one flower seed.

Animation: seed drops into soil.

Copy:

> **Plant something.**

## Screen 4 — First visitor

A short delay / simulated event.

Bee appears.

Copy:

> **A visitor found you.**

Then explain naturally:

> Bees travel between gardens. Yours is now part of the network.

## Screen 5 — First reward

Honey appears.

Copy:

> **Your hive made its first honey.**

Done.

The user is now playing.

---

# 22. TONE OF VOICE

HIVE should speak like a friendly field guide.

Good:

> A little visitor stopped by.

> Something rare is blooming nearby.

> Your lavender is attracting a lot of attention.

> Your garden helped connect two flowering areas.

Bad:

> YOU MUST HARVEST NOW!

> 5 MINUTES LEFT!

> CLAIM YOUR REWARD!

> DON'T MISS OUT!

No manipulative urgency.

---

# 23. MICROINTERACTIONS

The game should feel tactile.

## Buttons

- slight lift on hover
- 100–160ms press response
- soft spring-back

## Flowers

- tiny sway
- subtle bloom expansion
- occasional particle/pollen effect

## Bees

- curved flight path
- slight body bob
- wings represented by fast but subtle movement
- randomised timing
- no robotic linear interpolation

## Honey

When collected:
- small amber droplet
- gentle pop
- count increments smoothly

## Discoveries

- radial glow
- small floating particles
- card slides in
- celebratory sound
- automatically closes unless player pins it

---

# 24. MOTION DESIGN

Motion should tell the player what changed.

Use 3 levels:

### Ambient
Always-on but very subtle.

- grass/flowers sway
- bees move slowly
- map effects breathe

### Feedback
Triggered by player input.

- button press
- flower placement
- harvest

### Celebration
Rare and more visible.

- new species
- major bloom
- corridor completed

Never make the whole screen move unnecessarily.

---

# 25. COLOR SYSTEM

Use a small palette.

## Core colors

- **Honey:** `#F6C344`
- **Leaf:** `#67A85B`
- **Deep Leaf:** `#376847`
- **Sky:** `#A9D9EA`
- **Cream:** `#FFF9ED`
- **Ink:** `#25352D`
- **Coral accent:** `#F28C72`
- **Lavender:** `#B7A6DD`

These are starting tokens, not sacred values. The implementation should centralise them in CSS variables/design tokens.

## Color principles

- background should be warm rather than pure white
- avoid neon gamer colors
- avoid dark-mode-first design
- use amber/yellow for rewards and activity
- use green for living/growth
- use coral sparingly for attention

---

# 26. TYPOGRAPHY

Use a rounded, highly legible sans-serif.

Suggested pairing:

- headings: a friendly rounded display face such as Fredoka
- body/UI: a clean sans-serif such as Inter or DM Sans

Do not use more than two font families.

Hierarchy:

- display: 36–56px desktop
- page heading: 24–32px
- card heading: 18–22px
- body: 14–16px
- microcopy: 12–13px

Use generous whitespace.

---

# 27. SOUND DESIGN

Sound is optional but strongly recommended after the core loop works.

## Ambient

- extremely quiet meadow ambience
- occasional breeze
- distant birds

## Interaction sounds

- flower placement: soft soil / plop
- bee arrival: tiny warm buzz
- honey: rounded chime
- discovery: three-note ascending motif
- event: soft environmental swell

Never use harsh notifications as the main audio language.

Include a mute control and respect browser autoplay restrictions.

---

# 28. ACCESSIBILITY

Must support:

- keyboard navigation
- visible focus states
- reduced motion
- readable contrast
- text alternatives for meaningful map objects
- no game information conveyed by color alone

Add:

```ts
prefers-reduced-motion
```

handling.

When reduced motion is on:
- replace continuous bee animation with occasional position updates
- remove pulsing halos
- keep state changes readable through text and icon changes

---

# 29. RESPONSIVE UX

## Desktop

Map + persistent side panels.

## Tablet

Map + collapsible side panel.

## Mobile

Full-screen map + bottom navigation + bottom sheets.

The primary action should always be reachable with one thumb.

---

# 30. STATE MODEL — FRONTEND

Use a small number of focused stores/composables.

Suggested Pinia stores:

```text
usePlayerStore
useGardenStore
useWorldStore
useJournalStore
useUiStore
```

Do not create a store for every component.

## `usePlayerStore`

- authenticated user
- profile
- preferences

## `useGardenStore`

- current garden
- hive
- flowers
- local resources

## `useWorldStore`

- visible H3 cells
- active garden summaries
- bee flow events
- current region weather

## `useJournalStore`

- discovered species
- discovery progress
- recent discoveries

## `useUiStore`

- selected map object
- open sheet
- map mode
- modal state
- reduced motion preference

---

# 31. DATA ARCHITECTURE

## Principle

Separate:

### Authoritative state
Stored in Supabase.

### Derived state
Calculated from authoritative state.

### Visual state
Only exists in the browser for animation.

Example:

```text
DATABASE
bee_flow: 183 bees A → B

        ↓

WORLD STORE
current visible flow

        ↓

MAP VISUAL
12 bee sprites animated along a curved path
```

The 12 sprites are not 12 database bees.

---

# 32. SUPABASE DATABASE SCHEMA

This is a starting schema, not a final migration.

## `profiles`

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_seed text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## `gardens`

```sql
create table public.gardens (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  h3_cell text not null,
  name text not null default 'My Garden',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Important: do not store exact public GPS coordinates for the garden.

## `hives`

```sql
create table public.hives (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null unique references public.gardens(id) on delete cascade,
  level integer not null default 1,
  population integer not null default 50,
  honey numeric not null default 0,
  nectar numeric not null default 0,
  pollen numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## `flower_species`

Static catalogue data.

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

## `garden_flowers`

```sql
create table public.garden_flowers (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens(id) on delete cascade,
  species_id text not null references public.flower_species(id),
  slot_index integer not null,
  planted_at timestamptz not null default now(),
  bloom_started_at timestamptz,
  bloom_ends_at timestamptz,
  state text not null default 'growing',
  created_at timestamptz not null default now()
);
```

## `world_cells`

Aggregate simulation state.

```sql
create table public.world_cells (
  h3_cell text primary key,
  resolution integer not null,
  bee_population integer not null default 0,
  nectar numeric not null default 0,
  pollen numeric not null default 0,
  bloom_score numeric not null default 0,
  activity_score numeric not null default 0,
  weather text not null default 'sunny',
  updated_at timestamptz not null default now()
);
```

## `bee_flows`

Short-lived or recent aggregate movement state.

```sql
create table public.bee_flows (
  id bigint generated always as identity primary key,
  tick_id bigint not null,
  from_cell text not null,
  to_cell text not null,
  bee_count integer not null,
  bee_type text not null,
  created_at timestamptz not null default now()
);
```

This table should be aggressively retained/cleaned. The long-term source of truth is not a history of every bee movement.

## `discoveries`

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

## `global_events`

```sql
create table public.global_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  region_key text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

## `game_ticks`

```sql
create table public.game_ticks (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running',
  metadata jsonb not null default '{}'::jsonb
);
```

---

# 33. RLS / SECURITY RULES

Turn on Row Level Security for all public tables exposed through the Data API.

## Rules

### Public-readable

- flower_species
- selected aggregate world data
- public garden summaries
- active global events
- selected discovery metadata

### Owner-readable/writable

- own profile
- own garden metadata
- own flowers
- own hive
- own discoveries

### Server-only / privileged writes

- world_cells
- bee_flows
- global_events where appropriate
- simulation state

Gameplay mutations should generally happen through RPCs or Edge Functions so clients cannot simply write arbitrary resource values.

## Absolutely forbidden

Do not put Supabase `secret` or legacy `service_role` keys into:

- `.env` files shipped to client builds
- `runtimeConfig.public`
- GitHub Pages build output
- browser source code
- localStorage

Only the publishable/anon-style public client key belongs in the frontend, protected by RLS.

---

# 34. REALTIME ARCHITECTURE

Use two kinds of realtime communication.

## A. Persistent state → database-backed updates

Use for:

- garden changes
- flower placement
- hive updates
- discoveries
- global events

## B. Ephemeral movement → Broadcast

Use for:

- bee flow animations
- short-lived world activity
- nearby event cues

Supabase currently recommends Realtime Broadcast for scalable/security-conscious messaging, while Postgres Changes is simpler but less scalable. Use that distinction deliberately.

Suggested channels:

```text
world:global
world:region:<region-key>
garden:<garden-id>
```

Do not subscribe every client to every database row.

A player viewing Amsterdam should not receive every bee movement on Earth.

---

# 35. WORLD SIMULATION

## Scheduled job

Use Supabase pg_cron to trigger a Supabase Edge Function every 60 seconds in V1.

The Edge Function runs the world tick.

## Tick algorithm

Pseudo-flow:

```text
START TICK
  ↓
load active world cells
  ↓
load active flowers/gardens for those cells
  ↓
calculate environmental state
  ↓
calculate attraction scores
  ↓
move aggregate bee populations
  ↓
consume nectar/pollen
  ↓
produce hive resources
  ↓
resolve rare-event conditions
  ↓
persist changed world cells
  ↓
persist relevant garden/hive changes
  ↓
broadcast nearby movement summaries
  ↓
END TICK
```

## Important scaling rule

Do not update every cell on Earth every minute.

Use activity tiers.

### Tier 1 — active

Cells containing active player gardens or important events.

Tick frequently.

### Tier 2 — warm

Cells near active regions.

Tick less frequently or calculate lazily.

### Tier 3 — dormant

Remote/unvisited cells.

Use lazy simulation based on elapsed time when accessed.

This is critical for scaling.

---

# 36. LAZY SIMULATION

A beautiful trick for scale:

You do not need to continuously simulate a cell no one is looking at.

Instead store:

```text
last_simulated_at
```

When a player enters that region:

```text
elapsed = now - last_simulated_at
```

Apply a deterministic approximation over elapsed time.

This lets the world feel continuous without paying continuous compute cost everywhere.

---

# 37. API / DOMAIN LAYER

Create a domain layer like:

```text
app/lib/game/

flowers.ts
bees.ts
honey.ts
discovery.ts
simulation.ts
world.ts
constants.ts
```

Example:

```ts
export function calculateAttraction(input: AttractionInput): number {
  // Pure function. Easy to unit test.
}
```

Supabase-specific code should live separately:

```text
app/lib/supabase/

client.ts
repositories/
  gardens.ts
  flowers.ts
  hives.ts
  world.ts
  discoveries.ts
```

---

# 38. RECOMMENDED REPOSITORY STRUCTURE

Nuxt 4 structure:

```text
/
├── app/
│   ├── components/
│   │   ├── map/
│   │   │   ├── HiveMap.vue
│   │   │   ├── MapControls.vue
│   │   │   ├── MapLegend.vue
│   │   │   ├── BeeOverlay.vue
│   │   │   ├── GardenLayer.vue
│   │   │   └── EventLayer.vue
│   │   ├── garden/
│   │   ├── hive/
│   │   ├── journal/
│   │   ├── ui/
│   │   └── onboarding/
│   ├── composables/
│   │   ├── useHiveMap.ts
│   │   ├── useWorldRealtime.ts
│   │   ├── useGarden.ts
│   │   ├── useSimulationView.ts
│   │   ├── useReducedMotion.ts
│   │   └── useSound.ts
│   ├── pages/
│   │   ├── index.vue
│   │   ├── garden.vue
│   │   ├── journal.vue
│   │   ├── profile.vue
│   │   └── play.vue
│   ├── stores/
│   │   ├── player.ts
│   │   ├── garden.ts
│   │   ├── world.ts
│   │   ├── journal.ts
│   │   └── ui.ts
│   ├── lib/
│   │   ├── game/
│   │   ├── map/
│   │   ├── supabase/
│   │   └── h3/
│   ├── assets/
│   │   ├── css/
│   │   ├── illustrations/
│   │   └── audio/
│   └── app.vue
├── public/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   │   └── world-tick/
│   └── seed/
├── tests/
│   ├── unit/
│   └── e2e/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── nuxt.config.ts
├── package.json
└── README.md
```

---

# 39. MAP IMPLEMENTATION

Use MapLibre imperatively inside one composable/component.

Do not bind every map event directly into Pinia.

Recommended pattern:

```ts
const map = shallowRef<Map | null>(null)
```

Create map after mount.

Register layers once.

Update sources/data rather than rebuilding layers.

## Game layers

```text
base-map
parks
water
roads
labels
--- game ---
world-cell-activity
gardens
flowers
bee-routes
bee-sprites
event-zones
```

## Render strategy

### Flowers/gardens

Use GeoJSON/vector layers for many objects.

### Bee animation

For V1, render only nearby/high-value bee flows.

Target:
- max ~100–150 animated bee sprites on screen
- aggregate everything else into trails/flow lines

If later needed, introduce a WebGL/Pixi/custom MapLibre layer.

Do not start there.

---

# 40. H3 STRATEGY

Use H3 as the simulation coordinate system.

Example concepts:

```ts
const cell = latLngToCell(lat, lng, resolution)
const center = cellToLatLng(cell)
const neighbors = gridDisk(cell, 1)
```

Use a configurable resolution.

Do not hardcode the resolution throughout the application.

Create:

```ts
export const GAME_H3_RESOLUTION = 9
```

and make it configurable later.

The exact resolution should be validated against:
- player privacy
- map density
- query size
- simulation cost
- visual clarity

---

# 41. QUERY STRATEGY FOR THE MAP

When the viewport changes:

1. determine current map bounds
2. convert bounds to relevant H3 parent/child cells
3. query only the active area
4. merge results into local world state
5. unsubscribe/rescope realtime topics when the player travels far away

Do not query every garden globally.

For a city-level view, load only the relevant cells.

For world view, load aggregated region summaries.

---

# 42. GITHUB PAGES DEPLOYMENT

Nuxt currently supports GitHub Pages via its `github_pages` deployment preset. GitHub Pages is static hosting, so the Nuxt app must be built as static client assets. If the repository is hosted at `username.github.io/repository`, the app needs a matching base URL during build.

## Example environment

```text
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NUXT_PUBLIC_MAPTILER_KEY=...
NUXT_APP_BASE_URL=/hive/
```

For a custom domain, use `/` as the base URL.

## `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',

  devtools: {
    enabled: true,
  },

  ssr: false,

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabasePublishableKey: process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      maptilerKey: process.env.NUXT_PUBLIC_MAPTILER_KEY,
    },
  },
})
```

Use the GitHub Pages Nitro preset during the build rather than adding a custom server.

---

# 43. GITHUB ACTIONS WORKFLOW

Recommended starting workflow:

```yaml
name: Deploy HIVE

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Enable Corepack
        run: corepack enable

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build Nuxt
        run: npx nuxt build --preset github_pages
        env:
          NUXT_APP_BASE_URL: /hive/
          NUXT_PUBLIC_SUPABASE_URL: ${{ vars.NUXT_PUBLIC_SUPABASE_URL }}
          NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${{ vars.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY }}
          NUXT_PUBLIC_MAPTILER_KEY: ${{ vars.NUXT_PUBLIC_MAPTILER_KEY }}

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: ./.output/public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    permissions:
      pages: write
      id-token: write

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Important:

- Use GitHub **Variables** for public config values if desired.
- Never put Supabase secret/service keys in GitHub Variables that reach the frontend.
- Use Supabase dashboard secrets for Edge Functions.

---

# 44. SUPABASE EDGE FUNCTIONS

Suggested functions:

```text
supabase/functions/
├── world-tick/
├── create-garden/
├── plant-flower/
├── claim-discovery/
└── admin-seed-world/
```

Not all need to be separate functions immediately. Start with:

- `world-tick`
- gameplay RPCs/functions in Postgres

Keep privileged logic server-side.

---

# 45. SCHEDULED SIMULATION

Supabase supports pg_cron and can use it with pg_net to invoke Edge Functions on recurring schedules.

V1:

```text
Every minute
    ↓
pg_cron
    ↓
world-tick Edge Function
    ↓
update simulation
    ↓
persist changes
    ↓
Broadcast important visual events
```

Do not create a permanently running Node server for V1.

---

# 46. GAMEPLAY RPC EXAMPLES

## Plant flower

The frontend calls a single domain method:

```ts
await gardenRepository.plantFlower({
  gardenId,
  speciesId,
  slotIndex,
})
```

That repository calls a Postgres RPC such as:

```text
plant_flower(garden_id, species_id, slot_index)
```

The RPC should:

1. verify ownership
2. verify the slot
3. verify inventory
4. insert the flower
5. deduct seed
6. update relevant garden state
7. return the resulting flower

Do not let the browser perform these steps independently.

---

# 47. OFFLINE / NETWORK RESILIENCE

The game should degrade gracefully.

If Realtime disconnects:

Show:

> **The hive is reconnecting…**

But allow map exploration from cached state.

When connection returns:

- resubscribe
- refresh visible world state
- replay only relevant recent events

Never allow a temporary network disconnect to duplicate a gameplay mutation.

Use idempotent operation IDs for important mutations if needed.

---

# 48. LOADING EXPERIENCE

Do not display a spinner over a blank screen.

Use the HIVE brand immediately.

Example loading screen:

```text
       🐝
    exploring...

   finding flowers
```

Add gentle animated dots / bee movement.

The map can load behind the first-run shell.

---

# 49. ERROR UX

Errors should be human.

Bad:

> PostgrestError: duplicate key value violates unique constraint

Good:

> **That flower slot is already occupied.**

Developer details belong in logs/telemetry.

---

# 50. OBSERVABILITY

Track:

### Product events

- onboarding_started
- garden_created
- flower_planted
- bee_arrived
- honey_collected
- discovery_found
- map_region_viewed
- event_joined

### Technical

- Supabase query failure rate
- Realtime reconnects
- map load time
- world tick duration
- world tick failure rate
- number of active world cells
- number of active gardens
- client FPS / heavy render states where feasible

Do not collect unnecessary personal information.

---

# 51. GAME BALANCING PRINCIPLES

## Early game

Very generous.

Player should get:
- first flower quickly
- first bee quickly
- first honey quickly
- first discovery quickly

## Mid game

Introduce meaningful choices.

Example:

> Do I optimize for honey production or rare species discovery?

## Late game

Create ecosystem influence.

Example:

> Can I create a garden that becomes a major stop in the local network?

---

# 52. WHAT NOT TO DO

Do not turn HIVE into:

- FarmVille with bees
- a clicker game
- a generic idle game
- Pokémon with different sprites
- a spreadsheet disguised as a map
- an endless notification machine
- a leaderboard competition
- an ad-driven mobile game

Specifically avoid:

- daily streak pressure
- artificial energy limits
- “come back in 3 hours” gating
- aggressive push notifications
- loot boxes
- random monetized rewards
- exact-location public markers
- giant inventories
- dozens of currencies
- mandatory social interaction

---

# 53. V1 FEATURE SCOPE

V1 MUST contain:

- authentication
- world map
- H3-backed gardens
- one player garden
- hive
- 8 flowers
- flower planting
- aggregate bee simulation
- bee movement visualisation
- honey generation
- nearby other-player gardens
- one discovery mechanism
- field journal
- simple weather state
- one global event
- responsive mobile UI
- realtime updates
- GitHub Pages deployment
- Supabase migrations
- RLS

V1 SHOULD NOT contain:

- bee breeding
- trading
- guilds
- freeform chat
- messaging
- complex quests
- real-money economy
- advanced genetics
- real weather API
- full global ecological datasets
- 3D terrain
- AR
- native mobile app

---

# 54. BUILD PHASES

## Phase 0 — Visual spike

Goal: prove that the game looks good.

Build:
- map
- custom style
- one garden
- one flower
- one animated bee
- honey counter
- mobile layout

No auth yet.

Acceptance test:

> Someone unfamiliar with the project opens the page and immediately understands that it is a living map game.

## Phase 1 — Playable single-player

Build:
- auth
- garden persistence
- flowers
- hive
- honey
- journal

Acceptance:

> A new user can start, plant, wait, receive a bee, produce honey and see journal progress.

## Phase 2 — Shared world

Build:
- multiple gardens
- world cells
- aggregate bee flow
- realtime
- region filtering

Acceptance:

> Two browsers in different accounts can see the same garden activity and bee flows.

## Phase 3 — Simulation

Build:
- scheduled world tick
- flower attraction
- weather
- movement rules
- lazy simulation

Acceptance:

> The world changes without direct player interaction.

## Phase 4 — Discovery + events

Build:
- rare species
- discoveries
- Great Bloom
- community statistics

Acceptance:

> Players have a reason to explore the map instead of staying in their own garden.

## Phase 5 — Polish

Build:
- sound
- motion polish
- accessibility
- onboarding polish
- performance tuning
- analytics

Acceptance:

> The game feels like a finished product rather than a technical demo.

---

# 55. CURSOR IMPLEMENTATION ORDER

Cursor should work in this order:

```text
1. Install dependencies
2. Create design tokens
3. Build app shell
4. Build map wrapper
5. Build custom map style
6. Add fake garden data
7. Add fake bee animation
8. Build garden panel
9. Build onboarding
10. Add Supabase client
11. Create migrations
12. Add auth
13. Replace fake data with real garden data
14. Add RLS
15. Add realtime
16. Add world simulation
17. Add discovery
18. Add event system
19. Add performance optimisation
20. Add GitHub Pages deployment
```

Do not jump to step 17 while step 5 still looks ugly.

---

# 56. FIRST MILESTONE — “ONE BEAUTIFUL SCREEN”

Before any complicated backend work, make this screen excellent:

```text
┌─────────────────────────────────────────────────────────────────┐
│ HIVE                         🍯 34       🌼 8                   │
│                                                                 │
│                  🌍 REAL WORLD MAP                              │
│                                                                 │
│      🐝 ────────────────╮                                       │
│                         ╰──🌸                                    │
│                    🌼         🐝                                │
│              🏡                                                 │
│                                                                 │
│            A little world is growing here.                     │
│                                                                 │
│     ┌─────────────────────────────────────────────┐             │
│     │ 🌻 Your garden                              │             │
│     │ 3 flowers • 12 visiting bees                │             │
│     │                                             │             │
│     │ [ Plant a flower ]                          │             │
│     └─────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

This is the visual north star.

The game should immediately feel warm and alive.

---

# 57. FAKE DATA FOR UI DEVELOPMENT

Before Supabase is wired up, create a local fixture layer.

Example:

```ts
export const demoGardens = [
  {
    id: 'garden-1',
    h3Cell: 'demo-cell-1',
    name: 'Maya’s Meadow',
    bloomScore: 82,
    flowerCount: 7,
  },
]
```

Fake bee flows:

```ts
export const demoBeeFlows = [
  {
    from: [4.90, 52.02],
    to: [4.72, 52.01],
    beeCount: 42,
    type: 'worker',
  },
]
```

The UI must look convincing before backend integration.

---

# 58. MAP-TO-GAME VISUAL LANGUAGE

Use visual semantics consistently.

| Concept | Visual |
|---|---|
| Flower | organic petal icon |
| Garden | tiny garden/house icon |
| Hive | amber hexagonal/rounded hive |
| Bee flow | curved dotted/golden line |
| Rare | soft violet glow |
| Community | connected green arcs |
| Weather | environmental overlay |
| Discovery | sparkle/starburst |
| Honey | amber droplet |
| Seed | small soft capsule |

Do not use generic Material UI icons for the core game objects if custom SVG illustrations can be made.

---

# 59. COMPONENT DESIGN SYSTEM

Build reusable primitives:

```text
HiveButton
HiveIconButton
HiveCard
HiveSheet
HivePill
HiveStat
HiveToast
HiveProgress
HiveAvatar
HiveBadge
HiveTooltip
HiveEmptyState
```

Map-specific:

```text
MapMarkerGarden
MapMarkerEvent
MapOverlayBeeFlow
MapOverlayWeather
MapOverlayLegend
```

Game-specific:

```text
FlowerCard
FlowerPicker
HiveOverview
HoneyCounter
DiscoveryCard
JournalEntry
EventBanner
GardenOverview
```

---

# 60. DESIGN TOKEN EXAMPLE

Use CSS variables:

```css
:root {
  --hive-cream: #fff9ed;
  --hive-honey: #f6c344;
  --hive-leaf: #67a85b;
  --hive-leaf-deep: #376847;
  --hive-sky: #a9d9ea;
  --hive-coral: #f28c72;
  --hive-lavender: #b7a6dd;
  --hive-ink: #25352d;

  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-pill: 999px;

  --shadow-soft: 0 8px 30px rgba(37, 53, 45, 0.08);
  --shadow-float: 0 14px 40px rgba(37, 53, 45, 0.12);

  --ease-gentle: cubic-bezier(0.22, 1, 0.36, 1);
}
```

Do not scatter raw colours throughout components.

---

# 61. COPY LIBRARY — STARTING TEXT

## Onboarding

> Welcome to HIVE.

> Grow something worth visiting.

> Where should your garden bloom?

> Plant your first flower.

> A visitor found you.

## Garden

> Your little corner of the world.

> Your garden is attracting attention.

> Something is blooming.

## Bee

> A little traveller stopped by.

> This bee came from nearby.

> It is following the flowers.

## Honey

> Sweet work.

> Your hive made some honey.

## Discovery

> New discovery.

> You found something uncommon.

> Add it to your field journal.

## Community

> Your garden helped the network.

> A new pollination bridge has formed.

> The meadow is growing.

---

# 62. ANTI-DARK-PATTERN RULES

HIVE should deliberately avoid the psychological mechanics common in aggressive free-to-play games.

No:

- countdown panic
- streak loss anxiety
- fake scarcity
- intrusive red notification counts
- “you were missed” guilt language
- purchase pressure
- loot boxes
- random paid rewards

The world being alive is enough motivation.

---

# 63. FUTURE FEATURES — ONLY AFTER CORE FUN

Potential later additions:

## Bee lineage

Queens and inherited behavioural traits.

## Flower genetics

Rare mutations / variants.

## Trading

Player-to-player seed and cosmetic exchange.

## Garden decoration

Pure cosmetics.

## Community gardens

Groups maintaining shared ecological zones.

## Real weather

Regional weather influences.

## Real biodiversity datasets

Optional educational mode.

## Seasonal world changes

Autumn, winter, spring, summer.

## World quests

Community-scale ecological goals.

## AR

Optional camera-based flower discovery.

All of these are deliberately deferred.

---

# 64. MONETIZATION — FUTURE ONLY

If monetization is ever added, keep gameplay free.

Good candidates:

- cosmetic garden items
- hive skins
- bee appearance packs
- map themes
- seasonal cosmetic bundles

Bad candidates:

- stronger bees for money
- paid speedups
- loot boxes
- energy refill
- paid rarity manipulation

The game's value should remain in discovery and community, not spending.

---

# 65. TESTING STRATEGY

## Unit tests

Test game rules without Vue or Supabase.

Examples:

- attraction scoring
- nectar production
- pollen production
- flower lifecycle
- weather multipliers
- discovery conditions
- movement probabilities

## Integration tests

Test:
- plant flower RPC
- permissions
- realtime subscription
- world tick

## E2E

At minimum:

```text
new user
 → create garden
 → plant flower
 → observe bee
 → collect honey
 → discover species
```

And:

```text
player A creates flower
 → player B opens nearby map
 → B sees shared activity
```

---

# 66. PERFORMANCE TARGETS

Target:

- fast initial shell
- map interactive quickly
- no visible frame drops during normal bee activity
- lazy load heavy map/game modules where practical
- no unnecessary watchers over large arrays
- no huge DOM list for bees

Rule of thumb:

**The browser renders a story; the database stores a simulation summary.**

That distinction should guide every performance decision.

---

# 67. SECURITY CHECKLIST

Before production:

- [ ] RLS enabled on all exposed tables
- [ ] secret/service keys absent from frontend
- [ ] gameplay writes restricted
- [ ] RPC ownership checks implemented
- [ ] rate limiting considered for mutation endpoints
- [ ] user input validated server-side
- [ ] no arbitrary H3 spoofing without validation
- [ ] garden privacy model tested
- [ ] auth flows tested
- [ ] public profile data minimised

---

# 68. PRIVACY / SAFETY UX

Because this is a real-world shared world:

- never expose home addresses
- never show a player's exact real-world location by default
- do not create a public movement history
- keep usernames optional/pseudonymous
- make profile visibility understandable
- avoid freeform public chat in V1 unless moderation is designed first

A player should be able to play the entire game without publicly identifying themselves.

---

# 69. CONTENT / DATA PIPELINE

Static catalogues should be data-driven.

Store flower/bee definitions in a seed file or database table.

Example:

```text
flower_species
bee_species
weather_types
event_types
discovery_rules
```

A future admin interface can then tune balance without shipping frontend code for every small content change.

---

# 70. CURSOR PROMPT — FIRST IMPLEMENTATION TASK

Use this as the first major instruction to Cursor:

```text
You are building HIVE, a joyful multiplayer browser game.

Stack:
- Nuxt 4
- Vue 3
- TypeScript
- Pinia
- MapLibre GL JS
- MapTiler
- H3 JS
- Supabase
- GitHub Pages

The game is a shared ecological simulation on a real-world map.
Players create a small garden represented by a coarse H3 cell. Flowers attract bees. Bees move between gardens and ecological cells. The player's hive produces honey. Players discover species and collectively form pollination corridors.

For the first implementation, DO NOT build the backend simulation yet.

Build a beautiful frontend vertical slice with realistic demo data:

1. Nuxt 4 app shell.
2. Full-screen responsive map.
3. Custom warm HIVE design system.
4. MapLibre integration isolated in its own composable/component.
5. Demo gardens rendered on the map.
6. Demo animated bee flows.
7. Bottom navigation on mobile.
8. Side panel on desktop.
9. Garden detail sheet.
10. Plant flower interaction.
11. Honey counter.
12. Discovery card.
13. First-run onboarding.
14. Reduced-motion support.

Important:
- The map is the primary interface.
- The game must feel joyful, organic and tactile.
- Use custom SVG/CSS shapes for flowers, bees and hive where practical.
- Avoid generic admin/dashboard visuals.
- Use rounded cards, warm cream backgrounds, soft shadows, playful micro-interactions and restrained animations.
- Use fake data so the experience works without Supabase.
- Keep all map code out of random Vue components.
- Create clean domain modules for flowers, bees and discovery.
- Do not create a giant global store.
- Do not add extra game systems.
- Do not add combat, leaderboard, chat, shop or monetization.

First output should be a clean implementation plan in the repo README, then implement the visual vertical slice.
```

---

# 71. CURSOR PROMPT — BACKEND PHASE

After the visual slice is good, use:

```text
Now connect HIVE to Supabase.

Requirements:

1. Add Supabase client using only public frontend configuration.
2. Create SQL migrations for profiles, gardens, hives, flower_species, garden_flowers, world_cells, bee_flows, discoveries, global_events and game_ticks.
3. Enable RLS.
4. Create secure ownership policies.
5. Create gameplay RPCs for creating a garden, planting a flower and collecting honey where appropriate.
6. Never allow the browser to directly set arbitrary honey, bee population or world simulation values.
7. Add typed repository modules between Vue components and Supabase.
8. Add Supabase Realtime for visible shared garden/world changes.
9. Use Broadcast for ephemeral bee movement events.
10. Add an Edge Function called world-tick.
11. Add pg_cron to invoke world-tick once per minute.
12. Simulate aggregate bee populations, not individual persistent bees.
13. Only process active/warm cells; use lazy simulation for dormant regions.
14. Keep the UI working if realtime disconnects.
15. Add tests for RLS and gameplay mutations.

Do not put any service_role/secret key in client code.
```

---

# 72. DEFINITION OF DONE FOR THE FIRST REAL BETA

A beta is ready when:

### Experience

- A new user understands the game without a wall of instructions.
- First flower → first bee → first honey feels magical.
- Map exploration is satisfying by itself.
- The player can see evidence that other players affect the world.
- The UI feels coherent on phone and desktop.

### Technical

- Nuxt builds successfully for GitHub Pages.
- Supabase migrations run from a clean project.
- RLS prevents unauthorised writes.
- Simulation runs automatically.
- Realtime updates arrive without page refresh.
- Performance remains stable with realistic demo activity.
- Errors are handled gracefully.

### Product

- No major gameplay system is required to explain the next step.
- There is at least one reason to explore beyond the player's own garden.
- The player feels they are part of a living world rather than using a dashboard.

---

# 73. THE NORTH-STAR TEST

At every design/engineering decision, ask:

> **Does this make the world feel more alive?**

If yes, consider it.

If it only adds a menu, metric, setting, currency or system, question it.

The ideal HIVE session ends with the player thinking:

> “I wonder what happened while I was away.”

That is the product.

---

# 74. OFFICIAL TECHNICAL REFERENCES USED FOR THE ARCHITECTURE

The architecture in this handoff is aligned with the current official documentation for:

- Nuxt 4 static rendering / GitHub Pages deployment
- GitHub Pages custom workflows and deployment actions
- MapLibre GL JS browser rendering
- H3 spatial indexing
- Supabase Realtime
- Supabase PostGIS
- Supabase Edge Functions scheduling with pg_cron
- Supabase Row Level Security and public/secret API key separation

These should be treated as the authoritative sources when implementation details change.

---

# 75. FINAL PRODUCT DESCRIPTION

**HIVE** is a calm multiplayer game played on the real world.

You start with one tiny garden.

You plant flowers.

Bees arrive.

They travel.

They visit other players.

Your garden helps someone else's hive.

Someone else's flowers help yours.

Over time, tiny gardens become corridors, corridors become ecosystems, and the world map slowly becomes a living picture of what the community has created together.

The game is not really about owning bees.

It is about **making a place worth visiting**.

That is the identity the entire product should protect.
