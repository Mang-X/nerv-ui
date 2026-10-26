const fs=await import('node:fs/promises'),assert=(await import('node:assert/strict')).default;
const task=await taskSpace(78),page=task.page('p1'),out=[];
for(const [i,label] of ['小时','日','周','月'].entries()) {
  if(i>0) await page.click('button[aria-label="时间刻度"]');
  await page.click(`loc=role:listboxoption[name="${label}"]`);
  await page.waitForFunction(()=>!document.querySelector('[role="listbox"]'));
  const data=await page.evaluate(()=>{
    const chart=document.querySelector('[data-seat="panels"]'),ref=document.querySelector('[data-seat="panels-reference"]');
    const read=(root,legend)=>({cells:[...root.querySelectorAll('.gantt_scale_line:last-child .gantt_scale_cell')].map(e=>e.textContent),
      shift:root.querySelectorAll('.nerv-shift-start,.nv-scheduling-shift-boundary').length,
      block:root.querySelectorAll('.nerv-cell-block,.nv-scheduling-block-window').length,
      offwork:root.querySelectorAll('.nerv-offwork,.nv-scheduling-offwork').length,legend:legend?.textContent,engine:root.querySelector('[data-engine]')?.getAttribute('data-engine')});
    return {scale:document.querySelector('button[aria-label="时间刻度"]').textContent,order:read(chart,chart.nextElementSibling),resource:read(ref,ref.querySelector('.border-t'))};
  });
  data.label=label;out.push(data);
  assert.equal(data.order.engine,'dhtmlx');assert.equal(data.resource.engine,'dhtmlx');
  assert.equal(data.order.legend.includes('班次边界'),data.order.shift>0);
  assert.equal(data.order.legend.includes('空间整理'),data.order.block>0);
  assert.ok(data.resource.shift>0);assert.ok(data.resource.block>0);
}
await fs.writeFile('/Users/mang/Project/nerv-ui-worktrees/t07-p08-panels/docs/evidence/t07-p08/raw/phase-four-scales-dev.json',JSON.stringify(out,null,2));
console.log(out);console.log(await page.snapshot());
