const fs=await import('node:fs/promises'),assert=(await import('node:assert/strict')).default
const p=(await taskSpace(76)).page('p1'),out='/Users/mang/Project/nerv-ui-worktrees/t07-p07-resource-editing/docs/evidence/t07-p07'
const observations=[]
const state=()=>p.evaluate(()=>({authority:document.querySelector('[data-authority]').textContent,count:document.querySelectorAll('[data-proposals]>li').length,scroll:document.querySelector('[data-seat="editing"] .gantt_ver_scroll').scrollTop,source:document.querySelector('[data-seat="editing"] .gantt_task_line[task_id="edit"]')?.getBoundingClientRect().toJSON(),ghost:[...document.querySelectorAll('[data-seat="editing"] .nerv-drop-hint,[data-seat="editing"] .nerv-drop-cancel')].map(e=>({display:getComputedStyle(e).display,text:e.textContent,rect:e.getBoundingClientRect().toJSON()})),rows:[...document.querySelectorAll('[data-seat="editing"] .gantt_task_row')].map(e=>({id:e.getAttribute('task_id'),rect:e.getBoundingClientRect().toJSON()})),probe:window.__p07}))
try {
 const s=await state(),b=s.source,x=b.left+20,y=b.bottom-25
 assert.equal(await p.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('[task_id]')?.getAttribute('task_id'),{x,y}),'edit')
 await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+70,y+20,{steps:8,label:'预览滚动改派位置'})
 await p.mouse.wheel(0,570,{label:'滚动到空闲空间'})
 await p.waitForFunction(()=>document.querySelector('[data-seat="editing"] .gantt_ver_scroll').scrollTop>400)
 const scrolled=await state();observations.push({name:'held-pointer-after-scroll',state:scrolled})
 const target=scrolled.rows.find(r=>r.id==='lane:place-3').rect
 await p.mouse.move(x+70,Math.min(target.bottom-25,790),{steps:10,label:'改派到安静角落'})
 const ghost=await state();observations.push({name:'scrolled-lane-ghost',state:ghost})
 assert.equal(ghost.ghost[0].display,'flex');assert.match(ghost.ghost[0].text,/安静角落/)
 await p.mouse.up()
 await p.waitForFunction(()=>document.querySelector('summary')?.textContent.includes('（2）'))
 const done=await state();observations.push({name:'scrolled-lane-accepted',state:done})
 assert.match(done.authority,/安静角落 · 共读小组/)
 await p.screenshot({path:out+'/screenshots/library-scrolled-reassignment.png'})
 console.log({done:done.authority,observations:observations.length})
}finally{await fs.writeFile(out+'/raw/browser-03.json',JSON.stringify(observations,null,2))}
