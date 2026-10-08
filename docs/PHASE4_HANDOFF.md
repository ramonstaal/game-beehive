# HIVE — Phase 4 Handoff: Discovery + Events

> **Session:** New
> **Date:** 2026-01-08
> **Previous session completed:** Phases 0, 1, 2, 3
> **This session starts:** Phase 4 — Discovery + Events

---

## Current State of the Codebase

### What's Built and Working (Phases 0–3)

**Frontend:**
- ✅ Full-screen MapLibre GL JS map (OSM raster tiles)
- ✅ Garden placement flow (click map → H3 snap → confirm → create)
- ✅ Auth modal (Supabase email/password + magic link)
- ✅ Onboarding flow (5-step wizard)
- ✅ Garden panel with stats (honey, flowers, bees)
- ✅ Bottom navigation (mobile) + side panels (desktop)
- ✅ How to Play static page (`/how-to-play`)
- ✅ Toast notifications, discovery cards, event banners (UI only)
- ✅ Responsive layout

**Backend (Phase 3):**
- ✅ World tick Edge Function (pg_cron every 60s)
- ✅ Flower attraction algorithm (species, weather, time)
- ✅ Weather state machine (simulated, per region)
- ✅ Bee movement rules (aggregate populations, H3 neighbors)
- ✅ Lazy simulation for dormant cells
- ✅ Honey production (nectar → honey conversion)
- ✅ Flower lifecycle (seed → sprout → growing → blooming → fading)
- ✅ Realtime subscriptions for all world state

### What Does NOT Exist Yet (Phase 4 Work)

| Feature | Status | Notes |
|---------|--------|-------|
| **Rare species** | ❌ Missing | Only 8 common flowers, no rare/mythic |
| **Real discovery system** | ❌ UI only | DiscoveryCard shows but no logic |
| **Field Journal** | ❌ Missing | JournalPanel exists but no data |
| **Great Bloom event** | ❌ Missing | EventBanner exists but no engine |
| **Community statistics** | ❌ Missing | No global stats or milestones |
| **Pollination corridors** | ❌ Missing | No visual community features |
| **Secret combinations** | ❌ Missing | No hidden flower combos |
| **Discovery triggers** | ❌ Missing | No first-encounter detection |

---

## Key Files to Read First

| File | Purpose |
|------|---------|
| `docs/PHASE3_HANDOFF.md` | Previous phase handoff with full schema |
| `lib/game/simulation.ts` | Attraction and movement algorithms |
| `lib/game/weather.ts` | Weather state machine |
| `lib/game/bees.ts` | Bee movement rules |
| `stores/world.ts` | World state, realtime, bee animation |
| `components/ui/DiscoveryCard.vue` | Discovery UI (needs wiring) |
| `components/map/EventBanner.vue` | Event banner UI (needs wiring) |
| `components/garden/JournalPanel.vue` | Journal UI (needs data) |
| `components/garden/JournalSheet.vue` | Mobile journal sheet |
| `lib/game/types.ts` | All TypeScript interfaces |

---

## Phase 4 Implementation Plan

### Step 1: Expand Flower Species Catalogue

Add rare and mythic species to `flower_species` table and `lib/game/fixtures-species.ts`:

**Rare species (uncommon encounters):**
| ID | Name | Rarity | Trait | Discovery Condition |
|----|------|--------|-------|-------------------|
| `bluebell` | Bluebell | uncommon | Shade lover | Plant in rainy weather |
| `foxglove` | Foxglove | uncommon | Toxic beauty | Discover after 10 flowers |
| `primrose` | Primrose | uncommon | Early spring | First flower of season |
| `honeysuckle` | Honeysuckle | uncommon | Climbing vine | Near water cells |
| `cornflower` | Cornflower | uncommon | Field bloom | In meadow regions |

**Mythic species (very rare):**
| ID | Name | Rarity | Trait | Discovery Condition |
|----|------|--------|-------|-------------------|
| `ghost-orchid` | Ghost Orchid | mythic | Phantom bloom | Night + full moon + rain |
| `fire-lily` | Fire Lily | mythic | Volcanic energy | During Great Bloom event |
| `crystal-rose` | Crystal Rose | mythic | Prismatic | 100+ gardens in region |
| `moon-orchid` | Moon Orchid | mythic | Lunar glow | Night + 50+ night bees |
| `star-jasmine` | Star Jasmine | mythic | Celestial | Pollination corridor formed |

### Step 2: Real Discovery System

Create `lib/game/discovery.ts` with pure functions:

```typescript
interface DiscoveryCondition {
  type: 'first_flower' | 'first_bee' | 'new_region' | 'weather_combo' | 'event'
  check: (context: DiscoveryContext) => boolean
}

interface DiscoveryContext {
  playerId: string
  gardenId: string
  flowerSpecies: FlowerSpecies[]
  beeTypes: string[]
  currentCell: string
  weather: WeatherState
  timeOfDay: string
  activeEvent: GameEvent | null
  discoveredKeys: Set<string>
}

function checkDiscoveries(context: DiscoveryContext): Discovery[] {
  // Check all conditions against context
  // Return array of newly triggered discoveries
}
```

**Discovery triggers:**
1. First flower of species planted
2. First bee type visits garden
3. New H3 region viewed for first time
4. Rare weather + flower combination
5. Event-specific discovery
6. Joining a pollination corridor

### Step 3: Field Journal System

Create `stores/journal.ts` and wire `JournalPanel.vue`:

```typescript
interface JournalState {
  discoveredFlowers: DiscoveredSpecies[]
  discoveredBees: DiscoveredSpecies[]
  discoveredPhenomena: DiscoveredPhenomenon[]
  discoveredPlaces: DiscoveredPlace[]
  totalDiscoveries: number
}
```

**Journal UI tabs:**
- 🌼 Flowers (X / 20)
- 🐝 Bees (X / 12)
- 🍯 Phenomena (X / 10)
- 🌍 Places (X / 50)

### Step 4: Great Bloom Event

Create event engine in `lib/game/events.ts`:

```typescript
interface EventDefinition {
  id: string
  type: 'great_bloom' | 'golden_migration' | 'night_bloom' | 'rain_week'
  name: string
  description: string
  icon: string
  durationHours: number
  effects: EventEffects
  schedule: EventSchedule
}

interface EventEffects {
  nectarMultiplier: number
  rareBeeChance: number
  bloomSpeedMultiplier: number
  discoveryBonus: boolean
  visualEffect: string
}
```

**Great Bloom specifics:**
- Runs every weekend (Saturday 00:00 to Sunday 23:59)
- Effects: +50% nectar, 2x rare bee chance, +30% bloom speed
- Visual: Golden pulsing overlay on active region
- Banner: "The Great Bloom is here! Rare bees are visiting."

### Step 5: Community Statistics

Create `lib/game/community.ts`:

```typescript
interface CommunityStats {
  totalGardens: number
  totalFlowers: number
  totalBees: number
  totalHoney: number
  activeThisWeek: number
  pollinationCorridors: Corridor[]
  milestones: Milestone[]
}
```

**Milestones:**
- "100 Gardens Planted" — global
- "Regional Bloom: 50 gardens in Netherlands" — regional
- "First Pollination Corridor" — when 2 regions connect
- "10,000 Flowers Blooming" — global

### Step 6: Pollination Corridors

Visual feature showing connected gardens:
1. Find all gardens with bloom_score > 50
2. Group by H3 parent region (res 3)
3. If 3+ gardens with active bee flows → corridor
4. Draw curved lines between gardens on map
5. Show corridor name: "Amsterdam ↔ Utrecht Pollination Bridge"

### Step 7: Secret Combinations

Hidden flower combos in `lib/game/combos.ts`:

```typescript
interface SecretCombo {
  id: string
  name: string
  requiredFlowers: string[]
  requiredWeather?: WeatherState
  requiredTime?: string
  effect: ComboEffect
}
```

**Example combos:**
- Lavender + Clover + Rain → "Rain Meadow" (+20% nectar, attracts Rain Bee)
- Moonflower + Jasmine + Night → "Lunar Bloom" (+30% night bees)
- Sunflower + Poppy + Windy → "Golden Drift" (bees travel farther)

**Do NOT document combos in UI.** Let players discover them.


---

## Environment Variables

Same as Phase 3. No new vars needed.

---

## Testing

**Unit tests to write:**
- `lib/game/discovery.ts` — all discovery conditions
- `lib/game/events.ts` — event scheduling and effects
- `lib/game/community.ts` — corridor detection, milestone checking

**Integration tests:**
- Plant rare flower → discovery triggers
- Event activates → effects apply to world
- Corridor forms → visual appears on map

**E2E (Playwright):**
- Plant first flower → DiscoveryCard appears
- Visit new region → "New Place" discovery
- During Great Bloom → banner shows, effects visible
- Journal shows all discovered items
- Community stats update in real-time

---

## Architecture Rules

1. **Rare species are data-driven** — Stored in DB, not hardcoded in components
2. **Discovery is server-validated** — Client can't fake discoveries
3. **Events are scheduled in DB** — Not hardcoded in Edge Functions
4. **Community stats are aggregate** — No individual player rankings
5. **Secret combos are hidden** — Not in UI, only in DB metadata
6. **Corridors are visual** — No gameplay advantage, just beauty

---

## Files to Create

```
lib/game/discovery.ts       # Discovery conditions and triggers
lib/game/events.ts          # Event definitions and scheduling
lib/game/community.ts       # Community stats and corridors
lib/game/combos.ts          # Secret flower combinations
stores/journal.ts           # Journal state management

supabase/migrations/XXXX_add_rare_species.sql
supabase/migrations/XXXX_add_event_schedule.sql
supabase/migrations/XXXX_add_community_stats.sql
```

---

## Definition of Done for Phase 4

- [ ] 5+ rare flower species added to catalogue
- [ ] 5 mythic species with special discovery conditions
- [ ] Real discovery system with 6+ trigger types
- [ ] Field Journal with 4 tabs (Flowers, Bees, Phenomena, Places)
- [ ] Great Bloom event runs on schedule with effects
- [ ] Event banner shows on map during active event
- [ ] Community statistics computed and displayed
- [ ] 3+ community milestones with progress tracking
- [ ] Pollination corridors detected and visualized on map
- [ ] 5+ secret flower combinations with hidden effects
- [ ] Discovery card appears with correct data on trigger
- [ ] Journal persists across sessions
- [ ] No player rankings or competitive stats
- [ ] All discovery logic is server-validated
- [ ] Unit tests for all discovery and event functions

---

*End of Phase 4 handoff. The world is about to get more magical! 🌸*

