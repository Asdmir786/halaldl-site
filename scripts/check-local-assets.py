from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
patterns = [
    re.compile(r'"(/(?:releases|screenshots)/[^"\\]+)"'),
    re.compile(r"'(/(?:releases|screenshots)/[^'\\]+)'"),
]
refs = set()
for path in (root / "src").rglob("*"):
    if path.suffix not in {".ts", ".tsx", ".css"}:
        continue
    text = path.read_text()
    for pattern in patterns:
        refs.update(pattern.findall(text))
missing = sorted(ref for ref in refs if not (root / "public" / ref.lstrip("/")).is_file())
print(f"referenced_assets={len(refs)}")
print(f"missing_assets={len(missing)}")
for ref in missing:
    print(ref)
raise SystemExit(1 if missing else 0)
