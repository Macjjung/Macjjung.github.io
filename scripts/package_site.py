"""Package active sources and explicitly verified images; never copy archive/reference data."""
import argparse
import json
import re
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

base_files = {'index.html', 'css/style.css', 'js/main.js', 'js/portfolio-data.js', 'js/locales/ko.js', 'js/locales/en.js'}
files = set()

def collect_verified_images(value, source_root, prefix):
    if isinstance(value, dict):
        if value.get('verified') is True and 'src' in value:
            relative = Path(value['src'])
            allowed = source_root / 'assets/images'
            source = (source_root / relative).resolve()
            if relative.is_absolute() or not source.is_relative_to(allowed.resolve()) or source.suffix.lower() not in {'.png', '.jpg', '.jpeg', '.webp', '.svg'}:
                raise ValueError('Verified images must be under assets/images with a supported extension.')
            files.add(str(prefix / relative))
        for item in value.values():
            collect_verified_images(item, source_root, prefix)
    elif isinstance(value, list):
        for item in value:
            collect_verified_images(item, source_root, prefix)

routes = json.loads((root / 'scripts/company_routes.json').read_text())
if len(set(routes.values())) != len(routes):
    raise SystemExit('Duplicate company route')
for route in routes.values():
    if not re.fullmatch(r'[a-z][a-z0-9-]*[a-z][0-9]', route):
        raise SystemExit('Invalid company route: ' + route)
for route in ['', *routes.values()]:
    prefix = Path(route)
    source_root = root / prefix
    locales = check(source_root)
    files.update(str(prefix / name) for name in base_files)
    favicon = 'assets/favicon.svg' if route else 'assets/coupang-favicon.png'
    files.add(str(prefix / favicon))
    for data in locales:
        collect_verified_images(data['slides'], source_root, prefix)
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
