const task=await taskSpace(9),page=task.page('p1');
await page.reload();
const {setup}=await import('/tmp/nerv-ui-t04-n04/browser/helpers.mjs');const a=await setup(page);
const assert=(await import('node:assert/strict')).default;
await a.align('.nv-m-pr-scroll');
await page.evaluate(()=>{window.n04TouchEvents=[];for(const type of ['pointerdown','pointermove','pointercancel','pointerup'])document.querySelector('.nv-m-pr-inner').addEventListener(type,e=>window.n04TouchEvents.push({type,buttons:e.buttons,pointerType:e.pointerType,cancelable:e.cancelable}))});
async function touch(dy){const r=await a.rect('.nv-m-pr-scroll'),x=r.x,y=dy>0?r.top+25:r.bottom-25;await page.cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});for(let i=1;i<=12;i++)await page.cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+dy*i/12,id:1}]});await page.cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await a.settle()}
const before=await a.text('刷新状态');await touch(168);
await page.waitForFunction(()=>document.querySelector('[aria-label="刷新状态"]').textContent.includes('已更新'),undefined,{timeout:3000});
assert.equal(await a.text('刷新状态'),'已更新 · 请求 1 次');
await touch(-168);assert((await a.rect('.nv-m-pr-scroll')).scrollTop>0,'upward touch retains native list scrolling');
assert.equal(await a.text('刷新状态'),'已更新 · 请求 1 次');
await a.wheel('.nv-m-pr-scroll',-2000);assert.equal((await a.rect('.nv-m-pr-scroll')).scrollTop,0);
console.log({before,after:await a.text('刷新状态'),events:await page.evaluate(()=>window.n04TouchEvents),state:await a.state()});
await a.shot('390-light-touch-green');
console.log(await page.snapshot());
