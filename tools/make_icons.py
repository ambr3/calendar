#!/usr/bin/env python3
"""Regenerate Seclusa Calendar icons.

    python3 tools/make_icons.py

Needs Pillow. White tile, black 31 — same palette as Notes.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

SIZE = 1024
BG = (255, 255, 255, 255)
FG = (10, 10, 10, 255)
MARK = "31"
FONTS = (
    "/usr/share/fonts/julietaula-montserrat-fonts/Montserrat-Black.otf",
    "/usr/share/fonts/julietaula-montserrat-fonts/Montserrat-ExtraBold.otf",
    "/usr/share/fonts/open-sans/OpenSans-ExtraBold.ttf",
    "/usr/share/fonts/google-droid-sans-fonts/DroidSans-Bold.ttf",
)


def rounded_mask(size, radius):
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return mask


def load_font(px):
    for path in FONTS:
        try:
            return ImageFont.truetype(path, px)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_mark(draw, size):
    # Keep the digits inside the maskable safe zone (~72% of the tile).
    font = load_font(int(size * 0.58))
    box = draw.textbbox((0, 0), MARK, font=font)
    tw, th = box[2] - box[0], box[3] - box[1]
    x = (size - tw) / 2 - box[0]
    y = (size - th) / 2 - box[1] - size * 0.02
    draw.text((x, y), MARK, font=font, fill=FG)


def render(maskable):
    image = Image.new("RGBA", (SIZE, SIZE), BG if maskable else (0, 0, 0, 0))
    if not maskable:
        tile = Image.new("RGBA", (SIZE, SIZE), BG)
        image.paste(tile, (0, 0), rounded_mask(SIZE, 200))
    draw_mark(ImageDraw.Draw(image), SIZE)
    return image


def write_svg(path, maskable=False):
    rx = "0" if maskable else "200"
    path.write_text(
        f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-label="Seclusa Calendar">
  <rect width="1024" height="1024" rx="{rx}" fill="#ffffff"/>
  <text x="512" y="560" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-weight="900" font-size="580" fill="#0a0a0a">31</text>
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
