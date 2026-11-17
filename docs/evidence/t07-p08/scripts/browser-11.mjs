import { session,logger,instrument,state,click,choose,root,assert,fs } from './browser-common.mjs'
const {page}=await session(),save=logger('browser-11');
await page.goto('http://127.0.0.1:4309/p08/#schedule-panels/studio');await page.reload();await page.waitForSelector('[data-engine="dhtmlx"]');await instrument(page);
assert.match((await state(page)).title,/创作工作坊/);
await page.fill('input[aria-label="搜索工序"]','创作');await page.press('input[aria-label="搜索工序"]','Enter');
assert.match((await state(page)).selected,/晨间创作/);assert.match((await state(page)).detail,/06:30/);
await click(page,'锁定活动');assert.match((await state(page)).detail,/已锁定/);
await click(page,'显示或收起参考图');await page.waitForFunction(()=>document.querySelectorAll('[data-engine="dhtmlx"]').length===2);
await save('nested-studio-lock-and-two-instances',await state(page));
for(const label of ['小时','日','周','月']){
 await choose(page,'时间刻度',label);
 const data=await page.evaluate(()=>{
 const chart=document.querySelector('[data-seat="panels"]'),ref=document.querySelector('[data-seat="panels-reference"]');return{cells:[...chart.querySelectorAll('.gantt_scale_line:last-child .gantt_scale_cell')].map(e=>e.textContent),orderShift:chart.querySelectorAll('.nerv-shift-start').length,orderLegend:chart.nextElementSibling.textContent,resourceShift:ref.querySelectorAll('.nv-scheduling-shift-boundary').length,resourceBlock:ref.querySelectorAll('.nv-scheduling-block-window').length}});
 await save('kolkata-scale-'+label,data);assert.equal(data.orderLegend.includes('班次边界'),data.orderShift>0);assert.ok(data.resourceShift>0);assert.ok(data.resourceBlock>0);
}
await save('nested-asset-inventory',await state(page));console.log(await page.screenshot({path:root+'/screenshots/studio-nested.png'}));
const marker='/tmp/nerv-ui-p08-vendor-unavailable';
try{
 await fs.writeFile(marker,'P08 controlled missing-vendor lane\n');
 await page.reload();await page.waitForSelector('[data-seat="panels"] [data-slot="nv-schedule-timeline"]');
 await instrument(page);
 const missing=await save('native-http503',await state(page));assert.equal(missing.engines.includes('dhtmlx'),false);
 assert.equal(await page.evaluate(()=>document.querySelectorAll('.nerv-leg-row').length),0);
 assert.equal(await page.evaluate(()=>document.querySelector('button[aria-label="时间刻度"]').disabled),true);
 await page.click('[data-seat="panels"] [data-task-id="activity-a"]');
 let s=await save('native-actual-select',await state(page));assert.match(s.selected,/晨间创作/);assert.match(s.records,/仅提供只读查看/);assert.doesNotMatch(s.records,/已定位/);
 await click(page,'锁定为只读');assert.equal(await page.evaluate(()=>document.querySelector('[data-detail] button')),null);
 const url=await page.evaluate(()=>performance.getEntriesByType('resource').find(e=>/dhtmlxgantt\.es-.*\.js/.test(e.name))?.name);
 assert.ok(url);const response=await fetch(url),body=new Uint8Array(await response.arrayBuffer());assert.equal(response.status,503);
 await fs.mkdir(root+'/raw/responses',{recursive:true});await fs.writeFile(root+'/raw/responses/native-503.js',body);
 await save('native-503-body',{url,status:response.status,mime:response.headers.get('content-type'),bytes:body.length,sha256:(await import('node:crypto')).createHash('sha256').update(body).digest('hex')});
 console.log(await page.screenshot({path:root+'/screenshots/native-studio.png'}));
}finally{await fs.rm(marker,{force:true})}
await page.reload();await page.waitForSelector('[data-engine="dhtmlx"]');await save('vendor-reload-recovered',await state(page));
await page.click('a[href="#schedule-gantt"]');await page.waitForSelector('[data-engine="dhtmlx"]');
await page.click('a[href="#schedule-panels/library"]');await page.waitForSelector('[data-seat="panels"] [data-engine="dhtmlx"]');
await page.click('a[href="#"]');await page.waitForFunction(()=>!document.querySelector('[data-engine]'));
const final=await save('nested-route-cleanup',await state(page));assert.equal(final.engines.length,0);assert.equal(final.ghost,0);assert.equal(final.tooltips,0);
console.log(await page.snapshot());
