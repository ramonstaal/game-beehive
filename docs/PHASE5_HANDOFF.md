# HIVE — Phase 5 Handoff: Polish & Production

> **Session:** New
> **Date:** 2026-01-08
> **Previous session completed:** Phases 0, 1, 2, 3, 4
> **This session starts:** Phase 5 — Polish & Production

---

## Current State of the Codebase

### What's Built and Working (Phases 0–4)

**Frontend:**
- ✅ Full MapLibre GL JS map with custom style
- ✅ Complete auth, onboarding, garden placement flows
- ✅ Garden panel, bottom nav, sheets, responsive layout
- ✅ How to Play page
- ✅ Toast, discovery card, event banner UI
- ✅ Real discovery system with triggers
- ✅ Field Journal with 4 tabs
- ✅ Great Bloom event engine
- ✅ Community stats and milestones
- ✅ Pollination corridors on map
- ✅ Secret flower combinations

**Backend:**
- ✅ World tick Edge Function (pg_cron every 60s)
- ✅ Flower attraction, weather, bee movement, lazy simulation
- ✅ Honey production, flower lifecycle
- ✅ Realtime subscriptions
- ✅ RLS policies, RPCs

### What Does NOT Exist Yet (Phase 5 Work)

| Feature | Status | Notes |
|---------|--------|-------|
| **Sound design** | ❌ Missing | No audio at all |
| **Motion polish** | ❌ Partial | Basic animations exist, need refinement |
| **Accessibility** | ❌ Missing | No keyboard nav, no reduced motion |
| **Onboarding polish** | ❌ Basic | Works but not delightful |
| **Performance tuning** | ❌ Missing | No optimization done |
| **Analytics** | ❌ Missing | No event tracking |
| **Error handling** | ❌ Basic | Generic error messages |
| **Loading states** | ❌ Basic | Spinner only, no brand loading |
| **Empty states** | ❌ Missing | No empty state designs |
| **Offline support** | ❌ Missing | No graceful degradation |
| **E2E test suite** | ❌ Missing | Guide exists, no tests written |
| **Unit tests** | ❌ Missing | No test files exist |

---

## Key Files to Read First

| File | Purpose |
|------|---------|
| `docs/PHASE4_HANDOFF.md` | Previous phase handoff |
| `docs/playwright-testing-guide.md` | Testing reference |
| `assets/css/main.css` | Design tokens and animations |
| `composables/useHiveMap.ts` | Map performance critical code |
| `stores/world.ts` | Bee animation loop (performance) |
| `components/map/HiveMap.vue` | Map rendering |
| `components/onboarding/OnboardingFlow.vue` | Onboarding to polish |
| `components/ui/AuthModal.vue` | Auth UX |
| `lib/game/` | All game logic files |

---

## Phase 5 Implementation Plan

### Step 1: Sound Design

Create `lib/sound/` and `composables/useSound.ts`:

```typescript
// Sound files (public/sounds/)
// - ambient-meadow.mp3      (looping, very quiet)
// - flower-place.mp3        (soft plop)
// - bee-arrive.mp3          (gentle buzz)
// - honey-collect.mp3       (warm chime)
// - discovery.mp3           (3-note ascending)
// - event-start.mp3         (soft swell)

interface SoundManager {
  play(sound: SoundType): void
  setVolume(volume: number): void
  mute(): void
  unmute(): void
  isMuted: boolean
}
```

**Rules:**
- Ambient meadow: loop at 10% volume
- Interaction sounds: one-shot, 50% volume
- Respect browser autoplay policy (require user gesture first)
- Mute toggle in settings
- `prefers-reduced-motion` also disables sound

### Step 2: Motion Polish

Enhance existing animations in `assets/css/main.css`:

**Current animations to improve:**
- `animate-hive-bob` → smoother easing, variable timing
- `animate-hive-float` → more organic movement
- `animate-hive-sway` → subtle wind effect
- `animate-hive-pulse-soft` → gentler pulse

**New micro-interactions:**
- Button press: scale down 95%, spring back
- Flower hover: slight lift + shadow
- Marker click: ripple effect
- Toast: slide in from top, fade out
- Sheet: spring-up animation
- Discovery card: radial glow + particles

**Reduced motion support:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Step 3: Accessibility

**Keyboard navigation:**
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals/sheets
- Arrow keys to navigate map (if focused)

**Screen reader support:**
- All icons have `aria-label`
- All buttons have descriptive text
- Map regions have `role="img"` + `aria-label`
- Toast has `role="status"` + `aria-live="polite"`
- Discovery has `role="alert"` + `aria-live="assertive"`

**Focus management:**
- Visible focus ring (custom, not default)
- Focus trap in modals/sheets
- Focus returns to trigger on close

**Color contrast:**
- Text on cream: ≥ 4.5:1
- Text on honey: ≥ 4.5:1
- Interactive elements: ≥ 3:1 against background

### Step 4: Onboarding Polish

Enhance `OnboardingFlow.vue`:

- Animated transitions between steps (slide + fade)
- Progress indicator with labels
- "Back" button for previous steps
- Skip confirmation
- Final celebration animation (confetti + bee swarm)
- Option to replay onboarding from settings

### Step 5: Performance Tuning

**Map optimization:**
- Limit animated bee sprites to 100–150 on screen
- Aggregate distant bee flows into simple lines
- Use `requestAnimationFrame` only for visible elements
- Debounce all map event handlers
- Lazy load map layers

**Store optimization:**
- Use `shallowRef` for large arrays
- Avoid deep watchers on large objects
- Batch Supabase updates

**Bundle optimization:**
- Lazy load components not needed on first paint
- Split map code into separate chunk
- Tree-shake unused Tailwind classes
- Compress audio files

**Memory leaks:**
- Cancel `requestAnimationFrame` on unmount
- Unsubscribe Realtime channels on unmount
- Destroy MapLibre instance on unmount
- Clear intervals/timeouts on unmount


### Step 6: Analytics

Create `lib/analytics.ts`:

```typescript
// Track product events (no personal data)
const events = {
  onboarding_started: () => track('onboarding_started'),
  garden_created: (location: string) => track('garden_created', { location }),
  flower_planted: (species: string) => track('flower_planted', { species }),
  bee_arrived: (beeType: string) => track('bee_arrived', { beeType }),
  honey_collected: (amount: number) => track('honey_collected', { amount }),
  discovery_found: (type: string, key: string) => track('discovery_found', { type, key }),
  map_region_viewed: (region: string) => track('map_region_viewed', { region }),
  event_joined: (eventId: string) => track('event_joined', { eventId }),
}
```

**Privacy:** No personal data, no exact locations, no emails. Only aggregate gameplay events.

### Step 7: Error Handling

Replace generic errors with human messages:

```typescript
const errorMessages: Record<string, string> = {
  'duplicate key value violates unique constraint': 'That flower slot is already occupied.',
  'insufficient funds': 'Not enough honey. Your hive needs more time.',
  'invalid slot index': 'That slot is not available yet. Upgrade your hive first.',
  'network error': 'The hive is reconnecting… Please try again in a moment.',
}
```

### Step 8: Loading & Empty States

**Loading:**
- Replace generic spinner with branded loading: "🐝 exploring... finding flowers"
- Animated dots or bee movement
- Map loads behind first-run shell

**Empty states:**
- No gardens nearby: "This meadow is quiet. Be the first to plant a garden here!"
- No flowers: "Your garden is ready. Plant your first flower to attract bees."
- No discoveries: "Your field journal is empty. Start exploring to fill it!"
- No honey: "Your hive is still young. Flowers will bring nectar soon."

### Step 9: Offline Support

Graceful degradation when offline:
- Show "The hive is reconnecting…" banner
- Allow map exploration from cached state
- Queue gameplay actions for when online
- Show last-known state with timestamp
- Auto-retry Realtime connection every 30s

### Step 10: Test Suite

**Unit tests (`tests/unit/`):**
- All `lib/game/` functions
- Store getters and actions
- Composables

**E2E tests (`tests/e2e/`):**
- Follow `docs/playwright-testing-guide.md`
- Minimum: auth → garden → plant → observe → collect → discover

---

## Environment Variables

Same as previous phases. No new vars needed.

---

## Definition of Done for Phase 5

- [ ] Ambient + interaction sounds implemented
- [ ] Sound respects browser autoplay and reduced motion
- [ ] All animations polished with custom easing
- [ ] `prefers-reduced-motion` fully supported
- [ ] Keyboard navigation works throughout
- [ ] Screen reader labels on all interactive elements
- [ ] Focus management in modals/sheets
- [ ] Color contrast meets WCAG AA
- [ ] Onboarding has transitions, back button, celebration
- [ ] Map renders ≤150 bee sprites without frame drops
- [ ] No memory leaks (verified in dev tools)
- [ ] Bundle size optimized (initial < 500KB)
- [ ] Analytics tracking all key events
- [ ] Human-readable error messages throughout
- [ ] Branded loading and empty states
- [ ] Offline banner + cached map exploration
- [ ] Unit tests for all game logic
- [ ] E2E test for complete user journey
- [ ] No console errors in production build
- [ ] Lighthouse score ≥ 90 (performance, accessibility, best practices)

---

*End of Phase 5 handoff. Time to make it shine! ✨*

