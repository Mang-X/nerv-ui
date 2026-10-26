import { session,logger,instrument,state,click,choose,root,assert,fs } from './browser-common.mjs'
const {page}=await session(),save=logger('browser-10');
await page.goto('http://127.0.0.1:4308/#schedule-panels/library');await page.reload();await page.waitForSelector('[data-engine="dhtmlx"]');await instrument(page);
await click(page,'显示或收起参考图');await page.waitForFunction(()=>document.querySelectorAll('[data-engine="dhtmlx"]').length===2);
const start=await state(page);await save('two-instances',start);
for(const label of ['小时','日','周','月']){
 await choose(page,'时间刻度',label);
 const data=await page.evaluate(()=>{
  const chart=document.querySelector('[data-seat="panels"]'),ref=document.querySelector('[data-seat="panels-reference"]');
  const read=(el,legend)=>({cells:[...el.querySelectorAll('.gantt_scale_line:last-child .gantt_scale_cell')].map(e=>e.textContent),shift:el.querySelectorAll('.nerv-shift-start,.nv-scheduling-shift-boundary').length,block:el.querySelectorAll('.nerv-cell-block,.nv-scheduling-block-window').length,offwork:el.querySelectorAll('.nerv-offwork,.nv-scheduling-offwork').length,legend:legend?.textContent,engine:el.querySelector('[data-engine]')?.getAttribute('data-engine')});
  return{order:read(chart,chart.nextElementSibling),resource:read(ref,ref.querySelector('.border-t'))};
 });
 await save('real-scale-'+label,data);assert.equal(data.order.engine,'dhtmlx');assert.equal(data.resource.engine,'dhtmlx');
 assert.equal(data.order.legend.includes('班次边界'),data.order.shift>0);
 assert.equal(data.order.legend.includes('空间整理'),data.order.block>0);
 assert.equal(data.order.legend.includes('非工作时段'),data.order.offwork>0);
 assert.ok(data.resource.shift>0);assert.ok(data.resource.block>0);assert.match(data.resource.legend,/班次边界/);
}
await choose(page,'时间刻度','自适应');assert.ok(await page.evaluate(()=>document.querySelector('[data-seat="panels"] .gantt_scale_line:last-child').textContent.includes('07:00')));
await choose(page,'分组维度','小组');await choose(page,'泳道排序','利用率降序');await choose(page,'泳道排序','仅有排程');await choose(page,'泳道排序','名称升序');
await save('group-and-order-controlled',await state(page));
await click(page,'显示或收起活动图');assert.equal(await page.evaluate(()=>document.querySelectorAll('[data-engine="dhtmlx"]').length),1);
await page.click('[data-seat="panels-reference"] .gantt_task_line[data-task-id="activity-a"]');assert.match((await state(page)).records,/尚无活动记录/); // reference selection has separate feedback
await click(page,'显示或收起活动图');await page.waitForFunction(()=>document.querySelectorAll('[data-engine="dhtmlx"]').length===2);
await save('remount-reference-survives',await state(page));
const initial=await page.evaluate(()=>({dark:document.documentElement.classList.contains('dark'),width:innerWidth,height:innerHeight,dpr:devicePixelRatio}));
await click(page,initial.dark?'浅色':'深色');
const changed=await page.evaluate(()=>({dark:document.documentElement.classList.contains('dark'),color:getComputedStyle(document.querySelector('.gantt_container')).backgroundColor}));assert.notEqual(changed.dark,initial.dark);await save('theme-changed',changed);
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1000,height:900,deviceScaleFactor:initial.dpr,mobile:false});await click(page,'切换阅读宽度');
await save('narrow-layout',await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,toolbar:document.querySelector('[data-toolbar]').getBoundingClientRect().toJSON(),bars:[...document.querySelectorAll('.gantt_task_line')].map(e=>e.getBoundingClientRect().toJSON())})));
console.log(await page.screenshot({path:root+'/screenshots/narrow-current.png'}));
await click(page,initial.dark?'深色':'浅色');await page.cdp('Emulation.clearDeviceMetricsOverride',{});
await page.click('a[href="#schedule-gantt"]');await page.waitForFunction(()=>location.hash==='#schedule-gantt');await page.waitForSelector('[data-engine="dhtmlx"]');
let s=await save('old-entry-return',await state(page));assert.ok(s.engines.length===2);assert.equal(s.ghost,0);
await page.click('a[href="#schedule-panels/library"]');await page.waitForSelector('[data-seat="panels"] [data-engine="dhtmlx"]');
await page.click('a[href="#"]');await page.waitForFunction(()=>!document.querySelector('[data-engine]'));
s=await save('route-cleanup',await state(page));assert.equal(s.engines.length,0);assert.equal(s.ghost,0);assert.equal(s.tooltips,0);assert.deepEqual(s.errors,[]);assert.deepEqual(s.rejections,[]);
console.log(await page.snapshot());
