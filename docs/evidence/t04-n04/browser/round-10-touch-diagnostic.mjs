const task=await taskSpace(9),page=task.page('p1');const {setup}=await import('/tmp/nerv-ui-t04-n04/browser/helpers.mjs');const a=await setup(page);
console.log('before-wait',await page.evaluate(()=>[innerWidth,innerHeight]));await page.waitForFunction(()=>true);console.log('after-wait',await page.evaluate(()=>[innerWidth,innerHeight]));
await setup(page);await a.align('.nv-m-pr-scroll');await a.settle();const r=await a.rect('.nv-m-pr-scroll'),x=r.x,y=r.bottom-25;console.log('touch-start',r,{x,y},await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.outerHTML.slice(0,200),{x,y}));
await page.cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});for(let i=1;i<=12;i++)await page.cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-168*i/12,id:1}]});await page.cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await a.settle();
console.log('after',await a.rect('.nv-m-pr-scroll'),await page.evaluate(()=>window.n04TouchEvents),await a.state());
console.log(await page.snapshot());
