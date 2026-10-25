const fs=await import('node:fs/promises'),assert=(await import('node:assert/strict')).default
const p=(await taskSpace(76)).page('p1'),out='/Users/mang/Project/nerv-ui-worktrees/t07-p07-resource-editing/docs/evidence/t07-p07',marker='/tmp/nerv-ui-p07-vendor-unavailable',rows=[]
const state=()=>p.evaluate(()=>({url:location.href,vendor:document.querySelectorAll('[data-engine="dhtmlx"]').length,native:document.querySelectorAll('[data-slot="nv-schedule-timeline"]').length,editingNative:document.querySelectorAll('[data-seat="editing"] [data-slot="nv-schedule-timeline"]').length,unavailable:document.querySelector('[data-seat="editing"] [data-testid="engine-unavailable"]')?.textContent,count:document.querySelectorAll('[data-proposals]>li').length,tips:document.querySelectorAll('.nerv-tip').length,ghost:document.querySelectorAll('.nerv-drop-hint,.nerv-drop-cancel').length,resources:performance.getEntriesByType('resource').map(e=>({url:e.name,status:e.responseStatus}))}))
try{
 await p.goto('http://127.0.0.1:4288/p07/#schedule-resource-edit/studio')
 await fs.writeFile(marker,'P07 deliberate vendor unavailable\n')
 await p.reload();await p.waitForSelector('[data-seat="editing"] [data-testid="engine-unavailable"]')
 const missing=await state();assert.equal(missing.vendor,0);assert.equal(missing.count,0);rows.push({name:'real-http503-editing-unavailable',state:missing,initialErrors:null})
 const urls=JSON.parse(await fs.readFile(out+'/raw/resource-urls-nested-final.json','utf8'))
 const vendor=urls.selected.find(u=>/dhtmlxgantt\.es-/.test(u))
 const response=await p.fetch(vendor,{saveAs:out+'/raw/vendor-unavailable-response-final.js'})
 assert.equal(response.status,503);rows.push({name:'actual-vendor-503-response',response})
 await p.click('input[type="checkbox"] >> nth=0');await p.waitForSelector('[data-seat="editing"] [data-slot="nv-schedule-timeline"]')
 assert.match(await p.evaluate(()=>document.querySelector('p[role="status"]').textContent),/当前只读/); const readonly=await state();assert.equal(readonly.vendor,0);assert.equal(readonly.editingNative,1);assert.equal(readonly.ghost,0);assert.equal(readonly.tips,0);rows.push({name:'native-readonly-renderer',state:readonly})
 const b=await p.evaluate(()=>document.querySelector('[data-seat="editing"] [data-task-id="edit"]').getBoundingClientRect().toJSON())
 assert.ok(b.width>0&&b.height>0);await p.mouse.move(b.left+b.width/2,b.top+b.height/2);await p.mouse.down();await p.mouse.move(b.left+b.width/2+100,b.top+b.height/2,{steps:10,label:'查看只读活动安排'});await p.mouse.up()
 assert.equal((await state()).count,0);await p.screenshot({path:out+'/screenshots/native-http503-readonly-final.png'})
 await p.click('input[type="checkbox"] >> nth=0');await p.waitForSelector('[data-seat="editing"] [data-testid="engine-unavailable"]');assert.equal((await state()).editingNative,0);rows.push({name:'native-does-not-pretend-editing',state:await state()})
 await fs.unlink(marker);await p.reload();await p.waitForSelector('[data-seat="editing"] [data-engine="dhtmlx"]');const restored=await state();assert.equal(restored.vendor,2);assert.equal(restored.native,0);rows.push({name:'reload-restores-preserved-vendor',state:restored})
 console.log({observations:rows.length,vendor:restored.vendor})
}finally{await fs.rm(marker,{force:true});await fs.writeFile(out+'/raw/browser-14.json',JSON.stringify(rows,null,2))}
