const fs=await import('node:fs/promises')
const assert=(await import('node:assert/strict')).default
const task=await taskSpace(76),p=task.page('p1')
const out='/Users/mang/Project/nerv-ui-worktrees/t07-p07-resource-editing/docs/evidence/t07-p07'
const observations=[]
const state=()=>p.evaluate(()=>({authority:document.querySelector('[data-authority]')?.textContent,count:document.querySelectorAll('[data-proposals]>li').length,status:document.querySelector('[role="status"]')?.textContent,ghost:[...document.querySelectorAll('[data-seat="editing"] .nerv-drop-hint,[data-seat="editing"] .nerv-drop-cancel')].map(e=>({display:getComputedStyle(e).display,text:e.textContent,rect:e.getBoundingClientRect().toJSON()})),faded:document.querySelectorAll('.nerv-drag-source').length,scroll:document.querySelector('[data-seat="editing"] .gantt_ver_scroll')?.scrollTop,bars:[...document.querySelectorAll('[data-seat="editing"] .gantt_task_line[task_id="edit"]')].map(e=>e.getBoundingClientRect().toJSON()),rows:[...document.querySelectorAll('[data-seat="editing"] .gantt_task_row')].map(e=>({id:e.getAttribute('task_id'),rect:e.getBoundingClientRect().toJSON()})),reference:document.querySelector('[data-seat="reference"] .gantt_task_line[task_id="edit"]')?.getAttribute('style'),probe:window.__p07}))
const begin=async()=>{await p.hover('[data-seat="editing"] .gantt_task_line[task_id="edit"]');const b=(await state()).bars[0];const point={x:b.left+45,y:b.bottom-25};await p.mouse.move(point.x,point.y);await p.mouse.down();return point}
try {
  await p.click('text="恢复最初安排"')
  const initial=await state()
  let b=await begin()
  const lane=(await state()).rows.find(r=>r.id==='lane:place-1').rect
  await p.mouse.move(b.x+20,Math.min(lane.top+100,800),{steps:14,label:'改派到林间书屋'})
  observations.push({name:'cross-lane-ghost',state:await state()})
  await p.mouse.up()
  await p.waitForFunction(()=>document.querySelector('summary')?.textContent.includes('（1）'))
  let s=await state()
  assert.match(s.authority,/林间书屋 · 共读小组/)
  assert.equal(s.reference,initial.reference)
  assert.equal(s.faded,0)
  observations.push({name:'cross-lane-accepted',state:s})
  b=await begin()
  await p.mouse.move(b.x+70,b.y+20,{steps:8,label:'预览滚动改派位置'})
  await p.mouse.wheel(0,570,{label:'滚动到空闲空间'})
  await p.waitForFunction(()=>document.querySelector('[data-seat="editing"] .gantt_ver_scroll').scrollTop>400)
  const afterScroll=await state()
  observations.push({name:'held-pointer-after-scroll',state:afterScroll})
  const target=afterScroll.rows.find(r=>r.id==='lane:place-3').rect
  const targetY=Math.min(target.bottom-25,790)
  await p.mouse.move(b.x+70,targetY,{steps:10,label:'改派到安静角落'})
  const scrolledGhost=await state()
  observations.push({name:'scrolled-lane-ghost',state:scrolledGhost})
  assert.equal(scrolledGhost.ghost[0].display,'flex')
  assert.match(scrolledGhost.ghost[0].text,/安静角落/)
  await p.mouse.up()
  await p.waitForFunction(()=>document.querySelector('summary')?.textContent.includes('（2）'))
  s=await state()
  assert.match(s.authority,/安静角落 · 共读小组/)
  assert.equal(s.reference,initial.reference)
  observations.push({name:'scrolled-reassignment-accepted',state:s})
  await p.screenshot({path:out+'/screenshots/library-scrolled-reassignment.png'})
  console.log({observations:observations.length,authority:s.authority})
}finally{await fs.writeFile(out+'/raw/browser-02.json',JSON.stringify(observations,null,2))}
