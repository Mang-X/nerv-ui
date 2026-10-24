const task=await taskSpace(9),page=task.page('p1');const {scenario}=await import('/tmp/nerv-ui-t04-n04/browser/scenario.mjs');
await scenario(page,390,844,true,'final-390-dark');console.log(await page.snapshot());
