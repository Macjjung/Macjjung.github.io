"""Build an allowlisted static Pages directory; no third-party packages required."""
from pathlib import Path
import shutil
root = Path(__file__).resolve().parent.parent
out = root / 'dist'
if out.exists():
    raise SystemExit('dist already exists. Review/remove it or choose a fresh checkout before packaging.')
# Only the explicit public files below are packaged. docs/ and references/ are internal.
# Never publish docs/references/portfolio-reference.pdf or its retained source.
# Unreviewed originals live in assets/private-five; never include that folder.
internal_reference_names = (
    'references', 'portfolio-reference.pdf', 'portfolio-reference..pdf',
)
out.mkdir()
for name in ['index.html', 'css/style.css', 'js/main.js', 'js/portfolio-data.js', 'assets/favicon.svg', 'assets/event_As-Is.png', 'assets/event_To-Be.png']:
    dest = out / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(root / name, dest)
for folder in ['images', 'documents']:
    src = root / 'assets' / folder
    if src.exists():
        shutil.copytree(src, out / 'assets' / folder, ignore=shutil.ignore_patterns('.DS_Store', '.gitkeep', *internal_reference_names))
(out / '.nojekyll').touch()
print('Packaged static site:', out)
