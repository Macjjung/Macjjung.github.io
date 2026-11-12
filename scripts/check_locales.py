"""Check shared structure and translation readiness without changing either locale."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def read_locale(lang):
    source = (ROOT / f'js/locales/{lang}.js').read_text()
    return json.loads(source.split(f'window.PORTFOLIO_LOCALES.{lang} = ', 1)[1].strip().removesuffix(';'))

def check():
    ko, en = read_locale('ko'), read_locale('en')
    errors = []
    for lang, data in [('ko', ko), ('en', en)]:
        if data['locale'] != lang or data['status'] not in ('ready', 'draft'):
            errors.append(f'{lang}: invalid locale/status')
        ids = [s['id'] for s in data['slides']]
        if len(ids) != len(set(ids)):
            errors.append(f'{lang}: duplicate slide IDs')
        for project in data['projects']:
            if not set(project['ids']).issubset(ids):
                errors.append(f'{lang}: missing project slide')
        if not set(data['aliases'].values()).issubset(ids):
            errors.append(f'{lang}: missing alias destination')
    for field in ('copy', 'ui'):
        if set(ko[field]) != set(en[field]):
            errors.append(f'{field}: locale keys differ')
    if ko['aliases'] != en['aliases']:
        errors.append('aliases differ')
    for field in ('id', 'variant'):
        if [s[field] for s in ko['slides']] != [s[field] for s in en['slides']]:
            errors.append(f'slide {field}/order differs')
    for field in ('id', 'number', 'pages', 'ids'):
        if [p[field] for p in ko['projects']] != [p[field] for p in en['projects']]:
            errors.append(f'project {field} differs')

    def compare_numbers(a, b, path):
        if isinstance(a, (int, float)) and not isinstance(a, bool) and a != b:
            errors.append(f'{path}: numeric source differs')
        elif isinstance(a, dict) and isinstance(b, dict):
            for k in a:
                if k not in b:
                    errors.append(f'{path}.{k}: missing English field')
                else:
                    compare_numbers(a[k], b[k], f'{path}.{k}')
        elif isinstance(a, list) and isinstance(b, list):
            if len(a) != len(b):
                errors.append(f'{path}: list length differs')
            for i, (x, y) in enumerate(zip(a, b)):
                compare_numbers(x, y, f'{path}[{i}]')
    compare_numbers(ko['slides'], en['slides'], 'slides')
    main = (ROOT / 'js/main.js').read_text()
    for key in set(re.findall(r'copy\.([A-Za-z0-9_]+)', main)):
        if key not in ko['copy']:
            errors.append('missing copy: ' + key)
    if re.search('[가-힣]', main):
        errors.append('Korean display copy remains in shared main.js')
    pending = [s['id'] for s in en['slides'] if s.get('translationStatus') != 'ready']
    if en['status'] == 'ready':
        if pending:
            errors.append('English marked ready before every slide was reviewed')
        if re.search('[가-힣]', json.dumps(en, ensure_ascii=False)):
            errors.append('English marked ready with Korean copy still present')
    source_hash = hashlib.sha256(json.dumps(ko, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    if en.get('sourceRevision') != source_hash:
        print('REVIEW: Korean source changed; compare it with the English translation baseline.')
        if en['status'] == 'ready':
            errors.append('English sourceRevision needs review')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'OK: {len(ko["slides"])} matching slides; {len(ko["copy"])} shared copy keys; English pending review: {len(pending)}')
    return ko, en

if __name__ == '__main__':
    check()
