const fs=await import('node:fs/promises'); const task=await taskSpace(78),page=task.page('p1');
await page.reload(); await page.waitForSelector('[data-engine="dhtmlx"]');
const result=await page.evaluate(()=>({url:location.href,shift:document.querySelectorAll('.nerv-shift-start').length,block:document.querySelectorAll('.nerv-cell-block').length,
  legend:[...document.querySelectorAll('.nerv-leg-items')].map(e=>e.textContent),scale:[...document.querySelectorAll('.gantt_scale_line:last-child .gantt_scale_cell')].map(e=>e.textContent)}));
await fs.writeFile('/Users/mang/Project/nerv-ui-worktrees/t07-p08-panels/docs/evidence/t07-p08/raw/phase-green-dev.json',JSON.stringify(result,null,2));
console.log(result); console.log(await page.snapshot());
