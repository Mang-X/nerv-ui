# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
import json, os, pathlib, signal, subprocess
cwd='/Users/mang/Project/nerv-ui-worktrees/t06-f02-upload-lifecycle'
def run(args):
 r=subprocess.run(args,cwd=cwd,text=True,capture_output=True)
 return dict(args=args,exit=r.returncode,stdout=r.stdout,stderr=r.stderr)
proof=run(['lsof','-a','-p','98500,98510','-d','cwd'])
assert cwd+'/frontend/apps/playground' in proof['stdout']
processes=run(['ps','-p','98500,98510','-o','pid,ppid,command'])
assert cwd in processes['stdout'] and '5200' in processes['stdout']
for pid in [98510,98500]:
 try: os.kill(pid,signal.SIGTERM)
 except ProcessLookupError: pass
after=[run(['lsof','-nP','-iTCP:'+str(port),'-sTCP:LISTEN']) for port in [5199,5200]]
assert all(r['exit']==1 and not r['stdout'] for r in after),after
result=dict(cwdProof=proof,processProof=processes,after=after,signal='SIGTERM',t3TabClosed=True,egoFinished=True)
pathlib.Path('/tmp/nerv-ui-t06-f02/service-cleanup.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
