#!/usr/bin/env python3
"""Split a combined SVG containing a grid of separate illustrations into
individual standalone SVG files.

How it works:
1. Fully interprets SVG path data (relative and absolute commands) to compute
   true bounding boxes. NEVER pair raw path numbers — generated SVGs almost
   always use relative coordinates and naive pairing produces garbage.
2. Locates grid cells either from repeated "anchor" shapes (e.g. ground-shadow
   ellipses, matched with --anchor-fill) or by evenly dividing the viewBox.
3. Clusters shapes whose bounding boxes (nearly) touch, so floating details
   (blossoms, sparkles, glows) stay glued to their parent illustration even
   when they overlap a neighboring cell.
4. Writes one standalone SVG per cell with a fitted viewBox, carrying over
   <defs> (gradients etc.) from the source.

Usage:
  python3 split_svg_grid.py INPUT.svg --rows 2 --cols 3 \
      --row-names top,bottom --col-names seedling,bloom,wilted \
      [--anchor-fill '#DEC8A4'] [--out-dir DIR] [--prefix flower-]

Only stdlib is required.
"""
import argparse, re, os, sys

NUM = r"-?\d*\.?\d+(?:e-?\d+)?"
CMD_LEN = {"m": 2, "l": 2, "c": 6, "s": 4, "q": 2, "t": 2, "h": 1, "v": 1, "a": 7, "z": 0}


def path_points(d):
    """Walk path data; return absolute points (endpoints + control points)."""
    tokens = re.findall(r"[a-zA-Z]|" + NUM, d)
    pts, i, x, y = [], 0, 0.0, 0.0
    cmd = None
    while i < len(tokens):
        if tokens[i].isalpha():
            cmd = tokens[i]; i += 1
            if cmd.lower() == "z":
                continue
        n = CMD_LEN[cmd.lower()]
        rel = cmd.islower()
        vals = [float(t) for t in tokens[i:i + n]]; i += n
        if cmd.lower() in ("h", "v"):
            if cmd == "h": x += vals[0]
            elif cmd == "H": x = vals[0]
            elif cmd == "v": y += vals[0]
            else: y = vals[0]
            pts.append((x, y))
        else:
            pairs = list(zip(vals[0::2], vals[1::2]))
            for j, (px, py) in enumerate(pairs):
                if rel:
                    px, py = px + x, py + y
                pts.append((px, py))
                if j == len(pairs) - 1:
                    x, y = px, py
    return pts


def parse_elements(svg):
    """Return list of (tag, minx, miny, maxx, maxy, cx, cy). Skips <rect> (background)."""
    elems = []
    for m in re.finditer(r"<(path|ellipse|circle|rect)\b[^>]*/?>", svg):
        tag, kind = m.group(0), m.group(1)
        if kind == "rect":
            continue
        if kind == "path":
            d = re.search(r'\bd="([^"]*)"', tag)
            if not d:
                continue
            pts = path_points(d.group(1))
            if not pts:
                continue
            xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        else:
            cx = float(re.search(r'\bcx="([^"]*)"', tag).group(1))
            cy = float(re.search(r'\bcy="([^"]*)"', tag).group(1))
            rx = float(re.search(r'\brx?="([^"]*)"', tag).group(1))
            ry = float(re.search(r'\bry="([^"]*)"', tag).group(1)) if "ry=" in tag else rx
            xs = [cx - rx, cx + rx]; ys = [cy - ry, cy + ry]
        elems.append((tag, min(xs), min(ys), max(xs), max(ys),
                      (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2))
    return elems


def find_anchors(elems, anchor_fill, rows, cols):
    """Anchor shapes = flat ellipses with a given fill (e.g. ground shadows)."""
    hits = [e for e in elems if e[0].startswith("<ellipse")
            and (e[4] - e[2]) < 5.5 and (e[3] - e[1]) > 10
            and anchor_fill.lower() in e[0].lower()]
    if len(hits) != rows * cols:
        sys.exit(f"error: expected {rows*cols} anchor shapes with fill "
                 f"{anchor_fill}, found {len(hits)}. Adjust --anchor-fill.")
    hits.sort(key=lambda s: s[6])
    row_groups = [hits[r * cols:(r + 1) * cols] for r in range(rows)]
    ground_ys = [sum(s[6] for s in g) / cols for g in row_groups]
    col_centers = [s[5] for s in sorted(row_groups[0], key=lambda s: s[5])]
    return col_centers, ground_ys


def cluster(elems, gap=3.0):
    """Union-find: merge elements whose bboxes overlap within `gap` px."""
    parent = list(range(len(elems)))
    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]; a = parent[a]
        return a
    for i in range(len(elems)):
        for j in range(i + 1, len(elems)):
            a, b = elems[i], elems[j]
            if (a[1] - gap < b[3] and b[1] - gap < a[3] and
                    a[2] - gap < b[4] and b[2] - gap < a[4]):
                parent[find(i)] = find(j)
    out = {}
    for i, e in enumerate(elems):
        out.setdefault(find(i), []).append(e)
    return out.values()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("--rows", type=int, required=True)
    ap.add_argument("--cols", type=int, required=True)
    ap.add_argument("--row-names", required=True, help="comma list, top to bottom")
    ap.add_argument("--col-names", required=True, help="comma list, left to right")
    ap.add_argument("--anchor-fill", help="fill color of repeated anchor shapes (e.g. ground shadows)")
    ap.add_argument("--out-dir", default=".")
    ap.add_argument("--prefix", default="")
    ap.add_argument("--pad", type=float, default=2.0)
    args = ap.parse_args()

    row_names = args.row_names.split(",")
    col_names = args.col_names.split(",")
    assert len(row_names) == args.rows and len(col_names) == args.cols

    svg = open(args.input).read()
    dm = re.search(r"<defs>.*?</defs>", svg, re.S)
    defs = dm.group(0) if dm else ""
    elems = parse_elements(svg)

    if args.anchor_fill:
        col_centers, ground_ys = find_anchors(elems, args.anchor_fill, args.rows, args.cols)
    else:
        vb = re.search(r'viewBox="([^"]*)"', svg)
        x0, y0, w, h = [float(v) for v in vb.group(1).split()] if vb else (0, 0, 100, 100)
        col_centers = [x0 + w * (c + 0.5) / args.cols for c in range(args.cols)]
        ground_ys = [y0 + h * (r + 0.5) / args.rows for r in range(args.rows)]

    cells = {}
    for items in cluster(elems):
        bx = (min(i[1] for i in items) + max(i[3] for i in items)) / 2
        by = max(i[4] for i in items) if args.anchor_fill else \
             (min(i[2] for i in items) + max(i[4] for i in items)) / 2
        col = min(range(args.cols), key=lambda c: abs(bx - col_centers[c]))
        row = min(range(args.rows), key=lambda r: abs(by - ground_ys[r]))
        cells.setdefault((row, col), []).extend(items)

    os.makedirs(args.out_dir, exist_ok=True)
    for (row, col), items in sorted(cells.items()):
        minx = min(i[1] for i in items) - args.pad
        miny = min(i[2] for i in items) - args.pad
        maxx = max(i[3] for i in items) + args.pad
        maxy = max(i[4] for i in items) + args.pad
        w, h = maxx - minx, maxy - miny
        body = "\n  ".join(i[0] for i in items)
        out = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:.1f}" height="{h:.1f}" '
               f'fill="none" viewBox="{minx:.2f} {miny:.2f} {w:.2f} {h:.2f}">\n'
               f'  {defs}\n  {body}\n</svg>\n')
        name = f"{args.prefix}{row_names[row]}-{col_names[col]}.svg"
        open(os.path.join(args.out_dir, name), "w").write(out)
        print(f"{name}  ({len(items)} shapes, {w:.1f}x{h:.1f})")
    print("done")


if __name__ == "__main__":
    main()

