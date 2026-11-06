#!/usr/bin/env python3
"""Regenerate Seclusa Calendar icons.

    python3 tools/make_icons.py

Needs Pillow. Black on white, same weight as the Notes icon: a solid
calendar page, white header, and a day grid with one day marked.
"""

from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

SIZE = 1024
BG = (255, 255, 255, 255)
FG = (10, 10, 10, 255)
WHITE = (255, 255, 255, 255)

# Shared geometry in a 1024 box. The mark stays inside the maskable safe zone.
RINGS = (392, 632)
RING_Y = 210
RING_R = 42
BODY = (196, 230, 828, 850)
BODY_R = 72
HEADER = (248, 308, 776, 372)
HEADER_R = 12
GRID_ORIGIN = (263, 408)
CELL = 108
GAP = 22
COLS, ROWS = 4, 3
TODAY = (2, 1)


def rounded_mask(size, radius):
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return mask


def draw_mark(draw):
    for cx in RINGS:
        draw.ellipse(
            [cx - RING_R, RING_Y - RING_R, cx + RING_R, RING_Y + RING_R],
            fill=FG,
        )
    draw.rounded_rectangle(BODY, radius=BODY_R, fill=FG)
    draw.rounded_rectangle(HEADER, radius=HEADER_R, fill=WHITE)
    x0, y0 = GRID_ORIGIN
    for r in range(ROWS):
        for c in range(COLS):
            if (c, r) == TODAY:
                continue
            x = x0 + c * (CELL + GAP)
            y = y0 + r * (CELL + GAP)
            draw.rounded_rectangle([x, y, x + CELL, y + CELL], radius=16, fill=WHITE)


def render(maskable):
    image = Image.new("RGBA", (SIZE, SIZE), BG if maskable else (0, 0, 0, 0))
    if not maskable:
        tile = Image.new("RGBA", (SIZE, SIZE), BG)
        image.paste(tile, (0, 0), rounded_mask(SIZE, 200))
    draw_mark(ImageDraw.Draw(image))
    return image


def write_svg(path, maskable=False):
    cells = []
    x0, y0 = GRID_ORIGIN
    for r in range(ROWS):
        for c in range(COLS):
            if (c, r) == TODAY:
                continue
            x = x0 + c * (CELL + GAP)
            y = y0 + r * (CELL + GAP)
            cells.append(
                f'  <rect x="{x}" y="{y}" width="{CELL}" height="{CELL}" rx="16" fill="#ffffff"/>'
            )
    rings = "\n".join(
        f'  <circle cx="{cx}" cy="{RING_Y}" r="{RING_R}" fill="#0a0a0a"/>' for cx in RINGS
    )
    x0, y0, x1, y1 = BODY
    hx0, hy0, hx1, hy1 = HEADER
    rx = "0" if maskable else "200"
    path.write_text(
        f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-label="Seclusa Calendar">
  <rect width="1024" height="1024" rx="{rx}" fill="#ffffff"/>
{rings}
  <rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" rx="{BODY_R}" fill="#0a0a0a"/>
  <rect x="{hx0}" y="{hy0}" width="{hx1 - hx0}" height="{hy1 - hy0}" rx="{HEADER_R}" fill="#ffffff"/>
{chr(10).join(cells)}
</svg>
''',
        encoding="utf-8",
    )


def main():
    master = render(maskable=False)
    for size in (192, 512):
        master.resize((size, size), Image.Resampling.LANCZOS).save(ROOT / f"icon-{size}.png")
    render(maskable=True).resize((512, 512), Image.Resampling.LANCZOS).save(ROOT / "icon-maskable-512.png")
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
