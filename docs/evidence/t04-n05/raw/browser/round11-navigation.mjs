import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const p=(await taskSpace(15)).page('p1');
await p.goto('http://127.0.0.1:4185/#mobile-feedback');await p.reload();await p.cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
const snap=await p.snapshot({scope:'full_page'});console.log(snap);
const routes=[];
for(const [hash,title] of [['#desktop','让想法有序向前'],['#touch','共享阅读角'],['#mobile','周末随行'],['#mobile-input','随心记录'],['#mobile-overlays','片刻安排'],['#mobile-lists','翻阅时光']]){
 await p.click(`a[href="${hash}"]`);await p.waitForFunction(t=>document.querySelector('h1')?.textContent.trim()===t,title);
 routes.push({hash,heading:await p.evaluate(()=>document.querySelector('h1').textContent.trim())});
 await p.click('a[href="#mobile-feedback"]');await p.waitForFunction(()=>document.querySelector('h1')?.textContent.trim()==='片刻回响');
 assert.equal(await p.evaluate(()=>document.querySelector('[aria-label="收集状态"]').textContent.trim()),'尚未收集 · 请求 0 次');
}
await p.evaluate(()=>{const originalSet=window.setTimeout.bind(window),originalClear=window.clearTimeout.bind(window);window.n05Timer={pending:new Set(),fired:0,arm:null,before:null};window.setTimeout=(fn,delay,...args)=>{if(delay!==700&&delay!==1200)return originalSet(fn,delay,...args);let id;id=originalSet(()=>{window.n05Timer.pending.delete(id);window.n05Timer.fired++;fn(...args)},delay);window.n05Timer.pending.add(id);if(window.n05Timer.arm===delay){window.n05Timer.arm=null;queueMicrotask(()=>{window.n05Timer.before={pending:window.n05Timer.pending.size,fired:window.n05Timer.fired};location.hash='#mobile'})}return id};window.clearTimeout=id=>{window.n05Timer.pending.delete(id);return originalClear(id)}});
const cleanup=[];
for(const [delay,text] of [[700,'收集回响'],[1200,'短暂提示']]){
 await p.evaluate(delay=>{window.n05Timer.arm=delay;window.n05OldImage=document.querySelector('[data-slot="mobile-image"] img');window.n05OldAvatar=document.querySelector('[data-live-avatar] img')},delay);
 await p.click(`button:text-is("${text}")`);await p.waitForFunction(()=>location.hash==='#mobile');
 const receipt=await p.evaluate(()=>({before:window.n05Timer.before,pending:window.n05Timer.pending.size,fired:window.n05Timer.fired,toast:!!document.querySelector('.nv-m-toast-layer'),oldImageConnected:window.n05OldImage.isConnected,oldAvatarConnected:window.n05OldAvatar.isConnected}));
 assert.equal(receipt.before.pending,1);assert.equal(receipt.pending,0);assert.equal(receipt.fired,0);assert.equal(receipt.toast,false);assert.equal(receipt.oldImageConnected,false);assert.equal(receipt.oldAvatarConnected,false);
 await p.evaluate(()=>new Promise(r=>setTimeout(r,1500)));assert.equal(await p.evaluate(()=>window.n05Timer.fired),0);cleanup.push({delay,...receipt,lateCallbacks:0});
 await p.click('a[href="#mobile-feedback"]');await p.waitForSelector('[data-slot="notice-bar"]');
}
await fs.writeFile('/tmp/nerv-ui-t04-n05/browser/navigation-cleanup.json',JSON.stringify({routes,cleanup,input:'real Chromium anchor/button mouse actions; timer ledger observes actual set/clearTimeout, automatic hash navigation in microtask at scheduling boundary'},null,2));
console.log({routes,cleanup,PASS:true});
