# Playwright Testing Reference for HIVE

## 1. App Overview

| Property | Value |
|----------|-------|
| **Framework** | Nuxt 3 + Vue 3 + TypeScript |
| **State** | Pinia stores |
| **Map** | MapLibre GL JS (raster OSM tiles) |
| **Styling** | Tailwind CSS + custom CSS variables |
| **Auth** | Supabase (email/password + magic link) |
| **Backend** | Supabase (PostgreSQL + Realtime) |
| **SSR** | Disabled (`ssr: false`) — pure SPA |
| **Build target** | GitHub Pages static |

### Entry Points

| Route | Purpose |
|-------|---------|
| `/` | Main game (map + garden + auth flow) |
| `/how-to-play` | Static "How to Play" guide |

---

## 2. App States & Conditional Rendering

The root page (`pages/index.vue`) renders **one of four mutually exclusive states**:

```
State 1: AuthModal      (showAuth === true)       → Full-screen auth overlay
State 2: OnboardingFlow (ui.isOnboarding === true) → 5-step fullscreen onboarding
State 3: GardenPlacement (needsGardenPlacement)    → Full-screen map + placement overlay
State 4: Main App       (default)                  → Desktop: side panels + map
                                                   → Mobile: full-screen map + bottom nav
```

### State Transition Flow

```
[Load App]
   │
   ├─► Dev mode ──► skip auth, skip onboarding ──► Main App (demo data)
   │
   ├─► No session ──► AuthModal
   │      │
   │      ├─► Sign In / Sign Up ──► authenticated ──► check garden
   │      │
   │      └─► "Explore without account" ──► demo mode ──► Main App
   │
   ├─► Has session, no garden ──► GardenPlacement
   │      │
   │      ├─► Click map → select location → Confirm ──► Main App
   │      └─► Cancel ──► demo mode ──► Main App
   │
   └─► Has session + has garden ──► Main App
```

---

## 3. Component Hierarchy

### 3.1 Auth State (`showAuth === true`)

```
<div class="hive-app">
  <AuthModal>                    ← z-[200] fixed fullscreen
    ├── Logo section (🐝 HIVE)
    ├── Tab buttons: "Sign In" | "New Garden"
    ├── Form (email, password, [username])
    ├── Error message (if any)
    ├── Submit button ("Sign In" / "Start Your Garden")
    ├── "Or use a magic link ✨" button
    └── "Explore without an account" skip button
  </AuthModal>
</div>
```

### 3.2 Onboarding State (`ui.isOnboarding === true`)

```
<div class="fixed inset-0 z-[200] bg-hive-cream flex flex-col">
  ├── Progress dots (5 dots, top center)
  ├── Skip button (top right)
  ├── Content area (centered, changes per step)
  │   ├── Step 0: Welcome (🐝 "Welcome to HIVE")
  │   ├── Step 1: Choose location (🗺️)
  │   ├── Step 2: Plant (🌱)
  │   ├── Step 3: First visitor (🐝)
  │   └── Step 4: First reward (🍯)
  └── CTA button (bottom): "Continue" / "Start your garden"
</div>
```

### 3.3 Garden Placement State (`needsGardenPlacement === true`)

```
<div class="h-screen w-screen relative">
  ├── <HiveMap />                ← Full-screen map
  └── <GardenPlacement>          ← z-[150] overlay
       ├── Instruction card: "📍 Place Your Garden"
       └── Confirm card (appears after map click)
            ├── Garden info
            ├── "🌱 Plant Here" button
            └── "Choose Another Spot" button
</div>
```

### 3.4 Main App State (Desktop)

```
<div class="hive-app">
  ├── <HiveToast> (conditional, top-center)
  ├── <DiscoveryCard> (conditional, 4s auto-dismiss)
  ├── Desktop layout (hidden lg:flex)
  │   ├── Left Panel (w-80)
  │   │   ├── <AppHeader> (🐝 HIVE logo)
  │   │   ├── <GardenPanel> (if view === 'world'|'garden')
  │   │   │   ├── Garden card (name, stats: 🐝🍯🌼)
  │   │   │   ├── Flower strip
  │   │   │   ├── "Plant a flower" button
  │   │   │   └── Nearby Gardens list
  │   │   ├── <JournalPanel> (if view === 'journal')
  │   │   └── <ProfilePanel> (if view === 'profile')
  │   ├── Main Map (flex-1)
  │   │   ├── <HiveMap />
  │   │   ├── Floating stats bar (top center)
  │   │   │   ├── 🍯 Honey pill
  │   │   │   ├── 🌼 Flower pill
  │   │   │   └── 🐝 Bee pill
  │   │   └── <EventBanner> (conditional, below stats)
  │   └── Right Panel (w-72)
  │       └── <ActivityFeed> (static demo content)
</div>
```

### 3.5 Main App State (Mobile)

```
<div class="hive-app">
  ├── <HiveToast> (conditional)
  ├── <DiscoveryCard> (conditional)
  ├── Mobile layout (lg:hidden)
  │   ├── <HiveMap /> (full screen)
  │   ├── Top bar (absolute)
  │   │   ├── <AppHeader compact />
  │   │   └── Stats pills (🍯🌼)
  │   ├── <EventBanner> (conditional, below header)
  │   ├── <BottomNav> (absolute bottom)
  │   │   ├── 🌍 World
  │   │   ├── 🏡 Garden (opens sheet)
  │   │   ├── 📖 Journal (opens sheet)
  │   │   └── 👤 Profile (opens sheet)
  │   └── Bottom Sheets (conditional)
  │       ├── <GardenSheet> (ui.openSheet === 'garden')
  │       ├── <JournalSheet> (ui.openSheet === 'journal')
  │       ├── <ProfileSheet> (ui.openSheet === 'profile')
  │       └── <FlowerPickerSheet> (ui.openSheet === 'flower-picker')
</div>
```

---

## 4. Map Behavior

### 4.1 Map Initialization

| Property | Value |
|----------|-------|
| Engine | MapLibre GL JS |
| Tiles | OpenStreetMap raster tiles (256px) |
| Style | Custom inline style (raster layer at 60% opacity, desaturated) |
| Center | [5.1214, 52.0907] (Utrecht, NL) |
| Zoom | 12 (initial) |
| Controls | NavigationControl (bottom-right, no compass), AttributionControl (bottom-right, compact) |

**Map container:** `div` rendered by `<HiveMap>` with `class="w-full h-full relative"`

**Loading state:** While `isReady === false`:
- Animated 🐝 icon (`animate-hive-bob`)
- Text: "Exploring the meadow..."

### 4.2 Map Layers

```
1. OSM base layer (raster, 60% opacity, desaturated)
2. Garden markers (DOM elements, added via Marker API)
3. Bee flow layer (GeoJSON line layer, id: "bee-flows")
```

### 4.3 Map Interactions

| Action | Effect | Playwright Equivalent |
|--------|--------|----------------------|
| Click (empty map) | During placement: stores `lat:X,lng:Y` in `ui.selectedMapObject` | `page.click()` on map container |
| Click (garden marker) | Shows toast with garden info | `page.click()` on marker element |
| Drag | Pans the map | `page.mouse.move() + mouse.down() + mouse.move() + mouse.up()` |
| Scroll wheel | Zooms in/out | `page.mouse.wheel()` |
| Double-click | Zooms in | `page.dblclick()` |
| Move end | After 300ms debounce: fetches gardens in new bounds | Wait for network idle |

### 4.4 Garden Markers

Rendered as **DOM-based Markers** (not symbol layer):

```html
<div class="hive-garden-marker" style="position: relative;">
  <div class="garden-marker-inner" style="
    width: 40px; height: 40px; border-radius: 50%;
    background: linear-gradient(135deg, #F6C344, #FADD7A);
    border: 3px solid white; box-shadow: 0 4px 12px rgba(37,53,45,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; cursor: pointer; transition: transform 0.2s ease;
  ">🏡</div>
  <div style="...">Garden Name</div>
</div>
```

**Marker interactions:**
- `mouseenter`: Scales to 1.15x
- `mouseleave`: Scales back to 1x
- `click`: Stops propagation, calls `handleGardenClick()` → shows toast

**Selectors:** `.hive-garden-marker` or `.garden-marker-inner`

### 4.5 Bee Flow Layer

Rendered as GeoJSON line layer with id `bee-flows`:
- Color: `#F6C344` (golden)
- Width: 3px
- Opacity: 0.6
- Dash pattern: `[2, 4]` (dashed animated)

Animation driven by `requestAnimationFrame`.

### 4.6 Viewport Change → Data Loading

1. Map fires `moveend` event
2. 300ms debounce timer starts
3. After debounce: `getBounds()` called
4. `world.fetchGardensInBounds(minLat, maxLat, minLng, maxLng)` called
5. New gardens render as markers


---

## 5. State Management

### 5.1 Store Overview

| Store | Key State | Purpose |
|-------|-----------|---------|
| `usePlayerStore` | `user`, `profile`, `isAuthenticated` | Auth state |
| `useGardenStore` | `garden`, `hive`, `flowers` | Player's garden data |
| `useWorldStore` | `gardens`, `beeFlows`, `currentWeather`, `activeEvent` | Shared world state |
| `useJournalStore` | discoveries | Journal/field guide |
| `useUiStore` | `currentView`, `openSheet`, `selectedMapObject`, `toastMessage`, `isOnboarding` | UI state |

### 5.2 UI State

```ts
interface UiState {
  currentView: 'world' | 'garden' | 'journal' | 'profile'
  selectedMapObject: string | null    // e.g., "lat:52.09,lng:5.12" or garden ID
  openSheet: string | null            // 'garden' | 'journal' | 'profile' | 'flower-picker' | 'place-garden'
  isOnboarding: boolean
  onboardingStep: number              // 0–4
  toastMessage: string | null
  toastIcon: string
  showDiscovery: boolean
  discoveryData: { name, description, icon } | null
}
```

### 5.3 Map Click Propagation (Garden Placement)

```
[User clicks map]
   │
   ▼
mapApi.addClickListener() ──► callback(lng, lat)
   │
   ▼
ui.selectMapObject(`lat:${lat},lng:${lng}`)
   │
   ▼
[pages/index.vue watcher detects change]
   │
   ▼
updates placementLat / placementLng
   │
   ▼
[GardenPlacement component receives new props]
   │
   ▼
getCellCenter(lat, lng) ──► updates pendingCell
   │
   ▼
Confirm card appears with "Plant Here" button
```

---

## 6. User Flows

### Flow 1: First-Time User

```
1. Load /
2. See AuthModal
3. Click "New Garden" tab
4. Enter garden name, email, password
5. Submit → "Check your email to confirm!" toast
6. (Confirm email in real life)
7. Sign in
8. See GardenPlacement (if no garden exists)
9. Click map to select location
10. Click "🌱 Plant Here"
11. See Main App with garden panel
12. Click "🌱 Plant a flower"
13. Select flower from picker
14. See flower added to garden strip
```

### Flow 2: Returning User

```
1. Load /
2. If session exists → skip AuthModal
3. If garden exists → see Main App immediately
4. Map shows with gardens and bee flows
```

### Flow 3: Demo / Guest Mode

```
1. Load /
2. See AuthModal
3. Click "Explore without an account"
4. See Main App with demo data
5. All features work except persistence
```

### Flow 4: Onboarding

```
1. New user signs up
2. OnboardingFlow appears (isOnboarding = true)
3. Step 0: "Welcome to HIVE" → click "Continue"
4. Step 1: "Where should your garden bloom?" → "Continue"
5. Step 2: "Plant something" → "Continue"
6. Step 3: "A visitor found you" → "Continue"
7. Step 4: "Your hive made its first honey" → "Start your garden"
8. Onboarding closes (isOnboarding = false)
```

### Flow 5: Mobile Navigation

```
1. Main App on mobile viewport (< 1024px)
2. BottomNav visible at bottom
3. Tap "🏡 Garden" → GardenSheet slides up (ui.openSheet = 'garden')
4. Tap "🌱 Plant a flower" → FlowerPickerSheet opens
5. Tap flower → planted, sheet closes
6. Tap "👤 Profile" → ProfileSheet opens
7. Tap outside or back → sheet closes
```

### Flow 6: Desktop Navigation

```
1. Main App on desktop viewport (≥ 1024px)
2. Left panel shows GardenPanel by default
3. Click "📖 Journal" in left panel → JournalPanel replaces GardenPanel
4. Click "👤 Profile" → ProfilePanel appears
5. Click "🌍 World" → returns to GardenPanel
```

---

## 7. Key UI Elements & Selectors

### 7.1 Global Elements

| Element | Selector Strategy |
|---------|-------------------|
| Toast notification | `[class*="HiveToast"]` or `div:has-text("toast text")` |
| Discovery card | `[class*="DiscoveryCard"]` |
| Event banner | `[class*="EventBanner"]` |
| Loading overlay | `div:has-text("Exploring the meadow")` |

### 7.2 Auth Modal

| Element | Selector |
|---------|----------|
| Modal container | `.fixed.inset-0` (highest z-index) |
| Sign In tab | `button:has-text("Sign In")` |
| New Garden tab | `button:has-text("New Garden")` |
| Email input | `input[type="email"]` |
| Password input | `input[type="password"]` |
| Garden name input | `input[type="text"]` (signup only) |
| Submit button | `button[type="submit"]` or `button:has-text("Sign In")` |
| Magic link | `button:has-text("magic link")` |
| Skip auth | `button:has-text("Explore without")` |
| Error message | `div[class*="bg-hive-coral"]` |

### 7.3 Garden Panel (Desktop)

| Element | Selector |
|---------|----------|
| Garden name | `h2:has-text("garden name")` |
| Bloom label | `p:has-text("Bloom:")` |
| Bee count | `div:has-text("Bees")` |
| Honey count | `div:has-text("Honey")` |
| Flower count | `div:has-text("Flowers")` |
| Flower strip | `.flex.gap-2` with flower icons |
| Plant button | `button:has-text("Plant a flower")` |
| Available slots | `p:has-text("slots available")` |
| Nearby garden item | `div[class*="hive-card"]:has(.truncate)` |

### 7.4 Bottom Navigation (Mobile)

| Element | Selector |
|---------|----------|
| Nav container | `nav.hive-card` |
| World tab | `button:has-text("World")` |
| Garden tab | `button:has-text("Garden")` |
| Journal tab | `button:has-text("Journal")` |
| Profile tab | `button:has-text("Profile")` |

### 7.5 Stats Pills

| Element | Selector |
|---------|----------|
| Honey pill | `div:has-text("🍯")` |
| Flower pill | `div:has-text("🌼")` |
| Bee pill | `div:has-text("🐝")` |

### 7.6 Flower Picker Sheet

| Element | Selector |
|---------|----------|
| Sheet container | `[class*="FlowerPickerSheet"]` or `.hive-sheet` |
| Flower option | `button` or `div` containing flower emoji + name |
| Close button | `button:has-text("Close")` or back arrow |

### 7.7 How to Play Page (`/how-to-play`)

| Element | Selector |
|---------|----------|
| Page heading | `h1:has-text("How to Play HIVE")` |
| Section heading | `h2:has-text("The Core Loop")` |
| Back button | `a[href="/"]` or `button:has-text("Back to Game")` |
| CTA button | `a:has-text("Start Your Garden")` |


---

## 8. Map Testing Strategies

### 8.1 Waiting for Map Readiness

```javascript
// Wait for loading overlay to disappear
await page.waitForSelector('div:has-text("Exploring the meadow")', { state: 'hidden' });

// Or wait for map canvas to be ready
await page.waitForSelector('.maplibregl-canvas', { state: 'visible' });
```

### 8.2 Programmatic Map Control

```javascript
// Set map center and zoom directly
await page.evaluate(() => {
  if (window.__mapInstance) {
    window.__mapInstance.flyTo({ center: [5.12, 52.09], zoom: 14 });
  }
});
```

**Note:** The map instance is NOT currently exposed on `window`. For testing, add:

```ts
// In useHiveMap.ts, after creating map:
if (typeof window !== 'undefined') {
  (window as any).__mapInstance = map;
}
```

### 8.3 Simulating Map Interactions

```javascript
// Click on map (during placement)
const mapContainer = page.locator('.maplibregl-canvas');
await mapContainer.click();

// Drag to pan
await page.mouse.move(400, 300);
await page.mouse.down();
await page.mouse.move(200, 300);
await page.mouse.up();

// Zoom with scroll
await page.mouse.wheel(0, -500);  // zoom in
await page.mouse.wheel(0, 500);   // zoom out

// Wait for debounced fetch
await page.waitForTimeout(400);
```

### 8.4 Verifying Map Content

```javascript
// Check garden markers exist
const markers = page.locator('.hive-garden-marker');
await expect(markers).toHaveCount.greaterThan(0);

// Check bee flow layer exists
const hasBeeLayer = await page.evaluate(() => {
  const map = (window as any).__mapInstance;
  return map?.getLayer('bee-flows') != null;
});
expect(hasBeeLayer).toBe(true);

// Check a specific marker label
await expect(page.locator('.hive-garden-marker')).toContainText('My Garden');
```

---

## 9. Responsive Breakpoints

| Breakpoint | Layout | Key Difference |
|------------|--------|---------------|
| `< 1024px` | Mobile | Bottom nav + sheets, single column |
| `≥ 1024px` | Desktop | Side panels + map, three columns |

```javascript
// Mobile
await page.setViewportSize({ width: 375, height: 812 });

// Desktop
await page.setViewportSize({ width: 1440, height: 900 });
```

---

## 10. Animation & Timing

| Animation | Duration | CSS Class |
|-----------|----------|-----------|
| Toast | 3000ms auto-dismiss | — |
| Discovery card | 4000ms auto-dismiss | — |
| Onboarding transitions | — | `animate-hive-bob`, `animate-hive-float` |
| Garden marker hover | 200ms | `transition: transform 0.2s ease` |
| Map flyTo | 1500ms | MapLibre built-in |
| Bee flow progress | Continuous (rAF) | — |
| Loading bob | Infinite | `animate-hive-bob` |

---

## 11. Dev Mode Shortcut

When `NUXT_PUBLIC_DEV_MODE=true`:
- Auth is skipped
- Onboarding is skipped
- Demo player is initialized
- Demo gardens load immediately
- Bee animation starts immediately

**Use this for faster testing.** Set the env var before running the dev server.

---

## 12. Test Data & Fixtures

### Demo Garden

```ts
{
  id: 'garden-player',
  name: 'My Garden',
  lat: 52.09,
  lng: 5.12,
  flowerCount: 3,
  beeCount: 12,
  bloomScore: 45
}
```

### Demo Hive

```ts
{
  population: 50,
  honey: 34,
  nectar: 12,
  pollen: 8,
  maxFlowerSlots: 3
}
```

### Flower Species (8 total)

| ID | Name | Emoji | Trait |
|----|------|-------|-------|
| `clover` | Clover | 🍀 | Reliable |
| `lavender` | Lavender | 💜 | Fragrant |
| `sunflower` | Sunflower | 🌻 | Abundant |
| `wild-daisy` | Wild Daisy | 🌼 | Diversity |
| `poppy` | Poppy | 🌺 | Burst |
| `mint-bloom` | Mint Bloom | 🌿 | Weather |
| `moonflower` | Moonflower | 🌙 | Nocturnal |
| `golden-aster` | Golden Aster | ✨ | Rare |

---

## 13. Common Testing Pitfalls

1. **SSR is disabled** — The app is a pure SPA. Wait for Vue to hydrate before asserting DOM state.
2. **Map loading delay** — The map takes time to initialize. Always wait for the loading overlay to disappear.
3. **Debounced fetches** — Map moveend has a 300ms debounce. Add a small wait after panning/zooming.
4. **Auto-dismissing toasts** — Toasts disappear after 3s. Assert them quickly or use `waitForSelector` with a timeout.
5. **Conditional sheets** — Mobile sheets only render when `ui.openSheet` matches. Trigger the correct nav action first.
6. **Dev mode bypasses auth** — If testing auth flows, ensure dev mode is OFF.
7. **Realtime subscriptions** — Tests may need to mock or wait for Supabase Realtime events.
8. **H3 cell snapping** — Garden placement snaps to H3 grid centers, not exact click coordinates.

---

## 14. File Locations

| File | Path |
|------|------|
| Main page | `pages/index.vue` |
| How to Play | `pages/how-to-play.vue` |
| App shell | `app.vue` |
| Map component | `components/map/HiveMap.vue` |
| Map composable | `composables/useHiveMap.ts` |
| Auth modal | `components/ui/AuthModal.vue` |
| Onboarding | `components/onboarding/OnboardingFlow.vue` |
| Garden placement | `components/garden/GardenPlacement.vue` |
| Garden panel | `components/garden/GardenPanel.vue` |
| Bottom nav | `components/garden/BottomNav.vue` |
| App header | `components/ui/AppHeader.vue` |
| Activity feed | `components/garden/ActivityFeed.vue` |
| Player store | `stores/player.ts` |
| Garden store | `stores/garden.ts` |
| World store | `stores/world.ts` |
| UI store | `stores/ui.ts` |
| Config | `nuxt.config.ts` |
| Styles | `assets/css/main.css` |


