# HIVE — Game Asset List & Art Direction

**Purpose:** This document lists every visual asset needed for HIVE, with detailed descriptions so each image can be created independently (vector → SVG, or raster → PNG @2x) while keeping one consistent look across the game.

---

# 1. GLOBAL STYLE GUIDE

Apply these rules to **every** asset so the whole game feels like one cohesive world.

## 1.1 Art style

- **Flat vector illustration with soft, rounded shapes.** No hard geometric edges, no pixel art, no photorealism.
- **Slightly "hand-drawn" warmth:** minor asymmetry and organic curves are welcome — the game should feel joyful and tactile, not sterile.
- **Thick friendly outlines:** consistent stroke width of 2–4px at base size, using the ink color (below). Round all stroke caps and joins.
- **Minimal shading:** one soft highlight (lighter tint of the base color, top-left) and optionally one soft shadow tint (bottom-right). No gradients except gentle radial glows for "rare" or "night" items.
- **Soft drop shadows** only where the asset sits on the map (bees, hives, garden markers): a small blurred ellipse under the object, not a hard offset shadow.
- **Personality > accuracy:** bees and flowers should feel like characters — chubby, cheerful, a little cute.

## 1.2 Color palette

Use the game's existing palette (from `tailwind.config.js`). Stay within these colors plus tints/shades of them:

| Token | Hex | Usage |
|---|---|---|
| `hive-cream` | `#FFF9ED` | Backgrounds, light fills |
| `hive-honey` | `#F6C344` | Bees, honey, highlights, primary accent |
| `hive-honey-light` | `#FADD7A` | Highlights, glows |
| `hive-honey-dark` | `#D4A020` | Bee stripes, shading |
| `hive-leaf` | `#67A85B` | Stems, leaves |
| `hive-leaf-deep` | `#376847` | Dark foliage, deep accents |
| `hive-leaf-light` | `#8BC97F` | Leaf highlights, fresh growth |
| `hive-sky` | `#A9D9EA` | Sky/water cues, wings, night-bloom glows |
| `hive-coral` | `#F28C72` | Warm accents (poppy, coral details) |
| `hive-lavender` | `#B7A6DD` | Lavender flower, dusk/magic accents |
| `hive-ink` | `#25352D` | Outlines, eyes, dark details |
| `hive-ink-light` | `#4A5E54` | Secondary outlines/details |
| `hive-earth` | `#C4A882` | Soil, wood, hive bodies |

Petal colors for specific flowers (red poppy, white daisy, golden aster) may go slightly outside the palette, but keep saturation soft and warm — never neon.

## 1.3 Canvas, sizing & anchoring

| Asset type | Canvas | Anchor point |
|---|---|---|
| Icons (UI, nav, weather, resources) | 64×64 px, ~10% padding | Center |
| Flowers (per growth stage) | 128×128 px | **Bottom-center of stem** (so they "grow" from a point on the map) |
| Bees | 96×64 px (side view) | Center of body |
| Hives / garden markers | 128×128 px | Bottom-center (base sits on the map) |
| Illustrations (onboarding, journal, empty states) | 512×384 px | n/a |
| Patterns | 128×128 px, tileable | n/a |

## 1.4 Export requirements

- **SVG preferred** for all icons, flowers, bees and markers (they must scale across map zoom levels). Expand strokes, no external fonts, no raster embeds.
- **PNG @2x with transparent background** for painted/textured illustrations.
- File naming: `kebab-case`, e.g. `flower-sunflower-bloom.svg`, `bee-worker-fly-1.svg`.
- Every animated asset: deliver as separate frames (not spritesheets).
- Assets must remain legible at **24–32 px** — test by zooming out. If detail disappears, simplify.
- The map behind assets can be dark or light: every map asset needs either the ink outline or a subtle light halo so it reads on both.

## 1.5 Mood reference

Cozy nature sim meets storybook: warm morning light, community garden, children's-book bees. Calm, kind, a little magical at night.

---

# 2. FLOWERS — highest priority

Flowers currently render as emoji (`visual_key` in the `flower_species` table); these assets replace them.

**Each flower needs 3 stages:** `seedling` (small sprout, 2 leaves), `bloom` (full flower, the main asset), `wilted` (drooping, desaturated — low opacity version is acceptable).

## 2.1 Clover — `clover` (common)
Three rounded green heart-shaped leaflets on a thin stem, with a small cluster of tiny pinkish-white pom-pom blossoms. Humble and friendly; the "first flower" of the game. Colors: `leaf`, `leaf-light`, cream-white blossom.

## 2.2 Lavender — `lavender` (common)
3–5 tall thin green stems topped with elongated purple bud spikes (small overlapping rounded segments). Slight sway curve in the stems. Colors: `lavender` with a deeper purple shade, `leaf-deep` stems. Should feel fragrant and calm.

## 2.3 Sunflower — `sunflower` (common)
One large flower head: ring of pointed-oval golden petals around a big dark-brown seeded center (subtle spiral dot texture), thick sturdy stem with 2 broad leaves. The boldest common flower; must read clearly at 24px. Colors: `honey`, `honey-dark`, warm brown center.

## 2.4 Wild Daisy — `wild-daisy` (common)
Loose cluster of 2–3 small flowers on thin slightly crooked stems: simple white rounded petals around a `honey` yellow center. Cheerfully imperfect — vary petal counts and angles.

## 2.5 Poppy — `poppy` (uncommon)
Single cup-shaped bloom of 4–6 large overlapping soft-red petals (use `coral` warmed toward red) with a dark center and visible stamen dots. Thin, slightly hairy stem, one small leaf. Dramatic but delicate.

## 2.6 Mint Bloom — `mint-bloom` (uncommon)
Low bushy plant: several pairs of rounded serrated mint leaves (`leaf`, `leaf-light`) with a short spike of tiny pale-white/lilac flowers at the top. Fresh and cool-toned.

## 2.7 Moonflower — `moonflower` (rare)
Large luminous white/pale-blue trumpet-shaped bloom opening toward the viewer, on a curling night vine with dark leaves (`leaf-deep`, `ink-light`). **Soft radial glow** in `sky` around the petals. This is the night-time showpiece — it should look gently magical.

## 2.8 Golden Aster — `golden-aster` (rare)
Starburst flower: many thin golden petals radiating from a warm orange center, on an elegant branching stem with small secondary buds. Add 2–3 tiny sparkle accents (`honey-light` four-point stars) around it. The most precious-looking flower.

---

# 3. BEES — animated map agents

All bees: chubby oval body, `honey` yellow with `ink` stripes, tiny smiling face (two dot eyes, small curve smile optional), translucent oval wings in `sky`-tinted white at ~50% opacity, soft map shadow ellipse.

## 3.1 Worker bee — `bee-worker`
Default flying bee, side view. **Frames:** `fly-1` (wings up), `fly-2` (wings down), plus an `idle` sitting/resting pose for garden scenes. Body slightly tilted forward in flight.

## 3.2 Worker bee with pollen — `bee-worker-pollen`
Same as worker but with two visible golden pollen sacs on the hind legs. Signals "returning to the hive".

## 3.3 Queen bee — `bee-queen`
Noticeably larger, elongated abdomen, tiny golden crown. Used in hive UI and special moments.

## 3.4 Blue mason bee — `bee-mason`
Rare variant: rounder, fuzzier body in muted blue-teal instead of yellow. Solo gentle explorer personality.

## 3.5 Ghost bee — `bee-ghost`
Night/rare variant: pale white-lavender translucent body with a soft glow, paired with Moonflower discoveries. Mysterious, not spooky.

## 3.6 Bee trail — `fx-trail`
Curved dashed flight path decoration: small fading dots or tiny petals along a curve, in `honey-light`. Used by the map layer to visualize bee routes.

## 3.7 Pollination puff — `fx-puff`
Small burst of 5–7 golden sparkle dots/pollen grains. Plays when a bee visits a flower.

---

# 4. HIVE & GARDEN

## 4.1 Beehive, 3 tiers — `hive-1`, `hive-2`, `hive-3`
Classic rounded skep (straw coil) shape in `earth`/`honey-dark` tones with a small dark entrance hole and 1–2 tiny bees circling.
- Tier 1: small plain skep.
- Tier 2: larger, with a wooden stand and a small flower planted beside it.
- Tier 3: grand hive with bunting/flag or golden band, subtle glow.
Each tier should be recognizably "the same home, but improved".

## 4.2 Garden plot marker — `garden-plot`
Small top-down-ish rounded-corner garden bed: `earth` soil with a wooden border fence, 2–3 tiny sprouts. Doubles as the H3-cell badge for a player's garden on the map.

## 4.3 Honey jar — `res-honey`
Squat glass jar of golden honey with a wooden dipper or cloth lid. Resource/currency icon for harvests.

## 4.4 Nectar drop — `res-nectar`
Single glossy droplet in `honey` with a light highlight. Resource icon.

## 4.5 Pollen — `res-pollen`
Small cluster of 3 golden grains/sparkles. Resource icon.

## 4.6 Seed packet — `res-seeds`
Small paper packet in `cream` with a tiny flower illustration printed on it, slightly tilted. Used in the planting flow (FlowerPickerSheet).

---

# 5. MAP & ENVIRONMENT

## 5.1 Weather icons (64×64, friendly rounded style)
- `weather-sunny` — simple sun, `honey` with short rounded rays
- `weather-cloudy` — soft puffy cloud, cream/white with `ink-light` outline
- `weather-rain` — cloud with 3 rounded raindrops in `sky`
- `weather-windy` — 2–3 curling wind swirls with a tiny leaf
- `weather-night` — crescent moon in `honey-light` with one small star

## 5.2 Time-of-day icons
`time-dawn` (sun half above horizon line), `time-day` (high sun), `time-dusk` (low orange sun), `time-night` (moon + star). Simple enough to sit inside small pills.

## 5.3 Bloom event ring — `event-bloom`
Soft expanding concentric glow ring with floating petals, `honey-light`/`coral` tints, semi-transparent. Overlaid on map regions during bloom events.

## 5.4 Discovery sparkle — `fx-discovery`
Four-point star burst in `honey-light` with 3–4 smaller satellites. Plays on discoveries.

## 5.5 Migration/flow line decoration — `fx-flow`
Gentle dotted arc ornament (petals or sparkles) used on pollination corridors between gardens.

---

# 6. UI ASSETS

## 6.1 App logo / wordmark — `logo-hive`
"HIVE" in a rounded friendly style (match the Fredoka font feel), with a hexagon containing a tiny bee or flower as the mark. Needs a standalone icon version (`logo-icon`, just the hexagon) for favicons/PWA.

## 6.2 Honeycomb pattern — `pattern-honeycomb`
Tileable 128×128 subtle hexagon outline pattern, `earth` at ~8–10% opacity on cream. Background texture for cards and sheets.

## 6.3 Rarity badges — `badge-common`, `badge-uncommon`, `badge-rare`
Hexagonal badge frames, color-coded: common = `leaf`, uncommon = `sky`/blue, rare = `honey` gold with sparkle. Same shape, increasing ornamentation.

## 6.4 Achievement badges (hexagonal, 64×64)
- `ach-first-bloom` — first flower planted
- `ach-first-visitor` — first bee visit
- `ach-first-harvest` — first honey harvest
- `ach-first-discovery` — first journal discovery
- `ach-pollinator-corridor` — connected two regions
Each: hexagon badge + small emblem illustration inside.

## 6.5 Bottom navigation icons (4, 64×64, consistent stroke)
`nav-map` (folded map or location pin), `nav-garden` (flower bed or trowel), `nav-journal` (open book with a leaf), `nav-profile` (bee face or hive). Line-icon style with `ink` strokes.

## 6.6 Empty state illustrations (512×384)
- `empty-garden` — bare soil patch with a hopeful sprout and a watering can: "nothing planted yet"
- `empty-journal` — open journal with pressed-flower pages and a sleeping bee
- `empty-activity` — quiet hive with a single bee peeking out

## 6.7 Onboarding illustrations (512×384, warm scenes)
1. `onboard-plant` — hand planting a flower into soil on a stylized map
2. `onboard-bee` — bee discovering a blooming garden, motion trail behind it
3. `onboard-thrive` — thriving garden + hive with multiple bees and neighboring gardens connected by flow lines

## 6.8 Discovery card frame — `card-discovery`
Ornamental rounded frame (match `radius-lg` = 24px corners) with a small pressed-flower corner ornament, for journal entries.

---

# 7. NICE-TO-HAVE (V2)

From the design doc's future roadmap — only after the above is done:

| Asset | Notes |
|---|---|
| Garden decorations | Fences, signs, lanterns, bird bath (cosmetics) |
| Player avatar frames | Hexagonal frames in rarity tiers |
| Seasonal event art | Spring festival banner, autumn leaves variant set |
| PWA icon set | 512, 192, apple-touch, maskable (derived from `logo-icon`) |
| Social share card | 1200×630 "Visit my garden" og-image template |

---

# 8. INTEGRATION NOTES (for the dev side)

- Files go into `/public/assets/` (e.g. `/public/assets/flowers/flower-sunflower-bloom.svg`) so they work with static hosting on GitHub Pages.
- The `flower_species.visual_key` column currently holds emoji; it will map to asset paths via a `useFlowerAsset` composable.
- Map layers (`HiveMap.vue`, markers) will swap emoji markers for the SVGs; bees animate via the `fly-1`/`fly-2` frames.
- All animations must respect `prefers-reduced-motion` (already enforced globally in `main.css`).

