import assert from 'node:assert/strict';import fs from 'node:fs/promises';const p=(await taskSpace(15)).page('p1');const rows=[];
for(const [width,height,dark] of [[390,844,false],[844,390,false],[844,390,true],[390,844,true]]){
 await p.reload();await p.cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
 if(await p.evaluate(()=>document.documentElement.classList.contains('dark'))!==dark)await p.click('[aria-label="切换明暗"]');
 await p.hover('[aria-label="移除标签"]');
 const r=await p.evaluate(()=>{const b=document.querySelector('[aria-label="移除标签"]'),rect=b.getBoundingClientRect(),x=rect.x+rect.width/2,y=rect.y+rect.height/2,hit=document.elementFromPoint(x,y);return {rect:rect.toJSON(),x,y,hit:hit===b||b.contains(hit),viewport:[innerWidth,innerHeight],overflow:document.documentElement.scrollWidth>innerWidth,scrollParent:{top:document.querySelector('[data-shell="content"]').scrollTop,overflow:getComputedStyle(document.querySelector('[data-shell="content"]')).overflowY}}});
 assert.deepEqual(r.viewport,[width,height]);assert(r.hit);assert(!r.overflow);assert(r.rect.width>=44&&r.rect.height>=44);
 await p.click('[aria-label="移除标签"]');assert.equal(await p.evaluate(()=>document.querySelector('[aria-label="标签回显"]').textContent.trim()),'已移除「周末」');rows.push({width,height,dark,...r});
}
await fs.writeFile('/tmp/nerv-ui-t04-n05/browser/hits.json',JSON.stringify(rows,null,2));console.log(rows);
