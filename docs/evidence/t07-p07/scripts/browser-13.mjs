const fs=await import('node:fs/promises'),assert=(await import('node:assert/strict')).default
const p=(await taskSpace(76)).page('p1'),out='/Users/mang/Project/nerv-ui-worktrees/t07-p07-resource-editing/docs/evidence/t07-p07',rows=[]
const inventory=async(lane)=>{
 const r=await p.evaluate(()=>({url:location.href,all:performance.getEntriesByType('resource').map(e=>({url:e.name,status:e.responseStatus,initiator:e.initiatorType}))}))
 const base=new URL(r.url);base.hash='';const selected=[base.href,...r.all.filter(e=>/\.(js|css|woff2)$/.test(new URL(e.url).pathname)).map(e=>e.url)]
 assert.equal(selected.length,7);assert.ok(selected.every(u=>new URL(u).origin===base.origin))
 await fs.writeFile(out+'/raw/resource-urls-'+lane+'-final.json',JSON.stringify({...r,selected},null,2))
 return r
}
const state=()=>p.evaluate(()=>({url:location.href,authority:document.querySelector('[data-authority]')?.textContent,count:document.querySelectorAll('[data-proposals]>li').length,records:document.querySelector('[data-proposals]')?.textContent,b:document.querySelector('[data-seat="editing"] .gantt_task_line[task_id="edit"]')?.getBoundingClientRect().toJSON(),ghost:[...document.querySelectorAll('.nerv-drop-hint,.nerv-drop-cancel')].map(e=>getComputedStyle(e).display),rows:[...document.querySelectorAll('[data-seat="editing"] .gantt_task_row')].map(e=>({id:e.getAttribute('task_id'),rect:e.getBoundingClientRect().toJSON()})),probe:window.__p07}))
try{
 rows.push({name:'fresh-root-resources',inventory:await inventory('root')})
 await p.goto('http://127.0.0.1:4288/p07/#schedule-resource-edit/studio');await p.waitForSelector('[data-seat="editing"] [data-engine="dhtmlx"]')
 await p.evaluate(()=>{window.__p07={errors:[],rejections:[],down:[]};addEventListener('error',e=>window.__p07.errors.push(e.message));addEventListener('unhandledrejection',e=>window.__p07.rejections.push(String(e.reason)));document.addEventListener('mousedown',e=>window.__p07.down.push(e.isTrusted),true)})
 const before=await state(),b=before.b,target=before.rows.find(r=>r.id==='lane:place-1').rect,x=b.left+20,y=b.bottom-22
 await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+b.width,Math.min(target.top+120,790),{steps:15,label:'调整创作空间与时间'});await p.mouse.up();await p.waitForFunction(()=>document.querySelector('summary')?.textContent.includes('（1）'))
 const accepted=await state();assert.match(accepted.authority,/陶艺工坊 · 晨间小组.*13:00 至 10\/25 16:00/);assert.ok(accepted.ghost.every(g=>g==='none'));assert.ok(accepted.probe.down.every(Boolean));assert.equal(accepted.probe.errors.length,0);assert.equal(accepted.probe.rejections.length,0);rows.push({name:'nested-studio-accepted',state:accepted})
 await p.click('summary');await p.screenshot({path:out+'/screenshots/nested-studio-final.png'})
 rows.push({name:'fresh-nested-resources',inventory:await inventory('nested')})
 await p.click('a[href="#schedule-resources/studio"]');await p.waitForSelector('[data-seat="resources"] [data-engine="dhtmlx"]');assert.equal(await p.url(),'http://127.0.0.1:4288/p07/#schedule-resources/studio');rows.push({name:'nested-old-resource-entry-return',url:await p.url()})
 console.log({observations:rows.length})
}finally{await fs.writeFile(out+'/raw/browser-13.json',JSON.stringify(rows,null,2))}
