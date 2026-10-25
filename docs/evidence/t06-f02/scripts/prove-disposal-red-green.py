# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
import hashlib, json, pathlib, subprocess
root=pathlib.Path('/Users/mang/Project/nerv-ui-worktrees/t06-f02-upload-lifecycle')
source=root/'frontend/packages/ui/src/components/ui/file-upload/useFileUpload.ts'
original=source.read_bytes()
disabled=original.replace(b'if (getCurrentScope()) {',b'if (false && getCurrentScope()) {',1)
assert disabled!=original
out=pathlib.Path('/tmp/nerv-ui-t06-f02')
(out/'disposal-controlled-red.patch').write_text('Only temporary mutation: if (getCurrentScope()) -> if (false && getCurrentScope())\n')
def run(name):
 return subprocess.run(['uv','run',str(out/'run.py'),name,'pnpm','-C','frontend','--filter','@nerv-iip/playground','exec','vp','test','run','src/files/uploadLifecycle.test.ts','-t','scope disposal','--reporter=json','--outputFile='+str(out/(name+'.json'))],cwd=root).returncode
try:
 source.write_bytes(disabled)
 red=run('red-disposal-controlled')
finally:
 source.write_bytes(original)
assert red==1,red
green=run('green-disposal-restored')
assert green==0,green
assert source.read_bytes()==original
result=dict(redExit=red,greenExit=green,restoredByteEqual=True,sha256=hashlib.sha256(original).hexdigest(),scope='controlled omission of scope disposal only; no committed mutation')
(out/'disposal-red-green.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
