const task = await taskSpace('nerv-ui N05 feedback 20261024');
const p = task.page('p1');
console.log({spaceId:task.spaceId});
await p.cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
await p.goto('http://127.0.0.1:4185/#mobile-feedback');
console.log(await p.snapshot({scope:'full_page'}));
await p.screenshot({path:'/tmp/nerv-ui-t04-n05/browser/initial.png'});
console.log(await p.evaluate(()=>({viewport:[innerWidth,innerHeight],overflow:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll('button')].map(b=>({text:b.textContent.trim(),label:b.getAttribute('aria-label'),w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}))})));
