const fs = await import('node:fs/promises');
const task = await taskSpace(29);
const page = task.page('p1');
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
await page.goto('http://127.0.0.1:4178/#touch');
await page.reload();
await page.waitForFunction(()=>[...document.scripts].some(s=>s.src.endsWith('index-CoupmcNx.js')));
await page.waitForSelector('[aria-label="阅读本数回显"]');
console.log(await page.snapshot({scope:'full_page'}));
const matrix=[];
for(const [orientation,width,height] of [['portrait',768,1024],['landscape',1024,768]]) {
  await page.cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
  for(const dark of [false,true]) for(const blue of [false,true]) {
    await page.cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    if(await page.evaluate(()=>document.querySelector('[aria-label="深色模式"]').getAttribute('aria-pressed')==='true')!==dark) await page.click('button[aria-label="深色模式"]');
    if(await page.evaluate(()=>document.querySelector('[aria-label="蓝色强调色"]').getAttribute('aria-pressed')==='true')!==blue) await page.click('button[aria-label="蓝色强调色"]');
    await page.waitForFunction(({dark,blue})=>document.documentElement.classList.contains('dark')===dark&&document.querySelector('[aria-label="蓝色强调色"]').getAttribute('aria-pressed')===String(blue),{dark,blue});
    const result=await page.evaluate(()=>{
      const all=[...document.querySelectorAll('button,a,select,label[for="corner-pulse"]')];
      const targets=[];
      for(const el of all){
        el.scrollIntoView({block:'center',behavior:'instant'});
        const r=el.getBoundingClientRect();
        const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
        targets.push({name:el.getAttribute('aria-label')||el.textContent.trim(),width:r.width,height:r.height,disabled:el.disabled||el.getAttribute('aria-disabled')==='true',hit:hit===el||el.contains(hit)});
      }
      const tileColors=[...document.querySelectorAll('[aria-label="指标语义色"] [data-slot="stat-tile"]')].map(el=>({label:el.querySelector('p').textContent,bg:getComputedStyle(el).backgroundColor,value:getComputedStyle(el.querySelector('p:nth-child(2) span')).color}));
      return {url:location.href,viewport:[innerWidth,innerHeight],dataIdentity:{corner:'R-01',books:document.querySelector('[aria-label="阅读本数回显"]').textContent,duration:document.querySelector('[aria-label="阅读时长回显"]').textContent},mode:document.documentElement.classList.contains('dark')?'dark':'light',accent:localStorage.getItem('nerv-iip-theme'),background:getComputedStyle(document.body).backgroundColor,primary:getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),horizontalOverflow:document.documentElement.scrollWidth>innerWidth,targets,tileColors};
    });
    await fs.writeFile('/tmp/nerv-ui-t03-f1/matrix-latest-attempt.json',JSON.stringify(result,null,2));
    assert(result.viewport[0]===width&&result.viewport[1]===height,'Viewport mismatch');
    assert(!result.horizontalOverflow,'Horizontal overflow');
    assert(result.targets.every(t=>t.width>=44&&t.height>=44),'Target below 44px');
    assert(result.targets.every(t=>t.disabled||t.hit),'Enabled target occluded');
    assert(new Set(result.tileColors.map(t=>t.bg)).size===5,'Tone surfaces collapsed');
    matrix.push({orientation,dark,blue,...result});
    await fs.writeFile('/tmp/nerv-ui-t03-f1/browser-matrix.json',JSON.stringify(matrix,null,2));
    if((orientation==='portrait'&&dark===blue)||(orientation==='landscape'&&dark!==blue)) {
      await page.evaluate(()=>scrollTo(0,0));
      // Screenshots are captured separately after restoring the native window.
    }
    console.log({orientation,dark,blue,viewport:result.viewport,targets:result.targets.length,minimumHeight:Math.min(...result.targets.map(t=>t.height)),pass:true});
  }
}
console.log(await page.snapshot());
