const task=await taskSpace(9); const page=task.page('p1');
help('page.mouse.move'); help('page.mouse.down'); help('page.mouse.up'); help('page.mouse.wheel');
if(await page.evaluate(()=>document.documentElement.classList.contains('dark'))) await page.click('button[aria-label="切换明暗"]');
console.log(await page.evaluate(()=>({viewport:[innerWidth,innerHeight],overflow:document.documentElement.scrollWidth>innerWidth,main:[...document.querySelectorAll('[data-shell="content"]')].map(e=>({height:e.clientHeight,scrollHeight:e.scrollHeight,overflow:getComputedStyle(e).overflowY})),scrollers:[...document.querySelectorAll('.nv-m-pr-scroll,[data-slot="infinite-list"],[data-slot="virtual-list"]')].map(e=>({class:e.className,height:e.clientHeight,scrollHeight:e.scrollHeight,overflow:getComputedStyle(e).overflowY,rect:e.getBoundingClientRect().toJSON()}))})));
console.log({screenshot:await page.screenshot({path:'/tmp/nerv-ui-t04-n04/browser/390-light-top.png'})});
console.log(await page.snapshot());
