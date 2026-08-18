from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
changed = []

for path in sorted((ROOT / "src").rglob("*")):
    if path.suffix not in {".ts", ".tsx", ".css"}:
        continue
    text = path.read_text()
    original = text
    # Content visuals are converted to WebP. Keep icons, masks, favicons, and social cards as PNG.
    text = re.sub(r'(/(?:releases|screenshots|brand/lookdev)/[^"\'\\)\s]+)\.png', r'\1.webp', text)
    # The redesign should show the current release story in the 3D hero, not the previous release.
    text = text.replace('/releases/0.5.1/promo/hero-light.webp', '/releases/0.6.0/hero-light.webp')
    text = text.replace('/releases/0.5.1/promo/hero-dark.webp', '/releases/0.6.0/hero-dark.webp')
    # A dark presets screenshot is not present in the branch; use the existing canonical screenshot instead of a 404.
    text = text.replace('/screenshots/github/dark/halaldl-presets-dark.webp', '/screenshots/halaldl-presets.webp')
    if text != original:
        path.write_text(text)
        changed.append(str(path.relative_to(ROOT)))

print('\n'.join(changed))
print(f'changed={len(changed)}')
