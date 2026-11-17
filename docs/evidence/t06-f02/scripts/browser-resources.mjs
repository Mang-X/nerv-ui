const fs=await import('node:fs/promises'), crypto=await import('node:crypto'), path=await import('node:path');
const task=await taskSpace(31), page=task.page('p1'), out='/tmp/nerv-ui-t06-f02/resources', dist='/Users/mang/Project/nerv-ui-worktrees/t06-f02-upload-lifecycle/frontend/apps/playground/dist';
await fs.mkdir(out,{recursive:true});
await page.cdp('Network.enable',{}); await page.cdp('Runtime.enable',{});
await page.goto('http://127.0.0.1:5200/#files'); await page.reload();
await page.waitForFunction(()=>document.querySelector('[data-testid="file-preview-image"]')?.naturalWidth===1200); await page.evaluate(()=>document.fonts.ready);
for(const value of ['png','jpeg']) { await page.selectOption('select[aria-label="预览内容"]',value); await page.waitForFunction(()=>document.querySelector('[data-testid="file-preview-image"]')?.naturalWidth===640) }
const events=await page.events(); await fs.writeFile('/tmp/nerv-ui-t06-f02/prod-resources-cdp.json',JSON.stringify(events,null,2));
const requests=new Map(events.filter(e=>e.method==='Network.requestWillBeSent').map(e=>[e.params.requestId,e.params]));
const rows=[];
for(const e of new Map(events.filter(e=>e.method==='Network.responseReceived'&&e.params.response.url.startsWith('http://127.0.0.1:5200/')).map(e=>[new URL(e.params.response.url).pathname,e])).values()) {
  const p=e.params,url=new URL(p.response.url);
  const response=await page.cdp('Network.getResponseBody',{requestId:p.requestId});
  const bytes=Buffer.from(response.body,response.base64Encoded?'base64':'utf8');
  const local=path.join(dist,url.pathname==='/'?'index.html':decodeURIComponent(url.pathname));
  const expected=await fs.readFile(local); if(!bytes.equals(expected))throw Error('dist mismatch '+url.pathname);
  const filename=url.pathname==='/'?'index.html':path.basename(url.pathname);
  await fs.writeFile(path.join(out,filename+'.response.bin'),bytes);
  rows.push({url:p.response.url,status:p.response.status,mime:p.response.mimeType,headers:p.response.headers,method:requests.get(p.requestId)?.request.method,initiator:requests.get(p.requestId)?.initiator,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),distPath:local,distEqual:true,bodyFile:'resources/'+filename+'.response.bin',fromServiceWorker:p.response.fromServiceWorker,fromDiskCache:p.response.fromDiskCache});
}
const all=[...requests.values()];
const writes=all.filter(p=>!['GET','HEAD'].includes(p.request.method));
const external=all.filter(p=>/^https?:/.test(p.request.url)&&!p.request.url.startsWith('http://127.0.0.1:5200/'));
const lazy=all.filter(p=>/wasm|OfficePreview|PdfPreview|docx-|xlsx-|pptx-/i.test(p.request.url));
if(writes.length||external.length||lazy.length)throw Error('unexpected resource request');
await fs.writeFile('/tmp/nerv-ui-t06-f02/prod-resource-receipt.json',JSON.stringify({rows,writes,externalHttp:external,unloadedLazyRuntimeRequests:lazy},null,2));
await page.cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
await page.evaluate(()=>scrollTo(0,0));
const narrow=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,scale:visualViewport.scale}));
if(narrow.width!==390||narrow.scrollWidth!==390)throw Error('narrow overflow');
await page.screenshot({path:'/tmp/nerv-ui-t06-f02/prod-390.png'});
await page.cdp('Emulation.clearDeviceMetricsOverride',{}); await page.keyboard.press('ControlOrMeta+0');
const native=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,scale:visualViewport.scale,dpr:devicePixelRatio}));
await fs.writeFile('/tmp/nerv-ui-t06-f02/browser-geometry.json',JSON.stringify({narrow,native},null,2));
await page.screenshot({path:'/tmp/nerv-ui-t06-f02/prod-native.png'});
console.log({resources:rows.length,narrow,native}); console.log(await page.snapshot());
