const fs = await import('node:fs/promises');
const task=await taskSpace(78), page=task.page('p1');
const result=await page.evaluate(()=>({url:location.href,engine:document.querySelector('[data-engine]')?.getAttribute('data-engine'),
  scale:[...document.querySelectorAll('[data-seat="panels"] .gantt_scale_line:last-child .gantt_scale_cell')].map(e=>({text:e.textContent,title:e.getAttribute('aria-label')})),
  shiftCells:document.querySelectorAll('[data-seat="panels"] .nerv-shift-start').length,
  legend:[...document.querySelectorAll('.nerv-leg-items')].map(e=>e.textContent),
  baselines:document.querySelectorAll('[data-seat="panels"] .nerv-baseline').length,
  blockCells:document.querySelectorAll('[data-seat="panels"] .nerv-cell-block').length,
  timezone:Intl.DateTimeFormat().resolvedOptions().timeZone}));
await fs.writeFile('/Users/mang/Project/nerv-ui-worktrees/t07-p08-panels/docs/evidence/t07-p08/raw/phase-red.json',JSON.stringify(result,null,2));
console.log(result);
console.log(await page.screenshot({path:'/Users/mang/Project/nerv-ui-worktrees/t07-p08-panels/docs/evidence/t07-p08/screenshots/phase-red.png'}));
