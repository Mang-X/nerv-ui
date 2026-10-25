# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
import json, pathlib, re
out=pathlib.Path('/tmp/nerv-ui-t06-f02')
summary=[]
for name,expected in [('ui-final',770),('mobile-final',144),('host-final',217),('docs-ui',6),('docs-mobile',2)]:
    report=json.loads((out/(name+'.json')).read_text())
    assertions=[a for suite in report['testResults'] for a in suite['assertionResults']]
    assert report['success'] and len(assertions)==expected,(name,len(assertions))
    assert all(a['status']=='passed' for a in assertions),name
    assert report['numFailedTests']==report['numPendingTests']==0,name
    log=(out/(name+'.log')).read_text()
    summary.append(dict(name=name,total=expected,passed=len(assertions),failed=0,pending=0,success=True,
      unhandledField=report.get('numUnhandledErrors','NOT_PROVIDED'),
      unhandledLogLines=[s for s in log.splitlines() if re.search(r'unhandled|uncaught',s,re.I)]))
    if name=='host-final':
      (out/'requirement-tests.json').write_text(json.dumps([a['fullName'] for suite in report['testResults'] if suite['name'].endswith(('uploadLifecycle.test.ts','memoryUpload.test.ts')) for a in suite['assertionResults']],ensure_ascii=False,indent=2))
for lane in ['dev','prod']:
    data=json.loads((out/f'browser-{lane}.json').read_text())
    assert len(data)==73,(lane,len(data))
    assert all(not d['audit']['writes'] and not d['audit']['errors'] for d in data),lane
    assert sum('after late success' in d['label'] for d in data)==15
    assert sum('/unmount after late success' in d['label'] for d in data)==3
    summary.append(dict(name='browser-'+lane,readbacks=len(data),lateReleaseCases=15,unmountReadbacks=3,jsInstrumentedWrites=0,jsErrors=0))
(out/'result-validation.json').write_text(json.dumps(summary,indent=2))
print(json.dumps(summary,indent=2))
