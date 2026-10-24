const task=await taskSpace(5),page=task.page('p1')
const {setup}=await import('/tmp/nerv-ui-t04-n03/browser-cdp.mjs')
const {state,write}=await import('/tmp/nerv-ui-t04-n03/browser-helper.mjs')
const assert=(await import('node:assert/strict')).default
const results=[]
let a=await setup(page)
await a.button('写下安排');await a.click('#arrangement-duration')
assert.equal(await page.evaluate(()=>document.querySelectorAll('[data-mobile-overlay-layer]').length),4)
await page.goto('http://127.0.0.1:4317/#desktop');a=await setup(page)
assert.equal(await page.evaluate(()=>document.querySelectorAll('[role=dialog],[data-mobile-overlay-layer]').length),0)
assert.equal(await page.evaluate(()=>document.body.style.pointerEvents==='none'),false)
for(const [hash,heading] of [['desktop','让想法有序向前'],['touch','共享阅读角'],['mobile','周末随行'],['mobile-input','随心记录'],['mobile-overlays','片刻安排']]){
 await page.goto('http://127.0.0.1:4317/#'+hash);a=await setup(page)
 assert.equal(await page.evaluate(h=>document.querySelector('h1')?.textContent.trim()===h,heading),true)
 results.push({hash,state:await state(page)})
}
const urls=await page.evaluate(()=>[location.origin+'/',...new Set(performance.getEntriesByType('resource').map(r=>r.name).filter(u=>u.includes('/assets/')))])
const responses=[]
for(let i=0;i<urls.length;i++){const path=`/tmp/nerv-ui-t04-n03/response-${i}.bin`;const r=await page.fetch(urls[i],{saveAs:path});assert.equal(r.status,200);responses.push({url:urls[i],status:r.status,headers:r.headers,file:path})}
await write('browser-routes-final',results);await write('browser-responses-final',responses)
console.log(JSON.stringify({routes:results.map(r=>r.hash),responses},null,2))
