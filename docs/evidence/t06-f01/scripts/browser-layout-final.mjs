const fs=await import('node:fs/promises');const task=await taskSpace(26),page=task.page('p1'),out='/tmp/nerv-ui-t06-f01/raw';const records=[];const assert=(v,m)=>{if(!v)throw Error(m)};
await page.goto('http://127.0.0.1:5197/#files');await page.reload();await page.waitForFunction(()=>document.querySelector('img')?.naturalWidth>0);
const html=await fs.readFile('/Users/mang/Project/nerv-ui-worktrees/t06-f01-files-host/frontend/apps/playground/dist/index.html','utf8');const expectedJs=html.match(/src="([^"]+index-[^"]+\.js)"/)[1];const expectedCss=html.match(/href="([^"]+index-[^"]+\.css)"/)[1];const asset=await page.evaluate(()=>({js:document.querySelector('script[type=module]')?.src,css:document.querySelector('link[rel=stylesheet]')?.href}));if(!asset.js.endsWith(expectedJs)||!asset.css.endsWith(expectedCss))throw Error('final asset identity mismatch');
const syncfs=await import('node:fs');records.push=function(...items){const n=Array.prototype.push.apply(this,items);syncfs.writeFileSync(out+'/prod-layout-routes.json',JSON.stringify(this,null,2));return n};
const measure=()=>page.evaluate(()=>{const h=document.documentElement;return {width:innerWidth,height:innerHeight,scrollWidth:h.scrollWidth,zoom:visualViewport.scale,dpr:devicePixelRatio,dark:h.classList.contains('dark'),brand:getComputedStyle(h).getPropertyValue('--nv-brand'),background:getComputedStyle(document.body).backgroundColor,focused:document.activeElement?.outerHTML.slice(0,220),overflows:[...document.querySelectorAll('main *')].filter(e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e);return b.width>0&&b.right>innerWidth+1&&s.position!=='absolute'&&s.position!=='fixed'}).slice(0,8).map(e=>({tag:e.tagName,slot:e.dataset.slot,text:e.textContent.slice(0,50),box:e.getBoundingClientRect().toJSON()}))}});
for(const [width,height] of [[1920,1080],[1366,900],[390,844]]){
 await page.cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
 for(const [dark,blue] of [[false,false],[false,true],[true,false],[true,true]]){
  if(await page.evaluate(()=>document.documentElement.classList.contains('dark'))!==dark)await page.click(dark?'button:text-is("切换暗色")':'button:text-is("切换亮色")');
  const isBlue=await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='蓝色强调色').getAttribute('aria-pressed')==='true');
  if(isBlue!==blue)await page.click('button:text-is("蓝色强调色")');
  await page.focus('select[aria-label="上传排列方式"]');await page.keyboard.press('Tab');
  const m=await measure();assert(m.scrollWidth===width,`viewport overflow ${width}`);assert(m.focused.includes('可选文件类型'),'keyboard focus follows visual order');
  records.push({label:`${width} ${dark?'dark':'light'} ${blue?'blue':'neutral'}`,...m});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${out}/prod-${width}-${dark?'dark':'light'}-${blue?'blue':'neutral'}.png`,fullPage:width===390});
 }
}
// Seven layouts at a narrow desktop viewport, using actual local file input and image decoding.
for(const variant of ['default','queue','compact','avatar','gallery','table','image']){
 await page.selectOption('select[aria-label="上传排列方式"]',variant);await page.setInputFiles('[data-slot="file-upload"] input[type=file]',['/Users/mang/Project/nerv-ui-worktrees/t06-f01-files-host/frontend/apps/playground/public/files/garden.png']);await page.waitForFunction(()=>document.querySelector('[data-slot="file-upload-thumbnail"]')?.naturalWidth===640);
 const m=await measure();assert(m.scrollWidth===390,'narrow variant page overflow '+variant);const hit=await page.evaluate(()=>{const b=document.querySelector('[data-slot="file-upload-dropzone"]')||document.querySelector('[data-file-upload-button]');b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return {box:r.toJSON(),hit:b.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}});assert(hit.hit,'picker hit '+variant);records.push({label:`390 variant ${variant}`,...m,hit});await page.click('button:text-is("清空文件")');
}
// Actual root color schemes coexist with the existing reduced-motion preference.
await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});records.push({label:'reduced motion',matches:await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)});await page.selectOption('select[aria-label="预览内容"]','png');await page.waitForFunction(()=>document.querySelector('[data-testid="file-preview-image"]')?.naturalWidth===640);await page.screenshot({path:out+'/prod-reduced-motion.png',fullPage:true});await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
// All completed groups keep their real hash links and return to the files page.
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});
for(const hash of ['#desktop','#touch','#mobile','#mobile-input','#mobile-overlays','#mobile-lists','#mobile-feedback','#screen/stage','#screen/controls','#screen/indicators','#screen/data','#screen/charts','#screen/tables','#screen/summary']){
 await page.click(`a[href="${hash}"]`);await page.waitForFunction(h=>location.hash===h,hash);await page.waitForSelector('a[href="#files"]');const heading=await page.evaluate(()=>document.querySelector('h1')?.textContent);await page.click('a[href="#files"]');await page.waitForFunction(()=>document.querySelector('h1')?.textContent==='留住片刻');records.push({label:'round trip',hash,heading,returned:true});
}
await fs.writeFile(out+'/prod-layout-routes.json',JSON.stringify(records,null,2));console.log({records:records.length,viewports:3,themes:4,variants:7,roundTrips:14});console.log(await page.snapshot());
