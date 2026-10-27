"""Build an allowlisted static Pages directory; no third-party packages required."""
from pathlib import Path
import shutil
root = Path(__file__).resolve().parent.parent
out = root / 'dist'
if out.exists():
    raise SystemExit('dist already exists. Review/remove it or choose a fresh checkout before packaging.')
out.mkdir()
for name in ['index.html', 'css/style.css', 'js/main.js', 'js/portfolio-data.js', 'assets/favicon.svg']:
    dest = out / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(root / name, dest)
for folder in ['images', 'documents']:
    src = root / 'assets' / folder
    if src.exists():
        shutil.copytree(src, out / 'assets' / folder, ignore=shutil.ignore_patterns('.DS_Store', '.gitkeep'))
(out / '.nojekyll').touch()
print('Packaged static site:', out)
