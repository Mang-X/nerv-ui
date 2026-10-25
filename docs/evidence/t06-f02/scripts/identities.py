# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
import json, pathlib, subprocess
cwd='/Users/mang/Project/nerv-ui-worktrees/t06-f02-upload-lifecycle'
def git(path,*args): return subprocess.check_output(['git','-C',path,*args],cwd=cwd).decode().strip()
root='/Users/mang/Project/nerv-ui'
old='/Users/mang/.t3/worktrees/Nerv-IIP/t3-5c5dc61d'
assert git(root,'rev-parse','main')=='599031a688496679e300458f56a1896d41ac8f81'
assert git(old,'rev-parse','HEAD')=='79b1578f2b75f55709765b5e7882aaf33146c603'
assert git(old,'rev-parse','main')=='ecb7626378e446dcc361cfc4f3c43227ba7e8364'
assert not git(root,'status','--short')
assert not git(old,'status','--short')
result={name:dict(path=path,head=git(path,'rev-parse','HEAD'),tree=git(path,'rev-parse','HEAD^{tree}'),branch=git(path,'branch','--show-current'),status=git(path,'status','--short'),main=git(path,'rev-parse','main')) for name,path in [('target',cwd),('root',root),('source',old)]}
pathlib.Path('/tmp/nerv-ui-t06-f02/identities-final.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
