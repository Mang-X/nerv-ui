import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';import {setup} from './helpers-v2.mjs';
export async function f3(page,width,height,dark,name){
 const records=[];const dest='/tmp/nerv-ui-t04-n04-f3/browser/'+name+'.json';
 const activate=()=>page.evaluate(async()=>{const b=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()==='立即更新');if(!b||b.disabled)throw Error('button unavailable');b.click();await Promise.resolve();await Promise.resolve();return {transform:document.querySelector('.nv-m-pr-inner').style.transform,status:document.querySelector('[aria-label="刷新状态"]').textContent.trim()}});
 const state=()=>page.evaluate(()=>({status:document.querySelector('[aria-label="刷新状态"]').textContent.trim(),text:document.querySelector('[data-slot="pull-refresh"]').textContent,transform:document.querySelector('.nv-m-pr-inner').style.transform,scrollTop:document.querySelector('.nv-m-pr-scroll').scrollTop,events:window.__f3events}));
 for(const input of ['mouse','touch'])for(const mode of ['at-start','above-start','repull','loading','cancel','non-top']){
  await page.reload();const a=await setup(page,width,height);if(await page.evaluate(()=>document.documentElement.classList.contains('dark'))!==dark)await a.click('button[aria-label="切换明暗"]');
  await a.align(height<500?'.nv-m-pr-scroll':'section[aria-labelledby="refresh-title"]');const r=await a.rect('.nv-m-pr-scroll');assert(r.hit);assert.equal(r.scrollTop,0);
  await page.evaluate(()=>{window.__f3events=[];const e=document.querySelector('.nv-m-pr-inner');for(const t of ['pointerdown','pointermove','pointerup','pointercancel'])e.addEventListener(t,event=>window.__f3events.push({type:t,y:event.clientY,pointerType:event.pointerType,trusted:event.isTrusted}),true)});
  const x=r.x,start=r.top+24;let last=start;
  const mouse=(type,y,pressed=false)=>page.cdp('Input.dispatchMouseEvent',{type,x,y,...(type==='mouseMoved'?{buttons:pressed?1:0}:{button:'left',buttons:pressed?1:0,clickCount:1})});
  async function down(){if(input==='touch')await page.cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:start,id:1}]});else{await mouse('mouseMoved',start);await mouse('mousePressed',start,true)}}
  async function move(to){const from=last;for(let i=1;i<=14;i++){const y=from+(to-from)*i/14;if(input==='touch')await page.cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y,id:1}]});else await mouse('mouseMoved',y,true)}last=to;await page.evaluate(()=>new Promise(requestAnimationFrame))}
  async function up(cancel=false){if(input==='touch')await page.cdp('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});else if(cancel){await page.evaluate(()=>document.querySelector('.nv-m-pr-inner').dispatchEvent(new PointerEvent('pointercancel',{bubbles:true})));await mouse('mouseReleased',last)}else await mouse('mouseReleased',last);await a.settle()}
  if(mode==='non-top'){await a.wheel('.nv-m-pr-scroll',100);assert((await state()).scrollTop>0);await down();await a.wheel('.nv-m-pr-scroll',-200);assert.equal((await state()).scrollTop,0)}else await down();
  await move(start+168);const pulled=await state();if(mode!=='non-top')assert(pulled.text.includes('释放立即刷新'));
  await move(start+(mode==='at-start'?0:-10));const retracted=await state();assert.equal(retracted.transform,'translateY(0px)');assert(retracted.text.includes('下拉刷新'));assert.equal(retracted.status,'尚未刷新 · 请求 0 次');
  if(mode==='repull'){await move(start+168);assert((await state()).text.includes('释放立即刷新'));await up();assert((await state()).status.includes('请求 1 次'));await page.waitForFunction(()=>document.querySelector('[aria-label="刷新状态"]').textContent.includes('已更新 · 请求 1 次'),undefined,{timeout:2500})}
  else if(mode==='loading'){const during=await activate();assert.equal(during.transform,'translateY(56px)');assert.equal(during.status,'刷新中 · 请求 1 次');await move(start+168);await up();await page.waitForFunction(()=>document.querySelector('[aria-label="刷新状态"]').textContent.includes('已更新 · 请求 1 次'),undefined,{timeout:2500})}
  else{await up(mode==='cancel');assert.equal((await state()).status,'尚未刷新 · 请求 0 次')}
  await a.settle();const final=await state();assert.equal(final.transform,'translateY(0px)');assert(final.events.every(e=>e.trusted||e.type==='pointercancel'&&input==='mouse'));if(mode==='cancel'&&input==='touch')assert(final.events.some(e=>e.type==='pointercancel'&&e.trusted));
  if(mode==='at-start'||mode==='repull'||mode==='cancel')await a.shot(name+'-'+input+'-'+mode);
  records.push({input,mode,geometry:r,pulled,retracted,final,description:input==='touch'?'CDP synthetic touch, not physical touch':mode==='cancel'?'CDP mouse with DOM pointercancel injection':'CDP mouse down/move/up'});await writeFile(dest,JSON.stringify({name,width,height,dark,records},null,2));
 }
 console.log('PASS '+name+' '+records.length+' cases');return records;
}
