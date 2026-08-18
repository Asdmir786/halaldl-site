from pathlib import Path
from PIL import Image, features

root = Path(__file__).resolve().parents[1]
print('webp_support=', features.check('webp'))
print('avif_support=', features.check('avif'))
for path in sorted((root / 'public').rglob('*')):
    if path.suffix.lower() not in {'.png', '.jpg', '.jpeg', '.webp', '.avif'}:
        continue
    try:
        with Image.open(path) as image:
            print(f'{path.stat().st_size}\t{image.width}x{image.height}\t{path.relative_to(root)}\t{image.format}')
    except Exception as exc:
        print(f'ERROR\t{path}\t{exc}')
