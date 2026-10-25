# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
import hashlib, json, pathlib, shutil, sys
src=pathlib.Path('/tmp/nerv-ui-t06-f02')
repo=pathlib.Path('/Users/mang/Project/nerv-ui-worktrees/t06-f02-upload-lifecycle')
durable=pathlib.Path('/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t06-f02-implementation-r1')
excluded={'node_modules','cache','cleancheckout','.vite','dist','__pycache__'}
def manifest(root):
    rows=[]
    for p in sorted(root.rglob('*')):
        if p.is_file() and p.name!='SHA256SUMS': rows.append((p.relative_to(root),hashlib.sha256(p.read_bytes()).hexdigest()))
    (root/'SHA256SUMS').write_text(''.join(f'{sha}  {p}\n' for p,sha in rows))
    for p,sha in rows: assert hashlib.sha256((root/p).read_bytes()).hexdigest()==sha
    return len(rows)
if sys.argv[1]=='stage':
    dest=repo/'docs/evidence/t06-f02'
    for p in src.rglob('*'):
        rel=p.relative_to(src)
        if not p.is_file() or excluded.intersection(rel.parts) or rel.parts[0]=='bin' or p.name=='ego-guide.md': continue
        target=dest/('scripts' if p.suffix in {'.py','.mjs','.patch'} else 'raw')/rel
        target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target)
    print(json.dumps(dict(mode='stage',files=manifest(dest))))
else:
    for p in src.rglob('*'):
        rel=p.relative_to(src)
        if not p.is_file() or excluded.intersection(rel.parts): continue
        target=durable/'raw'/rel
        target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target)
    shutil.copytree(repo/'docs/evidence/t06-f02',durable/'repository-evidence',dirs_exist_ok=True,ignore=shutil.ignore_patterns(*excluded))
    receipt=pathlib.Path('/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t06-f01-review-r1/review-receipt.md')
    shutil.copy2(receipt,durable/'inherited-f01-review-receipt.md')
    print(json.dumps(dict(mode='durable',files=manifest(durable))))
