---
name: svg-sprite-splitter
description: Split a combined SVG that contains a grid of separate illustrations (e.g. flower growth stages, character pose sheets) into individual standalone SVG files. Use when the user provides one SVG containing multiple drawings arranged in a grid and wants them separated into per-cell SVG files.
---

# SVG Sprite Splitter

Split one combined SVG containing multiple illustrations arranged in a grid into standalone per-cell SVG files.

## Quick Start

Use the bundled script (stdlib only, no dependencies):

```bash
python3 .cursor/skills/svg-sprite-splitter/scripts/split_svg_grid.py INPUT.svg \
    --rows 2 --cols 3 \
    --row-names clover,lavender \
    --col-names seedling,bloom,wilted \
    --anchor-fill '#DEC8A4' \
    --out-dir assets/img/flowers --prefix flower-
```

Output files are named `<prefix><row-name>-<col-name>.svg`, each with a fitted `viewBox` and the source `<defs>` (gradients) carried over.

## Key Options

- `--anchor-fill COLOR` — use when every cell contains a repeated "anchor" shape with a known fill color (e.g. ground-shadow ellipses under each flower). This gives the most robust grid detection. Omit it to divide the viewBox evenly into rows × cols instead.
- `--pad N` — padding in px around each output viewBox (default 2).
- Row names are top→bottom, column names left→right.

## Non-obvious pitfalls (learned the hard way — do not skip)

1. **Never extract coordinates by naively pairing all numbers in path `d` attributes.** Generated SVGs (e.g. from QuiverAI) use *relative* path commands; naive pairing produces completely wrong bounding boxes. The script contains a full path walker (`path_points`) that resolves relative `m/c/l/h/v/s/q/a` commands to absolute points — reuse it.
2. **Assign shapes to cells by cluster, not individually.** Floating details (blossoms, sparkles, glow circles) sit far above their stem and get misassigned to the row above if grouped by centroid. The script first merges shapes whose bounding boxes (nearly) touch into clusters, then assigns each whole cluster to the nearest cell.
3. **Skip `<rect>` elements** — they are usually full-canvas backgrounds.
4. **Keep anchor shapes in the output** (e.g. the soil mound/shadow): they preserve the intended anchor point (bottom-center for flowers per `docs/ASSETS.md`).

## Verification (always do this)

After splitting, generate a contact sheet and inspect it visually in the browser:

```bash
python3 -c "
import glob
files = sorted(glob.glob('<out-dir>/<prefix>*.svg'))
html = '<html><body style=\"background:#FFF9ED;font-family:monospace\">'
for f in files:
    n = f.split('/')[-1]
    html += f'<div style=\"display:inline-block;text-align:center;margin:8px;border:1px solid #ccc;padding:4px\"><img src=\"file://{f}\" style=\"height:140px\"><br>{n}</div>'
open('/tmp/split_preview.html','w').write(html + '</body></html>')"
```

Open `/tmp/split_preview.html` with the chrome-devtools tools and screenshot it. Check that every cell contains exactly one complete illustration with no fragments from neighboring cells. Use absolute `file://` paths in the img tags — relative paths from /tmp will not load.
