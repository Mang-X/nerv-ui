# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
import json,re,hashlib,subprocess
from pathlib import Path
root=Path('/Users/mang/Project/nerv-ui-worktrees/t06-f01-files-host');raw=Path('/tmp/nerv-ui-t06-f01/raw')
ui=json.loads((raw/'ui-final2.json').read_text());assert ui['success'] and ui['numPassedTests']==770 and ui['numFailedTests']==ui['numPendingTests']==0
assert all(a['status']=='passed' for suite in ui['testResults'] for a in suite['assertionResults'])
host=json.loads((raw/'host-final4.json').read_text());assert host['success'];assert host['numFailedTests']==host['numPendingTests']==0
assert all(a['status']=='passed' for s in host['testResults'] for a in s['assertionResults'])
logs=['ui-final2.log','full-tests.log','host-final4.log','docs-ui-final.log','docs-mobile.log']
for p in logs:
 text=(raw/p).read_text();assert not re.search(r'Unhandled Errors|Unhandled Rejection|Uncaught Exception',text),p
suites=[]
for p in logs:
 text=(raw/p).read_text();suites.append(dict(log=p,counts=re.findall(r'Tests\s+(\d+) passed',text),unhandledLogMarker=False))
paths=subprocess.check_output(['git','diff','--name-only','e3909896e2072d4a4b874161f29a555cbe50168d'],cwd=root).decode().splitlines()
files=[dict(path=p,bytes=(root/p).stat().st_size,sha256=hashlib.sha256((root/p).read_bytes()).hexdigest()) for p in paths if (root/p).is_file() and not p.startswith('docs/evidence/')]
result=dict(uiSuccess=ui['success'],uiCount=ui['numPassedTests'],head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),tree=subprocess.check_output(['git','rev-parse','HEAD^{tree}'],cwd=root,text=True).strip(),hostSuccess=host['success'],hostCount=host['numPassedTests'],allHostAssertionsPassed=True,numUnhandledErrorsField='NOT_PROVIDED_BY_RUNNER',logs=suites,publicTests=[a['fullName'] for s in host['testResults'] if any(x in s['name'] for x in ['publicFiles.test.ts','FilesDemo.test.ts','memoryUpload.test.ts','App.test.ts']) for a in s['assertionResults']],files=files)
(raw/'verified-results.json').write_text(json.dumps(result,indent=2));print(json.dumps({k:v for k,v in result.items() if k not in ('files','publicTests')},indent=2))
