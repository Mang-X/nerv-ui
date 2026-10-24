const fs=await import('node:fs/promises'),crypto=await import('node:crypto');
const task=await taskSpace(29),page=task.page('p1');
const assert=(v,m)=>{if(!v)throw Error(m)};
await page.click('button[aria-label="重置阅读设置"]');
await page.focus('[role="tab"]:text-is("阅读")');
const keyboard=[];
for(const[key,expected]of[['End','休息'],['Home','阅读'],['ArrowRight','聆听'],['ArrowLeft','阅读']]){
 await page.keyboard.press(key);
 const state=await page.evaluate(()=>({focused:document.activeElement.textContent,selected:document.querySelector('[role="tab"][aria-selected="true"]').textContent,tabStops:[...document.querySelectorAll('[role="tab"][tabindex="0"]')].map(t=>t.textContent)}));
 assert(state.focused===expected&&state.selected===expected&&JSON.stringify(state.tabStops)===JSON.stringify([expected]),'Playground keyboard '+key);
 keyboard.push({key,...state});
}
const urls=await page.evaluate(()=>[...new Set([...performance.getEntriesByType('resource').map(r=>r.name),...document.scripts].map(r=>typeof r==='string'?r:r.src).filter(url=>url.startsWith(location.origin+'/assets/')))]);
const responses=[];
await fs.mkdir('/tmp/nerv-ui-t03-f1/responses',{recursive:true});
for(const url of urls){
 const name=new URL(url).pathname.split('/').at(-1),path='/tmp/nerv-ui-t03-f1/responses/'+name;
 const response=await page.fetch(url,{saveAs:path});
 const actual=crypto.createHash('sha256').update(await fs.readFile(path)).digest('hex');
 const expected=crypto.createHash('sha256').update(await fs.readFile('/tmp/nerv-ui-t03-f1/served/assets/'+name)).digest('hex');
 assert(response.status===200&&actual===expected,'Response identity '+name);
 responses.push({url,status:response.status,sha256:actual,matchesBuiltFile:true});
}
await fs.writeFile('/tmp/nerv-ui-t03-f1/browser-responses.json',JSON.stringify({keyboard,responses},null,2));
const shots=[];
for(const[name,width,height,dark,blue]of[['portrait-light',768,1024,false,false],['landscape-dark',1024,768,true,true]]){
 if(await page.evaluate(()=>document.documentElement.classList.contains('dark'))!==dark)await page.click('button[aria-label="深色模式"]');
 if(await page.evaluate(()=>document.querySelector('[aria-label="蓝色强调色"]').getAttribute('aria-pressed')==='true')!==blue)await page.click('button[aria-label="蓝色强调色"]');
 await page.cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
 await page.evaluate(()=>scrollTo(0,0));
 const state=await page.evaluate(()=>({viewport:[innerWidth,innerHeight],mode:document.documentElement.classList.contains('dark')?'dark':'light',theme:localStorage.getItem('nerv-iip-theme'),scripts:[...document.scripts].map(s=>s.src).filter(s=>s.includes('/assets/'))}));
 assert(state.viewport[0]===width&&state.viewport[1]===height,'Screenshot viewport');
 const path=await page.screenshot({path:'/tmp/nerv-ui-t03-f1/'+name+'.png',fullPage:true});
 shots.push({name,path,...state});
 await fs.writeFile('/tmp/nerv-ui-t03-f1/screenshots.json',JSON.stringify(shots,null,2));
}
console.log({keyboard,resources:responses.length,allResourceBytesMatch:true,screenshots:shots});
console.log(await page.snapshot());
