#!/usr/bin/env python3
"""Regenerate Seclusa Calendar icons.

    python3 tools/make_icons.py

Needs Pillow. Black on white, Seclusa style. Mark: a calendar page with
binder rings and a day grid — distinct from Notes.
"""

from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

SIZE = 1024
BG = (255, 255, 255, 255)
FG = (10, 10, 10, 255)


def rounded_mask(size, radius):
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return mask


def draw_calendar(draw, box, stroke, fill_day=True):
    """Draw a calendar page inside `box` = (x0, y0, x1, y1)."""
    x0, y0, x1, y1 = box
    w = x1 - x0
    h = y1 - y0
    radius = max(8, w // 14)
    line = max(3, stroke)

    # Page body
    draw.rounded_rectangle([x0, y0 + h * 0.08, x1, y1], radius=radius, outline=FG, width=line)

    # Binder rings
    ring_r = max(4, w // 28)
    for t in (0.28, 0.72):
        cx = int(x0 + w * t)
        cy = int(y0 + h * 0.08)
        draw.ellipse([cx - ring_r, cy - ring_r * 2, cx + ring_r, cy + ring_r // 2], fill=FG)

    # Header bar under the rings
    header_y = int(y0 + h * 0.22)
    draw.rectangle([x0 + line, header_y, x1 - line, header_y + max(line * 2, h // 18)], fill=FG)

    # Day grid: 4 columns × 3 rows of small cells
    grid_top = int(y0 + h * 0.36)
    grid_bot = int(y1 - h * 0.12)
    grid_left = int(x0 + w * 0.16)
    grid_right = int(x1 - w * 0.16)
    cols, rows = 4, 3
    gap = max(4, w // 40)
    cell_w = (grid_right - grid_left - gap * (cols - 1)) // cols
    cell_h = (grid_bot - grid_top - gap * (rows - 1)) // rows
    # Fill one “today” cell so the mark reads at small sizes
    today = (2, 1) if fill_day else None
    for r in range(rows):
        for c in range(cols):
            cx0 = grid_left + c * (cell_w + gap)
            cy0 = grid_top + r * (cell_h + gap)
            cell = [cx0, cy0, cx0 + cell_w, cy0 + cell_h]
            if today == (c, r):
                draw.rounded_rectangle(cell, radius=max(2, cell_w // 6), fill=FG)
            else:
                draw.rounded_rectangle(cell, radius=max(2, cell_w // 6), outline=FG, width=max(2, line // 2))


def make_tile(size):
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    tile = Image.new("RGBA", (size, size), BG)
    m = rounded_mask(size, int(size * 0.195))
    out.paste(tile, (0, 0), m)
    d = ImageDraw.Draw(out)
    inset = int(size * 0.18)
    draw_calendar(d, (inset, inset, size - inset, size - inset), stroke=max(4, size // 48))
    return out


def make_maskable(size):
    """Bleed to edges; mark stays inside the central ~72% safe zone."""
    out = Image.new("RGBA", (size, size), BG)
    inset = int(size * 0.18)
    d = ImageDraw.Draw(out)
    draw_calendar(d, (inset, inset, size - inset, size - inset), stroke=max(4, size // 48))
    return out


def write_svg(path, maskable=False):
    label = "Seclusa Calendar"
    # Vector calendar matching the raster mark (1024 space).
    # Rings, header, 4×3 grid with one filled day at (2,1).
    cells = []
    grid_top, grid_bot = 368, 900
    grid_left, grid_right = 164, 860
    cols, rows = 4, 3
    gap = 26
    cell_w = (grid_right - grid_left - gap * (cols - 1)) // cols
    cell_h = (grid_bot - grid_top - gap * (rows - 1)) // rows
    today = (2, 1)
    for r in range(rows):
        for c in range(cols):
            x = grid_left + c * (cell_w + gap)
            y = grid_top + r * (cell_h + gap)
            if (c, r) == today:
                cells.append(
                    f'  <rect x="{x}" y="{y}" width="{cell_w}" height="{cell_h}" rx="12" fill="#0a0a0a"/>'
                )
            else:
                cells.append(
                    f'  <rect x="{x}" y="{y}" width="{cell_w}" height="{cell_h}" rx="12" fill="none" stroke="#0a0a0a" stroke-width="10"/>'
                )
    cell_svg = "\n".join(cells)
    # Maskable uses a full-bleed white field (no rounded clip in SVG; PNG handles that).
    rx = "0" if maskable else "200"
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-label="{label}">
  <rect width="1024" height="1024" rx="{rx}" fill="#ffffff"/>
  <rect x="184" y="164" width="656" height="700" rx="72" fill="none" stroke="#0a0a0a" stroke-width="28"/>
  <circle cx="368" cy="164" r="28" fill="#0a0a0a"/>
  <circle cx="656" cy="164" r="28" fill="#0a0a0a"/>
  <rect x="212" y="250" width="600" height="48" fill="#0a0a0a"/>
{cell_svg}
</svg>
'''
    path.write_text(svg, encoding="utf-8")


def main():
    for size in (192, 512):
        make_tile(size).save(ROOT / f"icon-{size}.png")

    make_maskable(512).save(ROOT / "icon-maskable-512.png")
    write_svg(ROOT / "icon.svg", maskable=False)
    write_svg(ROOT / "icon-maskable.svg", maskable=True)

    for name in (
        "icon-192.png",
        "icon-512.png",
        "icon-maskable-512.png",
        "icon.svg",
        "icon-maskable.svg",
    ):
        print(name)


if __name__ == "__main__":
    main()
