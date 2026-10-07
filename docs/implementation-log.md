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

## Next Phases

1. **Phase 1** — Auth, garden persistence, real data from Supabase
2. **Phase 2** — Shared world, multiple gardens, realtime updates
3. **Phase 3** — World simulation tick, weather, bee movement rules
4. **Phase 4** — Discovery system, events, community stats
5. **Phase 5** — Sound, polish, accessibility, performance

