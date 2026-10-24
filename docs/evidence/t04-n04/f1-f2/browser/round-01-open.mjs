const task=await taskSpace('nerv-ui N04 F1 F2 20261024');const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
await page.goto('http://127.0.0.1:4186/#mobile-lists');console.log({spaceId:task.spaceId,page:page.label});console.log(await page.snapshot({scope:'full_page'}));
