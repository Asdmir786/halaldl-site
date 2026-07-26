"""Generate Raw Logs promo images (light + dark) for the site proof section."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "releases" / "0.5.1" / "promo"
SHOTS = ROOT / "public" / "screenshots"
W, H = 1600, 900

FONT = Path("C:/Windows/Fonts/segoeui.ttf")
BOLD = Path("C:/Windows/Fonts/segoeuib.ttf")
SEMIBOLD = Path("C:/Windows/Fonts/seguisb.ttf")
MONO = Path("C:/Windows/Fonts/consola.ttf")

NAVY = (8, 14, 23)
STEEL = (44, 62, 85)
MUTED_STEEL = (91, 127, 168)
MINT = (38, 224, 198)
MINT_ACCESSIBLE = (11, 127, 114)
SOFT_LIGHT = (245, 247, 251)
WHITE = (255, 255, 255)


def font(size, weight="regular"):
    source = {
        "regular": FONT,
        "bold": BOLD,
        "semibold": SEMIBOLD,
        "mono": MONO if MONO.exists() else FONT,
    }.get(weight, FONT)
    return ImageFont.truetype(str(source), size)


def text_size(draw, text, fnt):
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def wrap(draw, text, fnt, max_width):
    words = text.split()
    lines, current = [], ""
    for word in words:
        trial = f"{current} {word}".strip()
        if text_size(draw, trial, fnt)[0] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def multiline(draw, xy, text, fnt, fill, max_width, line_gap=10):
    x, y = xy
    for line in wrap(draw, text, fnt, max_width):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += text_size(draw, line, fnt)[1] + line_gap
    return y


def theme_values(theme):
    if theme == "dark":
        return {
            "bg": NAVY,
            "bg2": (12, 20, 32),
            "ink": SOFT_LIGHT,
            "muted": MUTED_STEEL,
            "panel": (20, 32, 48),
            "panel2": (28, 42, 62),
            "line": (58, 82, 112),
            "chip": (32, 48, 70),
            "shadow": (0, 0, 0, 110),
            "accent": MINT,
            "accent2": MUTED_STEEL,
            "steel": STEEL,
            "sidebar": (14, 22, 34),
            "console": (6, 10, 16),
            "log": (180, 210, 230),
            "log_ok": MINT,
            "log_warn": (242, 189, 66),
            "log_err": (240, 90, 122),
            "btn_ink": NAVY,
        }
    return {
        "bg": SOFT_LIGHT,
        "bg2": (226, 234, 244),
        "ink": NAVY,
        "muted": MUTED_STEEL,
        "panel": WHITE,
        "panel2": (232, 238, 246),
        "line": (196, 210, 226),
        "chip": (224, 232, 242),
        "shadow": (44, 62, 85, 38),
        "accent": MINT_ACCESSIBLE,
        "accent2": MUTED_STEEL,
        "steel": STEEL,
        "sidebar": (236, 242, 248),
        "console": (18, 28, 40),
        "log": (210, 230, 245),
        "log_ok": MINT,
        "log_warn": (242, 189, 66),
        "log_err": (240, 90, 122),
        "btn_ink": WHITE,
    }


def make_canvas(theme):
    c = theme_values(theme)
    img = Image.new("RGB", (W, H), c["bg"])
    draw = ImageDraw.Draw(img, "RGBA")
    for y in range(0, H, 38):
        draw.line((0, y, W, y), fill=(*c["line"], 36), width=1)
    for x in range(0, W, 38):
        draw.line((x, 0, x, H), fill=(*c["line"], 36), width=1)
    draw.ellipse((-220, -180, 540, 540), fill=(*c["steel"], 48))
    draw.ellipse((1120, 540, 1840, 1180), fill=(*c["accent"], 34))
    return img, draw, c


def rr(draw, box, c, fill=None, outline=None, width=1, radius=12):
    draw.rounded_rectangle(box, radius=radius, fill=fill or c["panel"], outline=outline or c["line"], width=width)


def shadow(draw, box, c, radius=22):
    x1, y1, x2, y2 = box
    draw.rounded_rectangle((x1 + 10, y1 + 18, x2 + 10, y2 + 18), radius=radius, fill=c["shadow"])


def chip(draw, c, x, y, text, good=False):
    f = font(13, "bold")
    tw, _ = text_size(draw, text, f)
    fill = (*c["accent"], 34) if good else c["chip"]
    outline = (*c["accent"], 100) if good else c["line"]
    rr(draw, (x, y, x + tw + 20, y + 28), c, fill=fill, outline=outline, radius=8)
    draw.text((x + 10, y + 6), text, font=f, fill=c["accent"] if good else c["muted"])
    return x + tw + 28


def button(draw, c, box, label, primary=False):
    fill = c["accent"] if primary else c["panel2"]
    ink = c["btn_ink"] if primary else c["ink"]
    rr(draw, box, c, fill=fill, outline=c["accent"] if primary else c["line"], radius=8)
    x1, y1, x2, y2 = box
    tw, th = text_size(draw, label, font(14, "bold"))
    draw.text(((x1 + x2 - tw) / 2, (y1 + y2 - th) / 2 - 1), label, font=font(14, "bold"), fill=ink)


LOG_LINES = [
    ("dim", "[halaldl] job=dl_4821 preset=Best Video"),
    ("ok", "[yt-dlp] Extracting URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ("ok", "[youtube] dQw4w9WgXcQ: Downloading webpage"),
    ("ok", "[youtube] dQw4w9WgXcQ: Downloading ios player API JSON"),
    ("dim", "[info] Available formats for dQw4w9WgXcQ: 18, 22, 137+140"),
    ("ok", "[download] Destination: lecture-clip.f137.mp4"),
    ("ok", "[download] 100% of 42.18MiB in 00:00:11 at 3.74MiB/s"),
    ("warn", "[warning] Requested format is not available; falling back to best"),
    ("ok", "[Merger] Merging formats into lecture-clip.mp4"),
    ("ok", "[ffmpeg] Post-process complete"),
    ("err", "[error] Unable to download webpage: HTTP Error 429: Too Many Requests"),
    ("dim", "[halaldl] raw output kept visible for support"),
]


def raw_logs(theme):
    img, draw, c = make_canvas(theme)
    draw.rounded_rectangle((64, 48, 80, 64), radius=5, fill=c["accent"])
    draw.text((96, 43), "HALALDL", font=font(19, "bold"), fill=c["ink"])
    label = "Logs · Raw output"
    tw, _ = text_size(draw, label, font(15, "bold"))
    rr(draw, (W - tw - 94, 36, W - 64, 77), c, fill=(*c["panel"], 225), radius=8)
    draw.text((W - tw - 79, 48), label, font=font(15, "bold"), fill=c["muted"])

    # App window
    window = (70, 120, 980, 820)
    shadow(draw, window, c, radius=18)
    rr(draw, window, c, fill=c["panel"], radius=14)

    # Sidebar matching theme (not always light)
    sidebar = (70, 120, 280, 820)
    draw.rounded_rectangle(sidebar, radius=14, fill=c["sidebar"])
    draw.rectangle((250, 120, 280, 820), fill=c["sidebar"])
    draw.text((96, 150), "HalalDL", font=font(20, "bold"), fill=c["ink"])
    nav = [
        ("Dashboard", False),
        ("Downloads", False),
        ("Tools", False),
        ("Logs", True),
        ("History", False),
        ("Settings", False),
    ]
    y = 210
    for name, active in nav:
        if active:
            rr(draw, (88, y, 258, y + 40), c, fill=(*c["accent"], 28), outline=(*c["accent"], 90), radius=8)
            draw.text((108, y + 10), name, font=font(15, "bold"), fill=c["accent"])
        else:
            draw.text((108, y + 10), name, font=font(15, "semibold"), fill=c["muted"])
        y += 48

    # Main pane header
    draw.text((310, 148), "Console Output", font=font(24, "bold"), fill=c["ink"])
    chip(draw, c, 310, 190, "job dl_4821", True)
    chip(draw, c, 430, 190, "yt-dlp")
    chip(draw, c, 520, 190, "ffmpeg")
    button(draw, c, (760, 148, 850, 186), "Copy", False)
    button(draw, c, (862, 148, 952, 186), "Clear", False)

    # Console with real dummy lines (no gray bars)
    console = (310, 240, 950, 780)
    rr(draw, console, c, fill=c["console"], outline=c["line"], radius=12)
    mono = font(15, "mono")
    cy = 262
    for kind, line in LOG_LINES:
        color = {
            "ok": c["log_ok"],
            "warn": c["log_warn"],
            "err": c["log_err"],
            "dim": c["log"],
        }[kind]
        # Fade dim lines slightly
        if kind == "dim":
            color = (*c["log"][:3],) if False else tuple(int(v * 0.72) for v in c["log"][:3])
        draw.text((330, cy), line[:78], font=mono, fill=color)
        cy += 38

    # Right copy
    draw.text((1060, 180), "See the\nengine.", font=font(58, "bold"), fill=c["ink"])
    multiline(
        draw,
        (1060, 340),
        "When a site changes or an extractor hiccups, HalalDL keeps the raw yt-dlp output in view — not buried behind a progress spinner.",
        font(24, "semibold"),
        c["muted"],
        480,
        12,
    )
    rr(draw, (1060, 520, 1520, 620), c, fill=(*c["panel"], 230), radius=10)
    draw.text((1084, 540), "Dummy job, real shape", font=font(18, "bold"), fill=c["ink"])
    multiline(
        draw,
        (1084, 574),
        "Sample URL and timings for marketing — the layout matches the app’s Logs screen.",
        font(15),
        c["muted"],
        400,
        5,
    )
    rr(draw, (1060, 650, 1520, 760), c, fill=(*c["accent"], 22), outline=(*c["accent"], 90), radius=10)
    draw.text((1084, 678), "Copy / Export / Clear", font=font(18, "bold"), fill=c["ink"])
    draw.text((1084, 714), "Support gets paste-ready context, not a black box.", font=font(15), fill=c["muted"])
    return img


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (SHOTS / "light").mkdir(parents=True, exist_ok=True)
    for theme in ("light", "dark"):
        img = raw_logs(theme)
        promo = OUT / f"raw-logs-{theme}.png"
        img.save(promo, optimize=True)
        if theme == "light":
            img.save(SHOTS / "light" / "halaldl-logs.png", optimize=True)
        else:
            img.save(SHOTS / "halaldl-logs.png", optimize=True)
        print(f"wrote {promo} ({promo.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
