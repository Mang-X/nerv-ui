const task=await taskSpace(9),page=task.page('p1');const {setup}=await import('/tmp/nerv-ui-t04-n04/browser/helpers.mjs');const a=await setup(page);
console.log({state:await a.state(),r:await a.rect('.nv-m-pr-scroll'),events:await page.evaluate(()=>window.n04TouchEvents)});
console.log(await page.snapshot());
