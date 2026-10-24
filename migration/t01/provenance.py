# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
"""T01 一次性复制/核验工具；固定 Git tree 是权威，不接入组件注册或 CI。"""
import argparse
import collections
import datetime
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import sys

COMMIT = '79b1578f2b75f55709765b5e7882aaf33146c603'
TREE = '58e30c637acb7efdd393af291e570288b03b5aa9'
CANDIDATES = (
    'frontend/packages/ui/', 'frontend/packages/ui-mobile/',
    'frontend/packages/app-shell/', 'frontend/packages/scheduling/',
    'frontend/apps/design-system/', 'frontend/DESIGN/',
)
REFERENCES = {
    'AGENTS.md', 'CLAUDE.md', 'README.md', '.gitignore',
    'docs/adr/0006-frontend-workspace-structure.md',
    'docs/adr/0007-vue-router-file-routing-colocation.md',
    'docs/adr/0020-nvui-naming-token-namespaces-and-style-isolation.md',
    'docs/adr/0036-dhtmlx-evaluation-permanent-retention.md',
    'docs/architecture/frontend/README.md',
    'docs/architecture/frontend/workspace-structure.md',
    'docs/governance/frontend/design-system.md',
    'docs/governance/testing/README.md',
    'docs/governance/testing/validity.md',
    'docs/governance/testing/evidence.md',
    'docs/runbooks/testing/frontend-vitest-local.md',
    'docs/product/scheduling/design.md',
    '.github/workflows/ci.yml',
    'scripts/frontend-test-skip-allowlist.json',
    'scripts/get-frontend-workspace-plan.ps1',
    'scripts/lib/FrontendWorkspacePlan.ps1',
    'scripts/tests/frontend-workspace-plan.Tests.ps1',
    'scripts/tests/pnpm-invocation.Tests.ps1',
    'scripts/tests/stable-code-frontend-vocabulary.Tests.ps1',
    'scripts/verify-stable-code-frontend-vocabulary.ps1',
}
ROOT_CANDIDATES = {'.node-version', '.gitattributes', 'DESIGN.md'}
UI_SUFFIXES = {'.css', '.scss', '.sass', '.less', '.svg', '.png', '.jpg', '.jpeg',
               '.webp', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.otf',
               '.pdf', '.docx', '.pptx', '.xlsx'}
BASE = Path(__file__).resolve().parents[2]
EVIDENCE = BASE / 'migration/t01'


def git(repo, *args, data=None):
    return subprocess.check_output(['git', '-C', str(repo), *args], input=data)


def tree(repo):
    assert git(repo, 'rev-parse', COMMIT + '^{tree}').decode().strip() == TREE
    result = {}
    for line in git(repo, 'ls-tree', '-rz', COMMIT).split(b'\0'):
        if not line:
            continue
        meta, path = line.split(b'\t', 1)
        mode, kind, blob = meta.decode().split()
        assert kind == 'blob', (kind, path)
        result[path.decode()] = {'mode': mode, 'blob': blob}
    return result


def placement(path):
    if path.startswith('frontend/packages/api-client/'):
        return None, 'excluded-sdk', '业务生成客户端及其生成输入留在原库，不建立永久依赖', ['#3', '#8', '#10']
    if path in ROOT_CANDIDATES or path.startswith(CANDIDATES):
        tickets = ['#3']
        if path.startswith('frontend/packages/ui-mobile/'):
            tickets = ['#5']
        elif path.startswith('frontend/packages/scheduling/'):
            tickets = ['#8']
        elif path.startswith('frontend/packages/app-shell/'):
            tickets = ['#9']
        elif path.startswith('frontend/apps/design-system/'):
            tickets = ['#10']
        elif '/components/screen/' in path:
            tickets = ['#6']
        elif '/components/touch/' in path:
            tickets = ['#4']
        elif any(s in path for s in ['/file-preview/', '/file-upload/']):
            tickets = ['#7']
        elif path.startswith('frontend/DESIGN/'):
            tickets = ['#3', '#10']
        return path, 'unchanged-candidate', '原样活动候选；保留旧耦合，不表示可独立构建或分发', tickets
    if path == 'frontend/AGENTS.md' or path in REFERENCES:
        return 'migration/reference/source/' + path, 'reference', '固定时点的原库规则/决策/工程参考；不代表新库现态', ['#3', '#8', '#10', '#11']
    if path.startswith('frontend/'):
        tickets = ['#9']
        if path.startswith('frontend/apps/screen/'):
            tickets = ['#6', '#9']
        elif path.startswith('frontend/apps/business-pda/'):
            tickets = ['#5', '#9']
        elif path.startswith('frontend/apps/docs/'):
            tickets = ['#9', '#10']
        elif path.startswith(('frontend/packages/auth/', 'frontend/packages/business-core/')):
            tickets = ['#8', '#9']
        if path.count('/') == 1:
            return path, 'unchanged-candidate', '原样工程候选；聚合任务仍引用原仓应用，后续拆分', ['#3', '#10', '#11']
        return 'migration/materials/source/' + path, 'needs-decoupling', '应用与业务耦合原始素材；不纳入活动 workspace，不作永久库依赖', tickets
    if path.startswith('docs/reports/') and Path(path).suffix.lower() in UI_SUFFIXES:
        return None, 'excluded-history', '原库历史验收截图，非 UI 实现或运行资产；留在原库，不继承为 fresh 证据', ['#2']
    return None


def signals(path):
    tags = []
    if path.endswith('.vue'):
        tags.append('vue')
    if Path(path).suffix.lower() in UI_SUFFIXES:
        tags.append('style-or-asset')
    if '/assets/' in path or '/public/' in path:
        tags.append('asset-directory')
    if any(s in path for s in ['/components/', '/layouts/', '/composables/', '/pages/']):
        tags.append('ui-or-colocated-support')
    return tags


def selection(repo):
    source = tree(repo)
    missing = (REFERENCES | ROOT_CANDIDATES) - source.keys()
    assert not missing, missing
    result = []
    for path, meta in sorted(source.items()):
        dest = placement(path)
        if dest is not None:
            target, category, purpose, tickets = dest
            result.append(dict(source=path, **meta, target=target, category=category,
                               purpose=purpose, followup=tickets, ui_signals=signals(path)))
    # Entire frontend is inventoried, including explicitly excluded SDK files.
    assert {r['source'] for r in result if r['source'].startswith('frontend/')} == {p for p in source if p.startswith('frontend/')}
    # Scan the whole repository for Vue/style/assets outside frontend: require explicit disposition.
    outside = [p for p in source if not p.startswith('frontend/') and (p.endswith('.vue') or Path(p).suffix.lower() in UI_SUFFIXES)]
    assert set(outside) <= {r['source'] for r in result}, ('unaccounted outside-frontend UI assets', outside)
    targets = [r['target'] for r in result if r['target']]
    assert len(targets) == len(set(targets))
    return result


def source_bytes(repo, rows):
    blobs = sorted({r['blob'] for r in rows})
    raw = git(repo, 'cat-file', '--batch', data=('\n'.join(blobs) + '\n').encode())
    offset = 0
    result = {}
    for blob in blobs:
        end = raw.index(b'\n', offset)
        header = raw[offset:end].decode().split()
        assert header[:2] == [blob, 'blob']
        length = int(header[2])
        content = raw[end + 1:end + 1 + length]
        assert raw[end + 1 + length:end + 2 + length] == b'\n'
        result[blob] = content
        offset = end + length + 2
    assert offset == len(raw)
    return result


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def preflight(repo, rows):
    missing = [r['target'] for r in rows if r['target'] and not os.path.lexists(BASE / r['target'])]
    present = [r['target'] for r in rows if r['target'] and os.path.lexists(BASE / r['target'])]
    report = dict(phase='before-copy', at=now(), source_commit=COMMIT, source_tree=TREE,
                  target_head=git(BASE, 'rev-parse', 'HEAD').decode().strip(),
                  expected_targets=len(missing) + len(present), missing_count=len(missing),
                  present_count=len(present), result='FAIL' if missing else 'PASS',
                  missing=missing, present=present)
    write_json(EVIDENCE / 'before-copy.json', report)
    print(json.dumps({k: v for k, v in report.items() if k not in ['missing', 'present']}))
    return 1 if missing else 0


def copy(repo, rows):
    before = json.loads((EVIDENCE / 'before-copy.json').read_text())
    assert before['result'] == 'FAIL' and before['present_count'] == 0
    assert all(not os.path.lexists(BASE / r['target']) for r in rows if r['target']), 'Refuse overwrite'
    objects = source_bytes(repo, rows)
    for row in rows:
        content = objects[row['blob']]
        row['sha256'] = hashlib.sha256(content).hexdigest()
        row['bytes'] = len(content)
        if not row['target']:
            continue
        target = BASE / row['target']
        target.parent.mkdir(parents=True, exist_ok=True)
        if row['mode'] == '120000':
            target.symlink_to(os.fsdecode(content))
        else:
            assert row['mode'] in ['100644', '100755']
            with target.open('xb') as handle:
                handle.write(content)
            target.chmod(0o755 if row['mode'] == '100755' else 0o644)
    with (EVIDENCE / 'provenance.jsonl').open('x') as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + '\n')
    print('copied', sum(bool(r['target']) for r in rows), 'inventoried', len(rows))


def verify(repo, rows, output):
    # Fresh re-enumeration + fresh Git object reads; do not trust stored hashes as authority.
    manifest = [json.loads(line) for line in (EVIDENCE / 'provenance.jsonl').read_text().splitlines()]
    objects = source_bytes(repo, rows)
    assert len(manifest) == len(rows)
    assert len({r['source'] for r in manifest}) == len(rows)
    by_source = {r['source']: r for r in manifest}
    errors = []
    for expected in rows:
        row = by_source[expected['source']]
        for key, value in expected.items():
            assert row[key] == value, (key, expected['source'])
        content = objects[expected['blob']]
        assert row['sha256'] == hashlib.sha256(content).hexdigest()
        assert row['bytes'] == len(content)
        if not row['target']:
            continue
        target = BASE / row['target']
        if not os.path.lexists(target):
            errors.append(['missing', row['target']])
            continue
        mode = target.lstat().st_mode
        actual_mode = '120000' if stat.S_ISLNK(mode) else ('100755' if mode & 0o111 else '100644')
        actual = os.fsencode(os.readlink(target)) if stat.S_ISLNK(mode) else target.read_bytes()
        blob = hashlib.sha1(b'blob ' + str(len(actual)).encode() + b'\0' + actual).hexdigest()
        if actual_mode != row['mode'] or blob != row['blob'] or actual != content or hashlib.sha256(actual).hexdigest() != row['sha256']:
            errors.append(['content-or-mode', row['target']])
    targets = {r['target'] for r in rows if r['target']}
    actual_targets = {p.relative_to(BASE).as_posix() for root in ['frontend', 'migration/materials/source', 'migration/reference/source'] for p in (BASE / root).rglob('*') if p.is_file() or p.is_symlink()}
    actual_targets.update(p for p in ROOT_CANDIDATES if os.path.lexists(BASE / p))
    errors += [['unexpected', p] for p in sorted(actual_targets - targets)]
    errors += [['uncovered', p] for p in sorted(targets - actual_targets)]
    sdk_targets = [str(p) for p in BASE.rglob('*') if 'api-client' in p.parts and '.git' not in p.parts]
    if sdk_targets:
        errors.append(['sdk-copied', sdk_targets])
    counts = collections.Counter(r['category'] for r in rows)
    frontend = [r for r in rows if r['source'].startswith('frontend/')]
    report = dict(phase='fresh-verify', at=now(), source_commit=COMMIT, source_tree=TREE,
                  target_head=git(BASE, 'rev-parse', 'HEAD').decode().strip(),
                  manifest_sha256=hashlib.sha256((EVIDENCE / 'provenance.jsonl').read_bytes()).hexdigest(),
                  inventoried=len(rows), copied=len(targets), categories=dict(counts),
                  frontend_inventoried=len(frontend), frontend_copied=sum(bool(r['target']) for r in frontend),
                  vue_total=sum(r['source'].endswith('.vue') for r in frontend),
                  vue_copied=sum(r['source'].endswith('.vue') and bool(r['target']) for r in frontend),
                  style_asset_total=sum('style-or-asset' in r['ui_signals'] for r in frontend),
                  style_asset_copied=sum('style-or-asset' in r['ui_signals'] and bool(r['target']) for r in frontend),
                  bytes_copied=sum(r['bytes'] for r in manifest if r['target']),
                  modes=dict(collections.Counter(r['mode'] for r in manifest if r['target'])),
                  groups=dict(collections.Counter('/'.join(r['source'].split('/')[:3]) for r in frontend)),
                  outside_frontend_ui_source_files=sum(not r['source'].startswith('frontend/') and (r['source'].endswith('.vue') or Path(r['source']).suffix.lower() in {'.css', '.scss', '.sass', '.less'}) for r in rows),
                  historical_screenshots_excluded=counts['excluded-history'],
                  missing_or_mismatched=len(errors), errors=errors, result='FAIL' if errors else 'PASS',
                  unrun=['dependency-install', 'build', 'typecheck', 'lint', 'component-tests', 'browser', 'old-fullstack', 'package-install-consumer', 'CI'])
    write_json(output, report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if errors else 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['before', 'copy', 'verify'])
    parser.add_argument('--source-repo', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=EVIDENCE / 'after-copy.json')
    args = parser.parse_args()
    rows = selection(args.source_repo)
    if args.action == 'before':
        return preflight(args.source_repo, rows)
    if args.action == 'copy':
        copy(args.source_repo, rows)
        return 0
    return verify(args.source_repo, rows, args.output)


if __name__ == '__main__':
    sys.exit(main())
