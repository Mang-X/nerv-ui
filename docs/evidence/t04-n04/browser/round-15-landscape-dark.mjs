const task=await taskSpace(9),page=task.page('p1');const {scenario}=await import('/tmp/nerv-ui-t04-n04/browser/scenario-v2.mjs');
await scenario(page,844,390,true,'final-844-dark');console.log(await page.snapshot());
