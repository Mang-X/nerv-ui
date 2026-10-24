import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {setup} from './helpers-v2.mjs'
export async function targeted(page,width,height,dark,name){
 const records=[];const file='/tmp/nerv-ui-t04-n04-fix/browser/'+name+'.json';
 async function save(caseName,extra={}) {records.push({case:caseName,...extra});await writeFile(file,JSON.stringify({name,width,height,dark,records},null,2))}
 const activate=text=>page.evaluate(async text=>{const b=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===text);if(!b||b.disabled)throw Error('Unavailable button '+text);b.click();await new Promise(requestAnimationFrame)},text)
 async function reset(){await page.reload();const a=await setup(page,width,height);if(await page.evaluate(()=>document.documentElement.classList.contains('dark'))!==dark)await a.click('button[aria-label="切换明暗"]');return a}
 const mouse=(type,x,y,pressed=false)=>page.cdp('Input.dispatchMouseEvent',{type,x,y,...(type==='mouseMoved'?{buttons:pressed?1:0}:{button:'left',buttons:pressed?1:0,clickCount:1})});
 for(const direction of ['forward','backward']){
  const a=await reset();if(direction==='backward'){await activate('下一页');await activate('下一页')}
  await a.align('[data-slot="swiper"]');const r=await a.rect('.nv-m-swiper-viewport');assert(r.hit);const dx=direction==='forward'?-20:20,x=r.x,y=r.top+50;
  await mouse('mouseMoved',x,y);await mouse('mousePressed',x,y,true);await mouse('mouseMoved',x+dx,y,true);
  await activate(direction==='forward'?'下一页':'上一页');
  const before=await page.evaluate(()=>({state:document.querySelector('[aria-label="轮播状态"]').textContent.trim(),style:document.querySelector('.nv-m-swiper-track').style.transform,width:document.querySelector('.nv-m-swiper-viewport').offsetWidth}));
  assert.equal(before.state,'第 2 / 3 页 · 切换 0 次');assert.equal(before.style,`translate3d(${-before.width}px, 0px, 0px)`);
  await mouse('mouseReleased',x+dx,y);await a.settle();assert.equal(await a.text('轮播状态'),'第 2 / 3 页 · 切换 1 次');
  assert.equal(await page.evaluate(()=>document.querySelector('.nv-m-swiper-track').style.transform),before.style);
  await a.shot(name+'-swiper-'+direction);await a.drag('.nv-m-swiper-viewport',(direction==='forward'?-1:1)*r.width*0.4);
  assert.equal(await a.text('轮播状态'),`第 ${direction==='forward'?3:1} / 3 页 · 切换 2 次`);
  await save('F1 '+direction,{before,after:await a.text('轮播状态'),geometry:r,input:'CDP mouse down/move/up plus public DOM button.click for external index; no private component state'});
 }
 for(const mode of ['release-loading','touch-cancel-loading','complete-before-release']){
  const a=await reset();await a.align(height<500?'.nv-m-pr-scroll':'section[aria-labelledby="refresh-title"]');const r=await a.rect('.nv-m-pr-scroll');assert(r.hit);assert.equal(r.scrollTop,0);const x=r.x,y=r.top+24,dy=168;
  if(mode==='touch-cancel-loading'){
   await page.cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
   for(let i=1;i<=6;i++)await page.cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+dy*i/6,id:1}]});
  }else{await mouse('mouseMoved',x,y);await mouse('mousePressed',x,y,true);await mouse('mouseMoved',x,y+dy,true)}
  assert((await page.evaluate(()=>document.querySelector('[data-slot="pull-refresh"]').textContent)).includes('释放立即刷新'));
  await activate('立即更新');
  const during=await page.evaluate(()=>({state:document.querySelector('[aria-label="刷新状态"]').textContent.trim(),text:document.querySelector('[data-slot="pull-refresh"]').textContent,style:document.querySelector('.nv-m-pr-inner').style.transform,disabled:[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='立即更新').disabled}));
  assert.equal(during.state,'刷新中 · 请求 1 次');assert(during.text.includes('刷新中'));assert.equal(during.style,'translateY(56px)');assert(during.disabled);
  if(mode==='complete-before-release')await page.waitForFunction(()=>document.querySelector('[aria-label="刷新状态"]').textContent.includes('已更新'),undefined,{timeout:2500});
  if(mode==='touch-cancel-loading')await page.cdp('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  else await mouse('mouseReleased',x,y+dy);
  const released=await a.text('刷新状态');assert(released.includes('请求 1 次'));
  await page.waitForFunction(()=>document.querySelector('[aria-label="刷新状态"]').textContent.includes('已更新'),undefined,{timeout:2500});await a.settle();
  assert.equal(await page.evaluate(()=>document.querySelector('.nv-m-pr-inner').style.transform),'translateY(0px)');
  await a.shot(name+'-pull-'+mode);await a.drag('.nv-m-pr-scroll',0,168);
  await page.waitForFunction(()=>document.querySelector('[aria-label="刷新状态"]').textContent.includes('已更新 · 请求 2 次'),undefined,{timeout:2500});await a.settle();
  await save('F2 '+mode,{during,released,after:await a.text('刷新状态'),geometry:r,input:mode==='touch-cancel-loading'?'CDP synthetic touch and touchCancel plus public DOM button.click':'CDP mouse and public DOM button.click'});
 }
 console.log('PASS '+name+' '+records.length+' targeted cases');return records
}
