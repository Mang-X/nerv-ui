# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
from pathlib import Path
import json,hashlib,subprocess,datetime
root=Path('/Users/mang/Project/nerv-ui-worktrees/t06-f01-files-host');raw=Path('/tmp/nerv-ui-t06-f01/raw')
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip();assert head=='4a0675711c69df5ce422313590dfbe7fa7c2be42'
for lane,port in [('dev',5196),('prod',5197)]:
 upload=json.loads((raw/f'{lane}-upload.json').read_text());assert len(upload)==21 and upload[-1]['label']=='final clear'
 assert upload[0]['counts'].startswith('create 0 · transport 0 · complete 0')
 assert upload[-1]['audit']['writes']==upload[-1]['audit']['errors']==[]
 assert all(f'127.0.0.1:{port}/' in u['url'] for u in upload[-1]['audit']['urls'])
 preview=json.loads((raw/f'{lane}-preview.json').read_text());assert len(preview)==29 and preview[-1]['label']=='leave page cleanup'
 audit=preview[-1]['audit'];assert len(audit['urls'])==len(audit['revoked'])==37
 assert all(u['url'] in audit['revoked'] and f'127.0.0.1:{port}/' in u['url'] for u in audit['urls'])
 assert audit['errors']==audit['writes']==[]
layout=json.loads((raw/'prod-layout-routes.json').read_text());assert len(layout)==34
for row in layout:
 if 'width' in row:assert row['width']==row['scrollWidth']
 if row['label']=='round trip':assert row['returned']
resource=json.loads((raw/'prod-resource-receipt.json').read_text());assert len(resource['rows'])==8
assert resource['writes']==resource['externalHttp']==resource['unloadedLazyRuntimeRequests']==[]
for row in resource['rows']:
 assert row['status']==200 and row['distEqual'] and not row['fromDiskCache']
 b=(raw/row['bodyFile']).read_bytes();assert len(b)==row['bytes'] and hashlib.sha256(b).hexdigest()==row['sha256']
 assert b==Path(row['distPath']).read_bytes()
for lane in ['dev-upload','prod-upload','dev-preview','prod-preview','prod-resources-cdp']:
 source=raw/(lane+'.json' if lane.endswith('cdp') else lane+'-network.json')
 all=json.loads(source.read_text());requests=[e['params']['request'] for e in all if e['method']=='Network.requestWillBeSent' and e['params']['request']['url'].startswith(('http://127.0.0.1:5196/','http://127.0.0.1:5197/'))]
 responses=[e['params']['response'] for e in all if e['method']=='Network.responseReceived' and e['params']['response']['url'].startswith(('http://127.0.0.1:5196/','http://127.0.0.1:5197/'))]
 writes=[r for r in requests if r['method'] not in ['GET','HEAD']];assert writes==[]
 (raw/(lane+'-network-summary.json')).write_text(json.dumps(dict(requests=[dict(url=r['url'],method=r['method']) for r in requests],responses=[dict(url=r['url'],status=r['status'],mimeType=r['mimeType']) for r in responses],writes=writes),indent=2))
fixtures=[dict(path=str(p.relative_to(root)),bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()) for p in sorted((root/'frontend/apps/playground/public/files').iterdir())]
result=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),head=head,tree=subprocess.check_output(['git','rev-parse','HEAD^{tree}'],cwd=root,text=True).strip(),base='e3909896e2072d4a4b874161f29a555cbe50168d',verified=dict(devUpload=21,prodUpload=21,devPreview=29,prodPreview=29,layout=34,resourcesByteEqual=8,urlRegistryEach=[37,37]),fixtures=fixtures,browserClean=json.loads((raw/'browser-cleanup.json').read_text()),servicesClean=json.loads((raw/'services-cleanup.json').read_text()))
(raw/'final-certificate.json').write_text(json.dumps(result,indent=2));print(json.dumps({k:v for k,v in result.items() if k not in ['fixtures','browserClean','servicesClean']},indent=2))
