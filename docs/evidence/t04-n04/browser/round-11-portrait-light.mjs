const task=await taskSpace(9),page=task.page('p1');const {scenario}=await import('/tmp/nerv-ui-t04-n04/browser/scenario.mjs');
await scenario(page,390,844,false,'final-390-light');console.log(await page.snapshot());
