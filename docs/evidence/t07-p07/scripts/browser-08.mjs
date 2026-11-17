const fs = await import('node:fs/promises')
const assert = (await import('node:assert/strict')).default
const task = await taskSpace(76)
const page = task.page('p1')
const out = '/Users/mang/Project/nerv-ui-worktrees/t07-p07-resource-editing/docs/evidence/t07-p07'
const observations = []
const state = () => page.evaluate(() => ({
  authority: document.querySelector('[data-authority]')?.textContent,
  recordCount: document.querySelectorAll('[data-proposals] > li').length,
  records: document.querySelector('[data-proposals]')?.textContent,
  summary: document.querySelector('summary')?.textContent,
  status: document.querySelector('[role="status"]')?.textContent,
  bars: [...document.querySelectorAll('[data-seat="editing"] .gantt_task_line[task_id="edit"]')].map(e => ({rect:e.getBoundingClientRect().toJSON(),style:e.getAttribute('style'),text:e.textContent})),
  ghost: [...document.querySelectorAll('.nerv-drop-hint,.nerv-drop-cancel')].map(e => ({cls:e.className,display:getComputedStyle(e).display,text:e.textContent,rect:e.getBoundingClientRect().toJSON()})),
  faded: document.querySelectorAll('.nerv-drag-source').length,
  tips: [...document.querySelectorAll('.nerv-tip')].map(e=>({display:getComputedStyle(e).display,rect:e.getBoundingClientRect().toJSON()})),
  probe: window.__p07,
}))
try {
  await page.goto('http://127.0.0.1:4287/#schedule-resource-edit/library')
  await page.reload()
  await page.waitForSelector('[data-seat="editing"] [data-engine="dhtmlx"]')
  await page.evaluate(()=>{window.__p07={errors:[],rejections:[],down:[],up:[]};addEventListener('error',e=>window.__p07.errors.push(e.message));addEventListener('unhandledrejection',e=>window.__p07.rejections.push(String(e.reason)));document.addEventListener('mousedown',e=>window.__p07.down.push({trusted:e.isTrusted,x:e.clientX,y:e.clientY}),true);document.addEventListener('mouseup',e=>window.__p07.up.push({trusted:e.isTrusted,authority:document.querySelector('[data-authority]')?.textContent,bar:document.querySelector('[data-seat="editing"] .gantt_task_line[task_id="edit"]')?.outerHTML}))})

  await page.hover('[data-seat="editing"] .gantt_task_line[task_id="edit"]')
  observations.push({name:'initial-hover',state:await state(),handles:await page.evaluate(()=>[...document.querySelectorAll('[data-seat="editing"] .gantt_task_line[task_id="edit"] .gantt_task_drag')].map(e=>({cls:e.className,display:getComputedStyle(e).display,rect:e.getBoundingClientRect().toJSON()})))})
  const b=(await state()).bars[0].rect
  const x=b.left+40,y=b.bottom-28
  await page.mouse.move(x,y)
  await page.mouse.down()
  await page.mouse.move(x+b.width,y,{steps:12,label:'移动活动三个小时'})
  const moving=await state()
  assert.equal(moving.ghost[0].display,'flex')
  assert.equal(moving.tips.filter(t=>t.display!=='none').length,0)
  observations.push({name:'horizontal-ghost',state:moving})
  await page.mouse.up()
  await page.waitForFunction(()=>document.querySelector('summary')?.textContent.includes('（1）'))
  const moved=await state()
  assert.match(moved.authority,/13:00 至 10\/25 16:00/)
  assert.equal(moved.faded,0)
  assert.ok(moved.ghost.every(g=>g.display==='none'))
  assert.match(moved.status,/已采用/)
  observations.push({name:'horizontal-accepted',state:moved})
  await page.selectOption('select[aria-label="调整处理"]','reject')
  await page.hover('[data-seat="editing"] .gantt_task_line[task_id="edit"]')
  const handles=await page.evaluate(()=>[...document.querySelectorAll('[data-seat="editing"] .gantt_task_line[task_id="edit"] .gantt_task_drag')].map(e=>({prop:e.getAttribute('data-bind-property'),rect:e.getBoundingClientRect().toJSON()})))
  observations.push({name:'native-handles',handles})
  const left=handles.find(h=>h.prop==='start_date').rect
  assert.ok(left.width>0 && left.height>0)
  const hour=moved.bars[0].rect.width/3
  await page.mouse.move(left.left+left.width/2,left.bottom-20)
  await page.mouse.down()
  await page.mouse.move(left.left+left.width/2-hour,left.bottom-20,{steps:14,label:'调整活动开始时间'})
  const resizing=await state()
  assert.ok(resizing.ghost.every(g=>g.display==='none'))
  observations.push({name:'native-left-active',state:resizing})
  await page.mouse.up()
  await page.waitForFunction(()=>document.querySelector('summary')?.textContent.includes('（2）'))
  const rejected=await state()
  assert.equal(rejected.authority,moved.authority)
  assert.equal(rejected.bars[0].style,moved.bars[0].style)
  observations.push({name:'native-left-rejected',state:rejected})
  await page.selectOption('select[aria-label="调整处理"]','accept')
  await page.hover('[data-seat="editing"] .gantt_task_line[task_id="edit"]')
  const right=await page.evaluate(()=>document.querySelector('[data-seat="editing"] .gantt_task_line[task_id="edit"] .task_end_date').getBoundingClientRect().toJSON())
  await page.mouse.move(right.left+right.width/2,right.bottom-20)
  await page.mouse.down()
  await page.mouse.move(right.left+right.width/2+hour*2,right.bottom-20,{steps:14,label:'调整活动结束时间'})
  assert.ok((await state()).ghost.every(g=>g.display==='none'))
  await page.mouse.up()
  await page.waitForFunction(()=>document.querySelector('summary')?.textContent.includes('（3）'))
  const resized=await state()
  assert.match(resized.authority,/13:00 至 10\/25 18:00/)
  assert.match(resized.authority,/晨光书房 · 共读小组/)
  observations.push({name:'native-right-accepted',state:resized})
  await page.click('summary')
  await page.screenshot({path:out+'/screenshots/library-final-time-edits.png'})
  const final=await state()
  assert.match(final.records,/阅读与交流.*移动时间.*调整开始时间.*调整结束时间/s)
  assert.equal(final.probe.errors.length,0)
  assert.equal(final.probe.rejections.length,0)
  assert.ok(final.probe.down.every(e=>e.trusted))
  observations.push({name:'records-and-native-rollback',state:final})
  console.log({observations:observations.length,final:final.authority})
} finally {
  await fs.writeFile(out+'/raw/browser-08.json',JSON.stringify(observations,null,2))
}
