from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
src = root / "public/brand/icon-light.png"
dst = root / "public/brand/icon-light.webp"
with Image.open(src) as image:
    image.save(dst, "WEBP", lossless=True, method=6)
print(f"wrote {dst} ({dst.stat().st_size} bytes)")
