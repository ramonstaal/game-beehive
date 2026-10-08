# Playwright Test Examples for HIVE

## Setup: `e2e/utils.ts`

```ts
import { Page, Locator, expect } from '@playwright/test';

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

export async function dismissOnboarding(page: Page) {
  const skip = page.locator('button:has-text("Skip")');
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
  }
}

export const viewports = {
  mobile: { width: 375, height: 812 },
  desktop: { width: 1440, height: 900 },
};
```

---

## Smoke Tests: `e2e/smoke.spec.ts`

```ts
import { test, expect } from '@playwright/test';
import { waitForMapReady } from './utils';

test.describe('Smoke Tests', () => {
  test('page loads without errors', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await expect(page.locator('.hive-app')).toBeVisible();
  });

  test('map renders and becomes interactive', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await waitForMapReady(page);
    const canvas = page.locator('.maplibregl-canvas');
    await expect(canvas).toBeVisible();
  });

  test('How to Play page loads', async ({ page }) => {
    await page.goto('http://localhost:3000/how-to-play');
    await expect(page.locator('h1:has-text("How to Play HIVE")')).toBeVisible();
  });
});
```

---

## Auth Flow Tests: `e2e/auth.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('auth modal appears for unauthenticated users', async ({ page }) => {
    const authModal = page.locator('.fixed.inset-0.z-\\[200\\]');
    await expect(authModal).toBeVisible();
  });

  test('can switch between Sign In and New Garden tabs', async ({ page }) => {
    await page.locator('button:has-text("New Garden")').click();
    await expect(page.locator('input[type="text"]')).toBeVisible();

    await page.locator('button:has-text("Sign In")').click();
    await expect(page.locator('input[type="text"]')).not.toBeVisible();
  });

  test('sign up form validates required fields', async ({ page }) => {
    await page.locator('button:has-text("New Garden")').click();
    await page.locator('button[type="submit"]').click();

    const error = page.locator('div[class*="bg-hive-coral"]');
    await expect(error).toBeVisible();
  });

  test('skip auth enters demo mode', async ({ page }) => {
    await page.locator('button:has-text("Explore without")').click();
    await expect(page.locator('.maplibregl-canvas')).toBeVisible();
    await expect(page.locator('.fixed.inset-0.z-\\[200\\]')).not.toBeVisible();
  });
});
```

---

## Onboarding Tests: `e2e/onboarding.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('all 5 steps render correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    // Trigger onboarding (e.g., sign up)
    // ...auth flow to reach onboarding...

    const dots = page.locator('.absolute.top-6.left-1\\/2 >> div');
    await expect(dots).toHaveCount(5);

    for (let i = 0; i < 4; i++) {
      await page.locator('button:has-text("Continue")').click();
      await page.waitForTimeout(300);
    }

    await page.locator('button:has-text("Start your garden")').click();
    await expect(page.locator('.fixed.inset-0.z-\\[200\\]')).not.toBeVisible();
  });

  test('skip button exits onboarding', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    // ...reach onboarding state...

    await page.locator('button:has-text("Skip")').click();
    await expect(page.locator('.fixed.inset-0.z-\\[200\\]')).not.toBeVisible();
  });
});
```

---

## Garden Placement Tests: `e2e/garden-placement.spec.ts`

```ts
import { test, expect } from '@playwright/test';
import { waitForMapReady, clickMap } from './utils';

test.describe('Garden Placement', () => {
  test('placement overlay shows on first visit', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    // Authenticate with new user who has no garden...
    await expect(page.locator('p:has-text("Place Your Garden")')).toBeVisible();
  });

  test('clicking map updates location and shows confirm card', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await waitForMapReady(page);

    await clickMap(page);
    await expect(page.locator('button:has-text("Plant Here")')).toBeVisible();
  });

  test('Plant Here button creates garden', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await waitForMapReady(page);

    await clickMap(page);
    await page.locator('button:has-text("Plant Here")').click();

    await expect(page.locator('h2:has-text("My Garden")')).toBeVisible();
  });
});
```

---

## Map Interaction Tests: `e2e/map.spec.ts`

```ts
import { test, expect } from '@playwright/test';
import { waitForMapReady, setMapCenter } from './utils';

test.describe('Map Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await waitForMapReady(page);
  });

  test('map pans on drag', async ({ page }) => {
    const canvas = page.locator('.maplibregl-canvas');
    const box = await canvas.boundingBox();

    await page.mouse.move(box!.x + 400, box!.y + 300);
    await page.mouse.down();
    await page.mouse.move(box!.x + 200, box!.y + 300);
    await page.mouse.up();

    await page.waitForTimeout(400);
  });

  test('map zooms on scroll wheel', async ({ page }) => {
    const canvas = page.locator('.maplibregl-canvas');
    await canvas.hover();
    await page.mouse.wheel(0, -500);
    await page.waitForTimeout(400);
  });

  test('garden markers are clickable', async ({ page }) => {
    await page.waitForTimeout(1000);
    const markers = page.locator('.hive-garden-marker');
    const count = await markers.count();

    if (count > 0) {
      await markers.first().click();
      await expect(page.locator('[class*="HiveToast"]')).toBeVisible();
    }
  });

  test('bee flow layer renders', async ({ page }) => {
    const hasBeeLayer = await page.evaluate(() => {
      return (window as any).__mapInstance?.getLayer('bee-flows') != null;
    });
    expect(hasBeeLayer).toBe(true);
  });

  test('viewport change loads new gardens after debounce', async ({ page }) => {
    await setMapCenter(page, [5.12, 52.09], 14);
    await page.waitForTimeout(500);

    const markers = page.locator('.hive-garden-marker');
    // Assert marker count or specific garden presence
  });
});
```

---

## Main App Tests (Desktop): `e2e/main-app-desktop.spec.ts`

```ts
import { test, expect } from '@playwright/test';
import { waitForMapReady, viewports } from './utils';

test.describe('Main App — Desktop', () => {
  test.use({ viewport: viewports.desktop });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await waitForMapReady(page);
  });

  test('side panels render', async ({ page }) => {
    await expect(page.locator('[class*="GardenPanel"]')).toBeVisible();
    await expect(page.locator('[class*="ActivityFeed"]')).toBeVisible();
  });

  test('navigation switches between views', async ({ page }) => {
    await page.locator('button:has-text("Journal")').click();
    await expect(page.locator('[class*="JournalPanel"]')).toBeVisible();

    await page.locator('button:has-text("Profile")').click();
    await expect(page.locator('[class*="ProfilePanel"]')).toBeVisible();

    await page.locator('button:has-text("World")').click();
    await expect(page.locator('[class*="GardenPanel"]')).toBeVisible();
  });

  test('plant flower button opens picker', async ({ page }) => {
    await page.locator('button:has-text("Plant a flower")').click();
    await expect(page.locator('[class*="FlowerPickerSheet"], .hive-sheet')).toBeVisible();
  });

  test('stats pills are visible', async ({ page }) => {
    await expect(page.locator('div:has-text("🍯")').first()).toBeVisible();
    await expect(page.locator('div:has-text("🌼")').first()).toBeVisible();
    await expect(page.locator('div:has-text("🐝")').first()).toBeVisible();
  });
});
```


---

## Main App Tests (Mobile): `e2e/main-app-mobile.spec.ts`

```ts
import { test, expect } from '@playwright/test';
import { waitForMapReady, viewports } from './utils';

test.describe('Main App — Mobile', () => {
  test.use({ viewport: viewports.mobile });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await waitForMapReady(page);
  });

  test('bottom nav renders', async ({ page }) => {
    await expect(page.locator('nav.hive-card')).toBeVisible();
  });

  test('tapping Garden opens sheet', async ({ page }) => {
    await page.locator('button:has-text("Garden")').click();
    await expect(page.locator('[class*="GardenSheet"]')).toBeVisible();
  });

  test('tapping Journal opens sheet', async ({ page }) => {
    await page.locator('button:has-text("Journal")').click();
    await expect(page.locator('[class*="JournalSheet"]')).toBeVisible();
  });

  test('tapping Profile opens sheet', async ({ page }) => {
    await page.locator('button:has-text("Profile")').click();
    await expect(page.locator('[class*="ProfileSheet"]')).toBeVisible();
  });

  test('stats pills visible in top bar', async ({ page }) => {
    await expect(page.locator('div:has-text("🍯")').first()).toBeVisible();
    await expect(page.locator('div:has-text("🌼")').first()).toBeVisible();
  });
});
```

---

## Responsive Tests: `e2e/responsive.spec.ts`

```ts
import { test, expect } from '@playwright/test';
import { waitForMapReady, viewports } from './utils';

test.describe('Responsive Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await waitForMapReady(page);
  });

  test('mobile layout shows bottom nav', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await expect(page.locator('nav.hive-card')).toBeVisible();
    await expect(page.locator('.lg\\:flex')).not.toBeVisible();
  });

  test('desktop layout shows side panels', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await expect(page.locator('.lg\\:flex')).toBeVisible();
    await expect(page.locator('nav.hive-card')).not.toBeVisible();
  });

  test('map remains interactive after resize', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await waitForMapReady(page);
    const canvas = page.locator('.maplibregl-canvas');
    await expect(canvas).toBeVisible();

    await page.setViewportSize(viewports.mobile);
    await waitForMapReady(page);
    await expect(canvas).toBeVisible();
  });
});
```

---

## Dev Mode Tests: `e2e/dev-mode.spec.ts`

```ts
import { test, expect } from '@playwright/test';
import { waitForMapReady } from './utils';

test.describe('Dev Mode Shortcut', () => {
  test('dev mode skips auth and onboarding', async ({ page }) => {
    // Assumes NUXT_PUBLIC_DEV_MODE=true is set in .env
    await page.goto('http://localhost:3000/');
    await waitForMapReady(page);

    // Auth modal should NOT be visible
    await expect(page.locator('.fixed.inset-0.z-\\[200\\]')).not.toBeVisible();

    // Main app should be visible
    await expect(page.locator('.maplibregl-canvas')).toBeVisible();
    await expect(page.locator('[class*="GardenPanel"]')).toBeVisible();
  });

  test('dev mode loads demo gardens', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await waitForMapReady(page);
    await page.waitForTimeout(1000);

    const markers = page.locator('.hive-garden-marker');
    await expect(markers.first()).toBeVisible();
  });
});
```

---

## Playwright Config: `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

