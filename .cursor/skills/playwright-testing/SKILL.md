---
name: playwright-testing
description: Write and run Playwright E2E tests for the HIVE Nuxt 3 game. Use when asked to test the app, write browser automation, verify UI flows, or debug rendering issues via automated screenshots and assertions. Covers auth, onboarding, map interaction, garden placement, and responsive layouts.
disable-model-invocation: true
---

# Playwright Testing for HIVE

## Purpose

This skill helps write, run, and debug Playwright E2E tests for the HIVE multiplayer garden game. It codifies the app structure, selectors, state transitions, and testing patterns from `docs/playwright-testing-guide.md`.

## Quick Start

1. Ensure the dev server is running on `http://localhost:3000`
2. Install Playwright if not present: `npm install -D @playwright/test`
3. Write tests in `e2e/*.spec.ts`
4. Run: `npx playwright test`

## Dev Mode Shortcut

Set `NUXT_PUBLIC_DEV_MODE=true` in `.env` to skip auth and onboarding for faster map-focused tests. See §11 of [reference.md](reference.md).

## Test File Structure

```
e2e/
├── auth.spec.ts          # Sign in, sign up, skip, magic link
├── onboarding.spec.ts    # 5-step onboarding flow
├── garden-placement.spec.ts  # First-time garden placement
├── map.spec.ts           # Map rendering, pan, zoom, markers, bee flows
├── main-app-desktop.spec.ts  # Panels, navigation, flower planting
├── main-app-mobile.spec.ts   # Bottom nav, sheets
├── responsive.spec.ts    # Breakpoint switching
└── utils.ts              # Shared helpers (waitForMapReady, etc.)
```

## Critical Rules

1. **SSR is disabled** — Wait for Vue hydration. Use `page.waitForLoadState('networkidle')` after navigation.
2. **Map loading delay** — Always wait for the loading overlay to disappear before interacting with the map.
3. **Debounced fetches** — After panning/zooming, wait 400ms for the 300ms debounce on garden fetches.
4. **Auto-dismissing toasts** — Toasts vanish after 3s. Assert quickly or test absence after timeout.
5. **Dev mode bypasses auth** — If testing auth flows, ensure `NUXT_PUBLIC_DEV_MODE` is NOT set.
6. **Map instance access** — The MapLibre instance is not exposed on `window` by default. To enable programmatic control, add `(window as any).__mapInstance = map` in `composables/useHiveMap.ts` after map creation.

## Key Selectors

| Element | Selector |
|---------|----------|
| Auth modal | `.fixed.inset-0.z-\[200\]` |
| Sign In tab | `button:has-text("Sign In")` |
| New Garden tab | `button:has-text("New Garden")` |
| Email input | `input[type="email"]` |
| Password input | `input[type="password"]` |
| Submit button | `button[type="submit"]` |
| Skip auth | `button:has-text("Explore without")` |
| Onboarding container | `.fixed.inset-0.z-\[200\]` |
| Onboarding CTA | `button:has-text("Continue")` or `button:has-text("Start your garden")` |
| Garden placement overlay | `[class*="z-[150]"]` |
| Plant Here button | `button:has-text("Plant Here")` |
| Map canvas | `.maplibregl-canvas` |
| Loading overlay | `div:has-text("Exploring the meadow")` |
| Garden marker | `.hive-garden-marker` |
| Garden marker inner | `.garden-marker-inner` |
| Plant a flower button | `button:has-text("Plant a flower")` |
| Bottom nav (mobile) | `nav.hive-card` |
| Mobile sheet | `[class*="FlowerPickerSheet"]` or `.hive-sheet` |
| Toast | `[class*="HiveToast"]` |
| Discovery card | `[class*="DiscoveryCard"]` |
| Event banner | `[class*="EventBanner"]` |

## Map Testing Helpers

```ts
// utils.ts
export async function waitForMapReady(page: Page) {
  await page.waitForSelector('div:has-text("Exploring the meadow")', { state: 'hidden' });
  await page.waitForSelector('.maplibregl-canvas', { state: 'visible' });
}

export async function setMapCenter(page: Page, center: [number, number], zoom: number) {
  await page.evaluate(({ center, zoom }) => {
    (window as any).__mapInstance?.flyTo({ center, zoom });
  }, { center, zoom });
}

export async function clickMap(page: Page, x = 400, y = 300) {
  const canvas = page.locator('.maplibregl-canvas');
  await canvas.click({ position: { x, y } });
}
```

## Responsive Viewports

```ts
const viewports = {
  mobile: { width: 375, height: 812 },
  desktop: { width: 1440, height: 900 },
};
```

## State Transition Cheat Sheet

```
[Load App]
   │
   ├─► Dev mode ──► Main App (demo data)
   │
   ├─► No session ──► AuthModal
   │      │
   │      ├─► Sign In / Sign Up ──► authenticated ──► check garden
   │      │
   │      └─► "Explore without account" ──► demo mode ──► Main App
   │
   ├─► Has session, no garden ──► GardenPlacement
   │      │
   │      ├─► Click map → Confirm ──► Main App
   │      └─► Cancel ──► demo mode ──► Main App
   │
   └─► Has session + has garden ──► Main App
```

## Additional Resources

- Full app structure and selectors: [reference.md](reference.md)
- Example test implementations: [examples.md](examples.md)
- Original guide: `docs/playwright-testing-guide.md`
