import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
export function actions(page,width,height){
 const settle=()=>page.evaluate(async()=>{await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));await Promise.all(document.getAnimations().filter(a=>a.effect?.getComputedTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));return true;});
 const size=()=>page.evaluate(()=>[innerWidth,innerHeight]);
 const rect=async selector=>{await page.evaluate(s=>(()=>{const el=document.querySelector(s);if(!el)throw new Error('Missing target '+s);el.scrollIntoView({block:'center',behavior:'instant'});})(),selector);await settle();return page.evaluate(s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};},selector)};
 const click=async(selector,fraction=.5)=>{console.log('click',selector);const r=await rect(selector);const x=r.x+r.width*fraction,y=r.y+r.height/2;await page.cdp('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});await page.cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});await settle();assert.deepEqual(await size(),[width,height]);};
 const key=async(key,virtual,code=key,modifiers=0)=>{await page.cdp('Input.dispatchKeyEvent',{type:'rawKeyDown',key,code,windowsVirtualKeyCode:virtual,modifiers});await page.cdp('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:virtual,modifiers});await settle();};
 const type=async text=>{await page.cdp('Input.insertText',{text});await settle();};
 const text=s=>page.evaluate(s=>document.querySelector(s)?.textContent?.trim(),s);
 const shot=async name=>{assert.deepEqual(await size(),[width,height]);const shot=await page.cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(`/Users/mang/Project/nerv-ui-worktrees/t04-n02-mobile-input/docs/evidence/t04-n02/${name}.png`,Buffer.from(shot.data,'base64'));};
 return {settle,size,rect,click,key,type,text,shot};
}
