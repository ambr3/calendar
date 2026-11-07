#!/usr/bin/env python3
"""Regenerate Seclusa Calendar icons.

    python3 tools/make_icons.py

Needs Pillow. White tile, black 31 — same palette as Notes.
SVG uses drawn paths (no <text>), so favicons do not depend on fonts.
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


def load_font(px):
    for path in FONTS:
        try:
            return ImageFont.truetype(path, px)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_mark(draw, size):
    font = load_font(int(size * 0.58))
    box = draw.textbbox((0, 0), MARK, font=font)
    tw, th = box[2] - box[0], box[3] - box[1]
    x = (size - tw) / 2 - box[0]
    y = (size - th) / 2 - box[1] - size * 0.02
    draw.text((x, y), MARK, font=font, fill=FG)


def render():
    # Opaque white field — some install checks dislike transparent corners.
    image = Image.new("RGBA", (SIZE, SIZE), BG)
    draw_mark(ImageDraw.Draw(image), SIZE)
    return image


def write_svg(path, maskable=False):
    # Geometric 31 paths (no fonts). Coordinates in a 1024 box.
    rx = "0" if maskable else "200"
    path.write_text(
        f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-label="Seclusa Calendar">
  <rect width="1024" height="1024" rx="{rx}" fill="#ffffff"/>
  <!-- 3 -->
  <path fill="#0a0a0a" d="M250 250h330c120 0 200 70 200 175 0 70-35 120-100 145 85 25 135 85 135 175 0 120-90 205-235 205H250V825h310c85 0 135-45 135-115s-50-115-135-115H360V580h250c75 0 120-40 120-100s-45-100-120-100H250V250z"/>
  <!-- 1 -->
  <path fill="#0a0a0a" d="M700 250h140v550H700z"/>
</svg>
''',
        encoding="utf-8",
    )


def main():
    master = render()
    for size in (192, 512):
        master.resize((size, size), Image.Resampling.LANCZOS).save(ROOT / f"icon-{size}.png")
    master.resize((512, 512), Image.Resampling.LANCZOS).save(ROOT / "icon-maskable-512.png")
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
