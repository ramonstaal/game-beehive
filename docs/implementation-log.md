# HIVE Implementation Log

**Project:** HIVE — A living world game on a real-world map  
**Started:** 2026-10-07  
**Stack:** Nuxt 3 + Vue 3 + TypeScript + Pinia + MapLibre GL JS + Tailwind CSS + Supabase + GitHub Pages

---

## Phase 0 — Visual Spike ✅ COMPLETE

### Goal
Prove the game looks good. Build: map, custom style, gardens, flowers, animated bees, honey counter, mobile layout.

### What Was Built

1. **Project Setup** — Nuxt 3 SPA, Tailwind CSS, MapLibre GL JS, Pinia, GitHub Pages preset
2. **Design System** — Warm cream palette, Fredoka + Inter fonts, CSS variables, reduced-motion support
3. **Map Foundation** — MapLibre composable, desaturated OSM tiles, garden markers, bee flow lines
4. **Demo Data** — 8 flower species, 5 demo gardens, player garden, hive, bee flows, discoveries, events
5. **Components** — 15+ components: buttons, cards, pills, toasts, panels, sheets, map overlays, onboarding
6. **App Shell** — Desktop (side panels + map) + Mobile (full map + bottom nav + sheets)
7. **Onboarding** — 5-step welcome flow with animated bee and flowers
8. **Polish** — Microinteractions, loading screen, backdrop blur, custom map controls

### Stores (Pinia)
- player, garden, world, journal, ui

### Build Status
- `nuxt generate` produces static output
- GitHub Actions workflow ready for auto-deploy

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-10-07 | Remote-only Supabase | Remote project is empty; no local Docker needed |
| 2026-10-07 | Tailwind + custom components | More playful than PrimeVue's generic admin aesthetic |
| 2026-10-07 | OSM raster tiles for Phase 0 | Simple; upgrade to MapTiler vector style later |
| 2026-10-07 | Emoji icons for Phase 0 | Quick prototyping; replace with custom SVG later |

---

## Phase 1 — Playable Single-Player ✅ COMPLETE

### Goal
Auth, garden persistence, flowers, hive, honey, journal — all backed by Supabase.

### What Was Built

1. **Supabase Schema** — 7 migrations applied to remote project `qpvizapftjjjcupojbpl`:
   - `profiles` (extends auth.users with trigger)
   - `gardens` + `hives` (one-to-one, owner-tracked)
   - `flower_species` + `garden_flowers` (catalog + instances)
   - `world_cells` + `bee_flows` (simulation tables, server-only write)
   - `discoveries` + `global_events` + `game_ticks`
2. **RLS Policies** — Every table has proper Row Level Security:
   - Public read for gardens, hives, flowers, species, world data, events
   - Owner-only write for personal data (profile, garden, flowers, discoveries)
   - Server-only write for simulation tables (world_cells, bee_flows, game_ticks)
3. **Gameplay RPCs** — Secure server-side functions:
   - `create_garden(h3_cell, name, lat, lng)` — creates garden + hive atomically
   - `plant_flower(garden_id, species_id, slot_index)` — ownership verified, slot checked
   - `harvest_honey(garden_id, amount)` — deducts with balance check
   - `record_discovery(...)` — idempotent via unique constraint
   - `get_nearby_gardens(lat, lng, radius_km)` — spatial query
4. **Auth System** — Full auth flow in frontend:
   - Sign up with email + password + garden name
   - Sign in with password
   - Magic link (passwordless)
   - Auth state persistence with `onAuthStateChange` listener
   - `AuthModal.vue` component with tabbed sign-in/sign-up UI
5. **Supabase Client** — Typed client with database types:
   - `app/lib/supabase/client.ts` — singleton client using runtime config
   - `app/lib/supabase/database.types.ts` — full TypeScript definitions for all tables
6. **Store Integration** — All stores now call Supabase:
   - `player.ts` — auth session, profile fetch, signUp/signIn/signOut
   - `garden.ts` — `fetchMyGarden()`, `createGarden()`, `plantFlower()` with RPC fallback to local demo
   - `world.ts` — `fetchGardens()`, `fetchEvents()` from Supabase
   - `journal.ts` — `fetchDiscoveries()`, `recordDiscovery()` via RPC
7. **App Shell Updated** — `app.vue` now:
   - Initializes auth on mount
   - Shows `AuthModal` when not authenticated (with demo skip option)
   - Fetches real data after successful auth
   - Falls back to demo data for exploration without account

### Build Status
- `nuxt generate` produces static output ✅
- All migrations applied to remote Supabase ✅
- GitHub Actions workflow ready ✅
- Pushed to https://github.com/ramonstaal/game-beehive.git ✅

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-10-07 | Remote-only Supabase | Remote project is empty; no local Docker needed |
| 2026-10-07 | Tailwind + custom components | More playful than PrimeVue's generic admin aesthetic |
| 2026-10-07 | OSM raster tiles for Phase 0 | Simple; upgrade to MapTiler vector style later |
| 2026-10-07 | Emoji icons for Phase 0 | Quick prototyping; replace with custom SVG later |
| 2026-10-07 | RPCs for gameplay mutations | Prevents clients from arbitrarily setting honey/bee counts |
| 2026-10-07 | Demo fallback in stores | App works without auth for exploration; graceful degradation |

---

## Phase 2 — Shared World ✅ COMPLETE

### Goal
Multiple gardens, world cells, aggregate bee flow, realtime, region filtering.

### Acceptance
> Two browsers in different accounts can see the same garden activity and bee flows.

### What Was Built

1. **H3 Integration** — `app/composables/useH3.ts`
   - `latLngToCell` / `cellToLatLng` / `gridDisk` utilities
   - Configurable resolution (default: 9)
   - `getCellCenter()` snaps any lat/lng to H3 cell center for privacy

2. **Garden Placement Flow** — `app/components/garden/GardenPlacement.vue`
   - Full-screen map overlay when authenticated user has no garden
   - Shows H3 cell info and confirm/cancel buttons
   - Calls `create_garden` RPC on confirm
   - Falls back to demo mode if cancelled

3. **Region-based Queries** — `app/stores/world.ts`
   - `fetchGardensInBounds(minLat, maxLat, minLng, maxLng)` — viewport-filtered Supabase query
   - Auto-fetches new region when map moves (300ms debounce)
   - `nearbyGardens` computed filters to visible area
   - `fetchWorldCells(cells[])` — loads cell data by H3 cell IDs
   - `fetchBeeFlows(sinceMinutes)` — loads recent aggregate flows

4. **Realtime Subscriptions** — `app/stores/world.ts`
   - `subscribeToGardens()` — Postgres Changes on `gardens` table → auto-refetch viewport
   - `subscribeToEvents()` — Postgres Changes on `global_events` → refetch events
   - `unsubscribeAll()` — cleanup on unmount
   - Channels: `world:gardens`, `world:events`

5. **Shared Garden Visibility**
   - Garden markers show owner name labels beneath icons
   - Player garden gets honey-colored marker, others get green
   - `profiles:owner_id(username)` joined in garden queries
   - Click any garden marker → toast with name/flower/bee stats

6. **Interactive Map** — `app/composables/useHiveMap.ts` + `app/components/map/HiveMap.vue`
   - `addClickListener` / `removeClickListener` for map interactions
   - `onMoveEnd` callback for viewport change detection
   - `getBounds()` returns current map bounds for region queries
   - Garden markers have click handlers + hover scale animation
   - Auto-refreshes markers when `world.gardens` changes

7. **App Shell Updated** — `app/app.vue`
   - Detects authenticated users without gardens → shows placement flow
   - After garden placement: loads full data + starts realtime subscriptions
   - `loadFullData()` parallel fetches gardens, events, discoveries
   - Proper cleanup: `unsubscribeAll()` + `stopBeeAnimation()` on unmount

### Build Status
- `nuxt generate` produces static output ✅
- All code pushed to https://github.com/ramonstaal/game-beehive.git ✅

---

## Next Phases

1. **Phase 3** — World simulation tick, weather, bee movement rules
2. **Phase 4** — Discovery system, events, community stats
3. **Phase 5** — Sound, polish, accessibility, performance

