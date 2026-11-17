const task=await taskSpace(78),page=task.page('p1');
await page.click('loc=role:button[name="显示或收起参考图"]');
await page.waitForFunction(()=>document.querySelectorAll('[data-engine="dhtmlx"]').length===2);
await page.click('button[aria-label="时间刻度"]');
console.log(await page.snapshot({scope:'full_page'}));
