"""Package active sources and explicitly verified images; never copy archive/reference data."""
import argparse
import shutil
from pathlib import Path
from check_locales import check

root = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, default=root / 'dist')
args = parser.parse_args()
out = args.output.resolve()
if out.exists():
    raise SystemExit('Output already exists. Choose a new output directory to preserve existing files.')

locales = check()
files = {'index.html', 'css/style.css', 'js/main.js', 'js/portfolio-data.js', 'js/locales/ko.js', 'js/locales/en.js', 'assets/coupang-favicon.png'}

def collect_verified_images(value):
    if isinstance(value, dict):
        if value.get('verified') is True and 'src' in value:
            relative = Path(value['src'])
            allowed = root / 'assets/images'
            source = (root / relative).resolve()
            if relative.is_absolute() or not source.is_relative_to(allowed.resolve()) or source.suffix.lower() not in {'.png', '.jpg', '.jpeg', '.webp', '.svg'}:
                raise ValueError('Verified images must be under assets/images with a supported extension.')
            files.add(str(relative))
        for item in value.values():
            collect_verified_images(item)
    elif isinstance(value, list):
        for item in value:
            collect_verified_images(item)

for data in locales:
    collect_verified_images(data['slides'])
for name in files:
    if not (root / name).is_file():
        raise SystemExit('Missing package input: ' + name)
out.mkdir(parents=True)
for name in sorted(files):
    dest = out / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(root / name, dest)
(out / '.nojekyll').touch()
print('Packaged', len(files), 'active files:', out)
