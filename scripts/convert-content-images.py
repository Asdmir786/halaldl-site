from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"

roots = [PUBLIC / "releases", PUBLIC / "screenshots", PUBLIC / "brand" / "lookdev"]
converted = []
for base in roots:
    if not base.exists():
        continue
    for source in sorted(base.rglob("*.png")):
        destination = source.with_suffix(".webp")
        with Image.open(source) as image:
            if image.mode not in {"RGB", "RGBA"}:
                image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
            image.save(destination, "WEBP", quality=88, method=6)
        converted.append((source, destination))

for source, destination in converted:
    print(f"{source.stat().st_size}\t{destination.stat().st_size}\t{destination.relative_to(ROOT)}")
print(f"converted={len(converted)}")
