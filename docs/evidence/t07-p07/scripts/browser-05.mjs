const fs=await import('node:fs/promises'),assert=(await import('node:assert/strict')).default
const p=(await taskSpace(76)).page('p1'),out='/Users/mang/Project/nerv-ui-worktrees/t07-p07-resource-editing/docs/evidence/t07-p07'
const observations=[]
const state=()=>p.evaluate(()=>({url:location.href,authority:document.querySelector('[data-authority]')?.textContent,count:document.querySelectorAll('[data-proposals]>li').length,status:document.querySelector('[role="status"]')?.textContent,source:document.querySelector('[data-seat="editing"] .gantt_task_line[task_id="edit"]')?.getBoundingClientRect().toJSON(),ghost:[...document.querySelectorAll('.nerv-drop-hint,.nerv-drop-cancel')].map(e=>({display:getComputedStyle(e).display,text:e.textContent,rect:e.getBoundingClientRect().toJSON()})),faded:document.querySelectorAll('.nerv-drag-source').length,tips:[...document.querySelectorAll('.nerv-tip')].map(e=>({display:getComputedStyle(e).display,rect:e.getBoundingClientRect().toJSON()})),charts:document.querySelectorAll('[data-engine="dhtmlx"]').length,probe:window.__p07}))
const settled=()=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(true)))))
const keyAction=async(selector)=>{await p.focus(selector);await p.keyboard.press('Space')}
const reset=async()=>{await p.click('text="恢复最初安排"');await p.click('text="定位首项活动"');await settled()}
const begin=async(native=false)=>{
 const b=(await state()).source
 if(native){await p.mouse.move(b.left+20,b.bottom-22);const h=await p.evaluate(()=>document.querySelector('[data-seat="editing"] .gantt_task_line[task_id="edit"] .task_start_date').getBoundingClientRect().toJSON());assert.ok(h.width>0);const q={x:h.left+h.width/2,y:h.bottom-22,hour:b.width/3};await p.mouse.move(q.x,q.y);await p.mouse.down();return q}
 const q={x:b.left+20,y:b.bottom-22,hour:b.width/3};await p.mouse.move(q.x,q.y);await p.mouse.down();return q
}
try {
 for(const reason of ['Escape','cancel-zone','outside','read-only','lock','authority','dimension']){
  await reset();const before=await state(),b=await begin();await p.mouse.move(b.x+70,b.y+20,{steps:8,label:'预览活动调整位置'})
  assert.equal((await state()).ghost[0].display,'flex')
  if(reason==='Escape')await p.keyboard.press('Escape')
  if(reason==='cancel-zone'){const c=(await state()).ghost[1].rect;await p.mouse.move(c.left+c.width/2,c.top+c.height/2,{steps:12,label:'放弃本次活动调整'})}
  if(reason==='outside')await p.mouse.move(40,200,{steps:10,label:'移到时间线外取消'})
  if(reason==='read-only')await keyAction('input[type="checkbox"] >> nth=0')
  if(reason==='lock')await keyAction('input[type="checkbox"] >> nth=1')
  if(reason==='authority')await keyAction('text="换一份安排"')
  if(reason==='dimension')await p.selectOption('select[aria-label="查看维度"]','team')
  await p.mouse.up();await settled();const after=await state()
  assert.equal(after.count,0,reason);assert.equal(after.faded,0,reason);assert.ok(after.ghost.every(g=>g.display==='none'),reason)
  if(reason==='authority')assert.match(after.authority,/河畔阅览室 · 分享小组.*16:00 至 10\/25 19:00/)
  else assert.equal(after.authority,before.authority,reason)
  observations.push({name:'custom-cancel-'+reason,state:after})
  await p.selectOption('select[aria-label="查看维度"]','workCenter')
 }
 for(const reason of ['Escape','read-only-restored','authority-before-native','read-only-before-native']){
  await reset();const before=await state(),b=await begin(true)
  if(reason==='authority-before-native')await keyAction('text="换一份安排"')
  if(reason==='read-only-before-native')await keyAction('input[type="checkbox"] >> nth=0')
  await p.mouse.move(b.x+b.hour,b.y,{steps:12,label:'预览原生端点调整'})
  assert.ok((await state()).ghost.every(g=>g.display==='none'))
  if(reason==='Escape')await p.keyboard.press('Escape')
  if(reason==='read-only-restored'){await keyAction('input[type="checkbox"] >> nth=0');await keyAction('input[type="checkbox"] >> nth=0')}
  await p.mouse.up();await settled();const after=await state();assert.equal(after.count,0,reason)
  if(reason==='authority-before-native')assert.match(after.authority,/河畔阅览室 · 分享小组.*16:00 至 10\/25 19:00/)
  else assert.equal(after.authority,before.authority,reason)
  observations.push({name:'native-cancel-'+reason,state:after})
 }
 await reset();let b=await begin();await p.mouse.move(b.x+50,b.y,{steps:8,label:'预览收起前活动调整'})
 await keyAction('text="收起安排"');await p.mouse.up();await settled();let after=await state()
 assert.equal(after.charts,1);assert.equal(after.tips.length,1);assert.equal(after.ghost.length,2);assert.equal(after.count,0)
 observations.push({name:'unmount-active-editing-reference-survives',state:after})
 await p.click('text="打开安排"');await p.waitForSelector('[data-seat="editing"] [data-engine="dhtmlx"]');await p.click('text="定位首项活动"')
 b=await begin();await p.mouse.move(b.x+50,b.y,{steps:8,label:'预览离开前活动调整'});await p.focus('a[href="#"]');await p.keyboard.press('Enter');await p.mouse.up();await settled();after=await state()
 assert.equal(after.charts,0);assert.equal(after.tips.length,0);assert.equal(after.ghost.length,0);observations.push({name:'route-cleanup',state:after})
 await p.goto('http://127.0.0.1:4287/#schedule-resource-edit/studio');await p.waitForSelector('[data-seat="editing"] [data-engine="dhtmlx"]')
 await p.selectOption('select[aria-label="查看维度"]','team');await p.click('text="定位首项活动"');b=await begin()
 await p.mouse.move(b.x+20,700,{steps:14,label:'改派到午后创作小组'});await p.mouse.up();await p.waitForFunction(()=>document.querySelector('summary')?.textContent.includes('（1）'));after=await state()
 assert.match(after.authority,/木作工坊 · 午后小组/);observations.push({name:'studio-team-accepted',state:after})
 await p.selectOption('select[aria-label="调整处理"]','replace');b=await begin();await p.mouse.move(b.x+b.hour,b.y,{steps:12,label:'提出下一小时安排'});await p.mouse.up();await p.waitForFunction(()=>document.querySelector('summary')?.textContent.includes('（2）'));after=await state()
 assert.match(after.authority,/绘画工坊 · 午后小组.*16:00 至 10\/25 19:00/);observations.push({name:'studio-reentrant-authority-replacement',state:after})
 await p.click('summary');await p.screenshot({path:out+'/screenshots/studio-assignment-records.png'})
 assert.equal(after.probe.errors.length,0);assert.equal(after.probe.rejections.length,0);assert.ok(after.probe.down.every(Boolean))
 console.log({observations:observations.length,authority:after.authority})
}finally{await fs.writeFile(out+'/raw/browser-05.json',JSON.stringify(observations,null,2))}
