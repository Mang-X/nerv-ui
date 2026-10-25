# /// script
# requires-python = ">=3.12"
# dependencies = ["pyyaml"]
# ///
import subprocess,json,hashlib
from pathlib import Path
import yaml
root=Path('/Users/mang/Project/nerv-ui-worktrees/t06-f02-upload-lifecycle')
base='e763c0fdc3e2800975578ab402b479d56f23c6fd'
def git(*args): return subprocess.check_output(['git',*args],cwd=root)
files=[p for p in git('ls-files').decode().splitlines() if p.endswith('/package.json') or p in ('frontend/pnpm-lock.yaml','frontend/pnpm-workspace.yaml')]
assert len(files)==16,len(files)
inputs=[]
for p in files:
 data=(root/p).read_bytes();old=git('show',base+':'+p);assert data==old,p
 inputs.append(dict(path=p,bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),byteEqual=True))
old=yaml.safe_load(git('show',base+':frontend/pnpm-lock.yaml'));new=yaml.safe_load((root/'frontend/pnpm-lock.yaml').read_bytes())
for part in ('importers','packages','snapshots'):
 assert old[part]==new[part],part
assert len(new['packages'])==len(new['snapshots'])==973
result=dict(base=base,inputs=inputs,semanticFullObjects={part:len(new[part]) for part in ('importers','packages','snapshots')},wholeLockByteEqual=True)
Path('/tmp/nerv-ui-t06-f02/dependency-audit.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
