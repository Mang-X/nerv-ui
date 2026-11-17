const task=await taskSpace(9); const page=task.page('p1');
console.log(await page.cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false}));
console.log(await page.evaluate(()=>({w:innerWidth,h:innerHeight,dpr:devicePixelRatio})));
console.log(await page.cdp('Browser.getWindowForTarget'));
console.log(await page.snapshot());
console.log({screenshot:await page.screenshot({path:'/tmp/nerv-ui-t04-n04/browser/390-light-top-corrected.png'})});
